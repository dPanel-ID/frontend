import { Fragment, useEffect, useRef, useState } from 'react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import {
  LogEntryDetails,
  useServerLogEntrySidepanel,
} from '@/features/server-log-entry-sidepanel';
import { LogLevelBadge } from '@/features/server-log-viewer-sidepanel/view';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';

import { readableLogTimestamp } from '../../lib/log-entries';

export interface LogTableProps {
  ariaLabel: string;
  entries: ParsedLogLine[];
  /** Appended to the time header, e.g. "GMT+4" when times are local. */
  timeZoneLabel?: string;
  /** The file the lines came from, shown in the entry panel. */
  filePath?: string;
  /** Keep the newest (last) line in view while the reader is at the end. */
  followNewest?: boolean;
  /** Scroll back to the newest line when this changes. */
  scrollResetKey?: string;
  /**
   * Where a clicked row shows the whole entry: the side panel, or inline
   * under the row inside a modal, which a side panel would open behind.
   */
  entryDetails?: 'sidepanel' | 'inline';
  className?: string;
}

const SCROLL_EDGE_THRESHOLD_PX = 8;
const ROW_GRID = 'grid-cols-[48px_160px_72px_120px_minmax(0,1fr)]';

/**
 * The one log table every log view uses, as on the server Logs tab: number,
 * time, level, source and message per row. A row opens the whole entry in a
 * side panel, with any JSON payload pretty-printed, so the table never grows.
 */
export default function LogTable(props: LogTableProps) {
  const {
    ariaLabel,
    className,
    entries,
    entryDetails = 'sidepanel',
    filePath,
    followNewest = true,
    scrollResetKey,
    timeZoneLabel,
  } = props;

  const t = useDevetekTranslations('common.logViewer.table');
  const [openLogEntrySidepanel] = useServerLogEntrySidepanel();
  const [expandedId, setExpandedId] = useState<string>();
  const locale = useDevetekLocale();
  const [nowMs] = useState(() => Date.now());

  const handleOpen = (entry: ParsedLogLine) => {
    if (entryDetails === 'inline') {
      setExpandedId((current) => (current === entry.id ? undefined : entry.id));
      return;
    }
    openLogEntrySidepanel({ entry, filePath });
  };

  const viewportRef = useRef<HTMLDivElement>(null);
  const shouldStickToEndRef = useRef(true);
  const previousScrollResetKeyRef = useRef<string | undefined>(undefined);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceToEnd =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    shouldStickToEndRef.current = distanceToEnd <= SCROLL_EDGE_THRESHOLD_PX;
  };

  useEffect(() => {
    if (!followNewest) return;
    if (previousScrollResetKeyRef.current !== scrollResetKey) {
      previousScrollResetKeyRef.current = scrollResetKey;
      shouldStickToEndRef.current = true;
    }
    if (!shouldStickToEndRef.current) return;

    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight });
  }, [entries, followNewest, scrollResetKey]);

  return (
    <div
      ref={viewportRef}
      aria-label={ariaLabel}
      className={cn('max-h-[70vh] overflow-auto overscroll-contain', className)}
      onScroll={handleScroll}
      role="region"
      tabIndex={0}
    >
      <div className="min-w-[720px]">
        <div
          className={cn(
            'sticky top-0 z-10 grid gap-3 border-b bg-background/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur',
            ROW_GRID,
          )}
        >
          <span>{t('n')}</span>
          <span className="truncate">
            {t('time')}
            {timeZoneLabel && (
              <span className="font-normal normal-case">
                {' '}
                ({timeZoneLabel})
              </span>
            )}
          </span>
          <span>{t('level')}</span>
          <span>{t('source')}</span>
          <span>{t('message')}</span>
        </div>

        {entries.map((entry) => (
          <Fragment key={entry.id}>
            <button
              type="button"
              title={t('openEntry')}
              aria-expanded={
                entryDetails === 'inline' ? expandedId === entry.id : undefined
              }
              onClick={() => handleOpen(entry)}
              className={cn(
                'grid w-full items-center gap-3 border-b px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-sky-500/5 focus-visible:bg-sky-500/10 focus-visible:outline-none',
                ROW_GRID,
              )}
            >
              <span className="font-mono text-[11px] text-muted-foreground">
                {entry.lineNumber}
              </span>
              <span
                className="truncate font-mono text-[11px] text-muted-foreground"
                title={entry.timestamp}
              >
                {readableLogTimestamp(entry.timestamp, nowMs, locale) ?? '-'}
              </span>
              <LogLevelBadge level={entry.level} />
              <span
                className="truncate text-xs text-muted-foreground"
                title={entry.sourceLabel}
              >
                {entry.sourceLabel}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-primary">
                {(entry.jsonLabel || entry.jsonPayload !== undefined) && (
                  <span className="shrink-0 rounded border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {entry.jsonLabel || t('json')}
                  </span>
                )}
                <span className="truncate">{entry.message || entry.raw}</span>
              </span>
            </button>
            {expandedId === entry.id && (
              <div className="border-b bg-background/60 px-4 py-3">
                <LogEntryDetails entry={entry} />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
