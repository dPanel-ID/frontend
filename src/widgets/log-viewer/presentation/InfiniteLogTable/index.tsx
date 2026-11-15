import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ArrowDownIcon, RotateCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  LogEntryDetails,
  useServerLogEntrySidepanel,
} from '@/features/server-log-entry-sidepanel';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { LogTableHeader, LogTableRow } from '../LogTable/LogRow';

export interface InfiniteLogPage {
  page: number;
  /** Oldest first; already narrowed by the search and level filters. */
  rows: ParsedLogLine[];
}

interface InfiniteLogTableProps {
  ariaLabel: string;
  /** Oldest page first, the order they read top to bottom. */
  pages: InfiniteLogPage[];
  timeZoneLabel?: string;
  nowMs: number;
  hasOlder: boolean;
  hasNewer: boolean;
  loading: 'older' | 'newer' | null;
  edgeError: 'older' | 'newer' | null;
  /** A new window: jump to its newest line and follow it again. */
  windowKey: string;
  onLoadOlder: () => void;
  onLoadNewer: () => void;
  /** Called when the reader starts or stops following the newest line. */
  onFollowChange: (following: boolean) => void;
  /** Jump back to the newest lines. */
  onJumpToLatest: () => void;
  entryDetails?: 'sidepanel' | 'inline';
  /**
   * Load older lines by itself while the list is too short to scroll. Off
   * while a filter hides lines: a filter that matches nothing would otherwise
   * read the whole time range page after page.
   */
  autoFill?: boolean;
  className?: string;
}

/** Load the next page this far before the reader reaches the edge. */
const PREFETCH_MARGIN_PX = 600;
const FOLLOW_THRESHOLD_PX = 24;

interface ScrollAnchor {
  key: string;
  offset: number;
}

/**
 * Log lines read like a terminal: the newest at the bottom, older lines
 * loaded as the reader scrolls up, until the start of the time range.
 *
 * Two sentinels watched by an IntersectionObserver load the next page before
 * either edge comes into view. Only a few pages stay rendered: scrolling far
 * up unloads the newest pages and scrolling back down loads them again, so a
 * long session never piles up rows. When pages are added or removed above
 * the reader, the row they were reading stays where it was on screen.
 */
