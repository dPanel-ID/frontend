import { Fragment, useEffect, useRef, useState } from 'react';

import {
  LogEntryDetails,
  useServerLogEntrySidepanel,
} from '@/features/server-log-entry-sidepanel';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';

import { LogTableHeader, LogTableRow } from './LogRow';

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

  const [openLogEntrySidepanel] = useServerLogEntrySidepanel();
  const [expandedId, setExpandedId] = useState<string>();
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
        <LogTableHeader timeZoneLabel={timeZoneLabel} />

        {entries.map((entry) => (
          <Fragment key={entry.id}>
            <LogTableRow
              entry={entry}
              nowMs={nowMs}
              expanded={
                entryDetails === 'inline' ? expandedId === entry.id : undefined
              }
              onOpen={handleOpen}
            />
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
