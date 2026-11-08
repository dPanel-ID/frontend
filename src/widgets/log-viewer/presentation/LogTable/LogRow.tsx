import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { LogLevelBadge } from '@/features/server-log-viewer-sidepanel/view';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';

import { readableLogTimestamp } from '../../lib/log-entries';

export const LOG_ROW_GRID = 'grid-cols-[48px_160px_72px_120px_minmax(0,1fr)]';

/** The sticky column header every log table shares. */
export function LogTableHeader(props: { timeZoneLabel?: string }) {
  const { timeZoneLabel } = props;
  const t = useDevetekTranslations('common.logViewer.table');

  return (
    <div
      className={cn(
        'sticky top-0 z-10 grid gap-3 border-b bg-background/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur',
        LOG_ROW_GRID,
      )}
    >
      <span>{t('n')}</span>
      <span className="truncate">
        {t('time')}
        {timeZoneLabel && (
          <span className="font-normal normal-case"> ({timeZoneLabel})</span>
        )}
      </span>
      <span>{t('level')}</span>
      <span>{t('source')}</span>
      <span>{t('message')}</span>
    </div>
  );
}

interface LogTableRowProps {
  entry: ParsedLogLine;
  nowMs: number;
  expanded?: boolean;
  onOpen: (entry: ParsedLogLine) => void;
  /** Identifies the row for scroll anchoring in an infinite list. */
  rowKey?: string;
}

/** Number, time, level, source and message of one line, as a button. */
export function LogTableRow(props: LogTableRowProps) {
  const { entry, expanded, nowMs, onOpen, rowKey } = props;
  const t = useDevetekTranslations('common.logViewer.table');
  const locale = useDevetekLocale();

  return (
    <button
      type="button"
      title={t('openEntry')}
      aria-expanded={expanded}
      data-log-row={rowKey}
      onClick={() => onOpen(entry)}
      className={cn(
        'grid w-full items-center gap-3 border-b px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-sky-500/5 focus-visible:bg-sky-500/10 focus-visible:outline-none',
        LOG_ROW_GRID,
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
  );
}