export default function InfiniteLogTable(props: InfiniteLogTableProps) {
  const {
    ariaLabel,
    autoFill = true,
    className,
    edgeError,
    entryDetails = 'sidepanel',
    hasNewer,
    hasOlder,
    loading,
    nowMs,
    onFollowChange,
    onJumpToLatest,
    onLoadNewer,
    onLoadOlder,
    pages,
    timeZoneLabel,
    windowKey,
  } = props;

  const t = useDevetekTranslations('common.logViewer.infinite');
  const [openLogEntrySidepanel] = useServerLogEntrySidepanel();
  const [expandedId, setExpandedId] = useState<string>();

  const viewportRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const anchorRef = useRef<ScrollAnchor | null>(null);
  // Which way the reader last scrolled. Each edge only loads after the reader
  // heads towards it, once per gesture, so the two edges can never load and
  // unload each other on their own. Scrolls the list makes itself (keeping
  // the reader's place) do not count.
  const lastScrollTopRef = useRef(0);
  const directionRef = useRef<'up' | 'down' | 'none'>('none');
  const ownScrollRef = useRef(false);
  // Whether each edge is within the prefetch margin, as last observed.
  const nearTopRef = useRef(false);
  const nearBottomRef = useRef(false);
  const [following, setFollowing] = useState(true);

  // The latest handlers, read by the long-lived observer.
  const handlersRef = useRef({
    onLoadOlder,
    onLoadNewer,
    hasOlder,
    hasNewer,
    autoFill,
  });
  useEffect(() => {
    handlersRef.current = {
      onLoadOlder,
      onLoadNewer,
      hasOlder,
      hasNewer,
      autoFill,
    };
  });

  const setFollowingState = (next: boolean) => {
    if (followingRef.current === next) return;
    followingRef.current = next;
    setFollowing(next);
    onFollowChange(next);
  };

  /** Remembers the first row in view, to put it back after a page change. */
  const recordAnchor = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const top = viewport.getBoundingClientRect().top;
    const rows = viewport.querySelectorAll<HTMLElement>('[data-log-row]');
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (rect.bottom > top) {
        anchorRef.current = {
          key: row.dataset.logRow ?? '',
          offset: rect.top - top,
        };
        return;
      }
    }
    anchorRef.current = null;
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (ownScrollRef.current) {
      ownScrollRef.current = false;
    } else if (viewport.scrollTop !== lastScrollTopRef.current) {
      directionRef.current =
        viewport.scrollTop < lastScrollTopRef.current ? 'up' : 'down';
    }
    lastScrollTopRef.current = viewport.scrollTop;
    const distanceToEnd =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setFollowingState(
      !handlersRef.current.hasNewer && distanceToEnd <= FOLLOW_THRESHOLD_PX,
    );
    recordAnchor();
  };

  // A new window starts at its newest line, following it. The state is
  // adjusted during render; the refs and the parent are updated in the effect.
  const [followWindowKey, setFollowWindowKey] = useState(windowKey);
  if (followWindowKey !== windowKey) {
    setFollowWindowKey(windowKey);
    setFollowing(true);
  }
  useEffect(() => {
    followingRef.current = true;
    directionRef.current = 'none';
    onFollowChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on a new window
  }, [windowKey]);

  // Keep the reader's place when pages change: at the bottom while
  // following, otherwise on the row they were reading.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scrollTo = (value: number) => {
      if (Math.round(value) === Math.round(viewport.scrollTop)) return;
      ownScrollRef.current = true;
      viewport.scrollTop = value;
    };

    if (followingRef.current && !hasNewer) {
      scrollTo(viewport.scrollHeight - viewport.clientHeight);
      return;
    }

    const anchor = anchorRef.current;
    if (!anchor) return;
    const row = viewport.querySelector<HTMLElement>(
      `[data-log-row="${anchor.key}"]`,
    );
    if (!row) return;
    const top = viewport.getBoundingClientRect().top;
    scrollTo(
      viewport.scrollTop +
        row.getBoundingClientRect().top -
        top -
        anchor.offset,
    );
  }, [pages, hasNewer]);

  // Load the next page just before either edge scrolls into view. The
  // sentinels are observed again whenever pages change, which re-checks an
  // edge that is still in view after a short page.
  useEffect(() => {
    const viewport = viewportRef.current;
    const top = topSentinelRef.current;
    const bottom = bottomSentinelRef.current;
    if (!viewport || !top || !bottom) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === top) nearTopRef.current = entry.isIntersecting;
          if (entry.target === bottom) {
            nearBottomRef.current = entry.isIntersecting;
          }
          if (!entry.isIntersecting) continue;
          const handlers = handlersRef.current;
          const unfilled = viewport.scrollHeight <= viewport.clientHeight;
          if (
            entry.target === top &&
            handlers.hasOlder &&
            (directionRef.current === 'up' || (unfilled && handlers.autoFill))
          ) {
            directionRef.current = 'none';
            recordAnchor();
            handlers.onLoadOlder();
          }
          if (
            entry.target === bottom &&
            handlers.hasNewer &&
            directionRef.current === 'down'
          ) {
            directionRef.current = 'none';
            recordAnchor();
            handlers.onLoadNewer();
          }
        }
      },
      { root: viewport, rootMargin: `${PREFETCH_MARGIN_PX}px 0px` },
    );
    observer.observe(top);
    observer.observe(bottom);
    return () => observer.disconnect();
  }, [pages, loading]);

  // At the very top or bottom a wheel turn or a key press scrolls nothing, so
  // no scroll event says the reader wants more: read the intent directly.
  const pushTowards = (edge: 'up' | 'down') => {
    const handlers = handlersRef.current;
    if (edge === 'up' && nearTopRef.current && handlers.hasOlder) {
      directionRef.current = 'none';
      recordAnchor();
      handlers.onLoadOlder();
      return;
    }
    if (edge === 'down' && nearBottomRef.current && handlers.hasNewer) {
      directionRef.current = 'none';
      recordAnchor();
      handlers.onLoadNewer();
      return;
    }
    directionRef.current = edge;
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.deltaY !== 0) pushTowards(event.deltaY < 0 ? 'up' : 'down');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) pushTowards('up');
    if (['ArrowDown', 'PageDown', 'End'].includes(event.key)) {
      pushTowards('down');
    }
  };

  const handleOpen = (entry: ParsedLogLine) => {
    if (entryDetails === 'inline') {
      setExpandedId((current) => (current === entry.id ? undefined : entry.id));
      return;
    }
    openLogEntrySidepanel({ entry });
  };

  const jumpToLatest = () => {
    followingRef.current = true;
    directionRef.current = 'none';
    setFollowing(true);
    onFollowChange(true);
    onJumpToLatest();
  };

  return (
    <div className="relative">
      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className={cn(
          'h-[70vh] overflow-auto overscroll-contain [overflow-anchor:none]',
          className,
        )}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        role="log"
        aria-live="off"
        tabIndex={0}
      >
        <div className="min-w-[720px]">
          <LogTableHeader timeZoneLabel={timeZoneLabel} />

          <div ref={topSentinelRef} aria-hidden className="h-px" />
          <EdgeStatus
            edge="older"
            has={hasOlder}
            loading={loading === 'older'}
            failed={edgeError === 'older'}
            endLabel={t('rangeStart')}
            loadingLabel={t('loadingOlder')}
            failedLabel={t('olderFailed')}
            retryLabel={t('retry')}
            onRetry={onLoadOlder}
          />

          {pages.map(({ page, rows }) => (
            <div key={page} data-log-page={page}>
              {rows.map((entry, index) => {
                const rowKey = `${page}-${index}`;
                return (
                  <Fragment key={entry.id}>
                    <LogTableRow
                      entry={entry}
                      nowMs={nowMs}
                      rowKey={rowKey}
                      expanded={
                        entryDetails === 'inline'
                          ? expandedId === entry.id
                          : undefined
                      }
                      onOpen={handleOpen}
                    />
                    {expandedId === entry.id && (
                      <div className="border-b bg-background/60 px-4 py-3">
                        <LogEntryDetails entry={entry} />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          ))}

          {hasNewer && (
            <EdgeStatus
              edge="newer"
              has
              loading={loading === 'newer'}
              failed={edgeError === 'newer'}
              endLabel=""
              loadingLabel={t('loadingNewer')}
              failedLabel={t('newerFailed')}
              retryLabel={t('retry')}
              onRetry={onLoadNewer}
            />
          )}
          <div ref={bottomSentinelRef} aria-hidden className="h-px" />
        </div>
      </div>

      {!following && (
        <Button
          size="sm"
          buttonColor="primary"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lg"
          onClick={jumpToLatest}
        >
          <ArrowDownIcon />
          {t('jumpToLatest')}
        </Button>
      )}
    </div>
  );
}

interface EdgeStatusProps {
  edge: 'older' | 'newer';
  has: boolean;
  loading: boolean;
  failed: boolean;
  endLabel: string;
  loadingLabel: string;
  failedLabel: string;
  retryLabel: string;
  onRetry: () => void;
}

/** What lies past the loaded lines at one edge: more, an error, or the end. */
function EdgeStatus(props: EdgeStatusProps) {
  const {
    endLabel,
    failed,
    failedLabel,
    has,
    loading,
    loadingLabel,
    onRetry,
    retryLabel,
  } = props;

  if (failed) {
    return (
      <div className="flex items-center justify-center gap-2 border-b px-4 py-2 text-xs text-amber-600 dark:text-amber-300">
        <span>{failedLabel}</span>
        <Button
          size="xs"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={onRetry}
        >
          <RotateCwIcon />
          {retryLabel}
        </Button>
      </div>
    );
  }
  if (has) {
    return (
      <div className="flex h-9 items-center justify-center gap-2 border-b text-xs text-muted-foreground">
        {loading && <Spinner className="size-3.5" />}
        <span>{loadingLabel}</span>
      </div>
    );
  }
  if (!endLabel) return null;
  return (
    <div className="border-b px-4 py-2 text-center text-xs text-muted-foreground">
      {endLabel}
    </div>
  );
}
