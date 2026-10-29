import { useEffect, useState } from 'react';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import {
  DEFAULT_LOG_AUTO_REFRESH,
  logAutoRefreshMs,
} from '../lib/auto-refresh';
import type { LogAutoRefresh } from '../lib/auto-refresh';

/**
 * Runs `onRefresh` on the interval the reader picked (off by default). Ticks
 * are skipped while the browser tab is hidden or the view is paused, e.g. on
 * an older page that a refresh would move.
 */
export function useAutoRefresh(
  onRefresh: () => void,
  options: { paused?: boolean } = {},
) {
  const { paused = false } = options;
  const [autoRefresh, setAutoRefresh] = useState<LogAutoRefresh>(
    DEFAULT_LOG_AUTO_REFRESH,
  );
  const refresh = useHandler(onRefresh);
  const intervalMs = logAutoRefreshMs(autoRefresh);

  useEffect(() => {
    if (intervalMs === null || paused) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, paused, refresh]);

  return { autoRefresh, setAutoRefresh, paused };
}

export type AutoRefreshState = ReturnType<typeof useAutoRefresh>;
