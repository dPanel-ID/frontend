import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { LogPageResult } from '../lib/log-download';
import {
  LOG_WINDOW_MAX_PAGES,
  canLoadNewer,
  canLoadOlder,
  newestLoadedPage,
  oldestLoadedPage,
  windowTotal,
  withNewerPage,
  withOlderPage,
} from '../lib/log-window';
import type { LogWindowPage, LogWindowPages } from '../lib/log-window';

export type LogWindowStatus = 'unavailable' | 'loading' | 'failed' | 'ready';

interface UseLogWindowOptions {
  /** Fetches one page of the current window; page 1 is the newest. */
  fetchPage: (page: number, signal: AbortSignal) => Promise<LogPageResult>;
  /**
   * Changes whenever the window does (range, anchor, source). The list then
   * starts over from the newest page, keeping the old lines on screen until
   * the new ones arrive.
   */
  windowKey: string;
  disabled?: boolean;
  maxPages?: number;
}

/**
 * Pages of one log window for an infinite list: the newest page first, then
 * older pages above and, after scrolling back, newer pages below, never more
 * than `maxPages` at once.
 */
export function useLogWindow(options: UseLogWindowOptions) {
  const {
    disabled = false,
    fetchPage,
    maxPages = LOG_WINDOW_MAX_PAGES,
    windowKey,
  } = options;

  const [pages, setPages] = useState<LogWindowPages>([]);
  const [failed, setFailed] = useState(false);
  const [isResetting, setIsResetting] = useState(!disabled);
  const [loading, setLoading] = useState<'older' | 'newer' | null>(null);
  const [edgeError, setEdgeError] = useState<'older' | 'newer' | null>(null);
  const [query, setQuery] = useState<{ query?: string; errors: string[] }>({
    errors: [],
  });

  // A new window starts over: reset during render, before its fetch lands.
  const [currentWindow, setCurrentWindow] = useState(windowKey);
  if (currentWindow !== windowKey) {
    setCurrentWindow(windowKey);
    setLoading(null);
    setEdgeError(null);
    setFailed(false);
    setIsResetting(!disabled);
  }

  const fetchPageRef = useRef(fetchPage);
  const pagesRef = useRef(pages);
  // Read by callbacks and effects; kept current before any of them run.
  useLayoutEffect(() => {
    fetchPageRef.current = fetchPage;
    pagesRef.current = pages;
  });
  // One controller per window: changing the window cancels its requests.
  const windowAbortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const controller = new AbortController();
    windowAbortRef.current = controller;
    loadingRef.current = false;

    fetchPageRef
      .current(1, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setPages([toWindowPage(1, result)]);
        setQuery({ query: result.query, errors: result.queryErrors ?? [] });
        setFailed(false);
      })
      .catch(() => {
        // A failed refresh keeps the lines already on screen.
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsResetting(false);
      });

    return () => controller.abort();
  }, [disabled, windowKey]);

  const status: LogWindowStatus = disabled
    ? 'unavailable'
    : pages.length > 0
      ? 'ready'
      : failed
        ? 'failed'
        : 'loading';

  const loadEdge = useCallback(
    (edge: 'older' | 'newer') => {
      const current = pagesRef.current;
      const controller = windowAbortRef.current;
      if (!controller || controller.signal.aborted || loadingRef.current)
        return;
      if (edge === 'older' ? !canLoadOlder(current) : !canLoadNewer(current)) {
        return;
      }

      const target =
        edge === 'older'
          ? (oldestLoadedPage(current)?.page ?? 0) + 1
          : (newestLoadedPage(current)?.page ?? 2) - 1;

      loadingRef.current = true;
      setLoading(edge);
      setEdgeError(null);
      fetchPageRef
        .current(target, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          const page = toWindowPage(target, result);
          setPages((prev) =>
            edge === 'older'
              ? withOlderPage(prev, page, maxPages)
              : withNewerPage(prev, page, maxPages),
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setEdgeError(edge);
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          loadingRef.current = false;
          setLoading(null);
        });
    },
    [maxPages],
  );

  const loadOlder = useCallback(() => loadEdge('older'), [loadEdge]);
  const loadNewer = useCallback(() => loadEdge('newer'), [loadEdge]);

  return {
    pages: disabled ? [] : pages,
    status,
    /** The window is being replaced; the old lines stay until it lands. */
    isResetting,
    loading,
    edgeError,
    query: query.query,
    queryErrors: query.errors,
    total: windowTotal(pages),
    hasOlder: canLoadOlder(pages),
    hasNewer: canLoadNewer(pages),
    loadOlder,
    loadNewer,
  };
}

export type LogWindowState = ReturnType<typeof useLogWindow>;

function toWindowPage(page: number, result: LogPageResult): LogWindowPage {
  return {
    page,
    entries: result.entries,
    hasMore: result.hasMore,
    total: result.total,
  };
}
