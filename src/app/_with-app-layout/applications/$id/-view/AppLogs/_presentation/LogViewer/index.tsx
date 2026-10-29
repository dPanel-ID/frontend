import { useEffect, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { LogRow } from '@/features/server-log-viewer-sidepanel/view';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

interface LogViewerProps {
  ariaLabel: string;
  entries: ParsedLogLine[];
  /** Shown in the time column header, e.g. "GMT+4". */
  timeZoneLabel: string;
  /** Scroll back to the newest line when this changes. */
  scrollResetKey?: string;
}

const SCROLL_EDGE_THRESHOLD_PX = 8;
const ROW_GRID = 'grid-cols-[44px_160px_72px_120px_minmax(0,1fr)]';

/**
 * Log lines in the same table the server logs use: level badges, JSON
 * payloads summarised in the row and pretty-printed when a row is opened.
 * Newest lines are at the bottom and the view follows them while it is
 * scrolled to the end.
 */
export default function LogViewer(props: LogViewerProps) {
  const { ariaLabel, entries, scrollResetKey, timeZoneLabel } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs.table');

  const viewportRef = useRef<HTMLDivElement>(null);
  const shouldStickToEndRef = useRef(true);
  const previousScrollResetKeyRef = useRef<string | undefined>(undefined);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceToEnd =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToEndRef.current = distanceToEnd <= SCROLL_EDGE_THRESHOLD_PX;
  };

  useEffect(() => {
    if (previousScrollResetKeyRef.current !== scrollResetKey) {
      previousScrollResetKeyRef.current = scrollResetKey;
      shouldStickToEndRef.current = true;
    }
    if (!shouldStickToEndRef.current) return;

    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight });
  }, [entries, scrollResetKey]);

  const toggleEntry = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      ref={viewportRef}
      aria-label={ariaLabel}
      className="max-h-[70vh] overflow-auto overscroll-contain"
      onScroll={handleScroll}
      role="region"
      tabIndex={0}
    >
      <div className="min-w-[760px]">
        <div
          className={`sticky top-0 z-10 grid ${ROW_GRID} gap-3 border-b bg-background/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur`}
        >
          <span>{t('n')}</span>
          <span>
            {t('time')}{' '}
            <span className="font-normal normal-case">({timeZoneLabel})</span>
          </span>
          <span>{t('level')}</span>
          <span>{t('source')}</span>
          <span>{t('message')}</span>
        </div>

        {entries.map((entry) => (
          <LogRow
            key={entry.id}
            entry={entry}
            expanded={expandedIds.has(entry.id)}
            onToggle={() => toggleEntry(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}
