import { useEffect, useRef } from 'react';

import { cn } from '@/shared/libs/tailwind/cn';

import type { AppLogEntryView } from '../../../../-model/app-logs';

interface LogViewerProps {
  ariaLabel: string;
  emptyDescription?: string;
  emptyLabel: string;
  entries?: AppLogEntryView[];
  query?: string;
  queryErrors?: string[];
  lines: string[];
  maxVisibleLines?: number;
  scrollResetKey?: string;
}

const DEFAULT_MAX_VISIBLE_LINES = 10;
const SCROLL_EDGE_THRESHOLD_PX = 8;

export default function LogViewer(props: LogViewerProps) {
  const {
    ariaLabel,
    emptyDescription,
    emptyLabel,
    entries,
    query,
    queryErrors,
    lines,
    maxVisibleLines = DEFAULT_MAX_VISIBLE_LINES,
    scrollResetKey,
  } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);
  const shouldStickToEndRef = useRef(true);
  const previousScrollResetKeyRef = useRef<string | undefined>(undefined);
  const viewportMaxHeight = `calc(${maxVisibleLines} * 1.5rem + 1rem)`;
  const renderedEntries = entries?.length ? entries : undefined;

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
      hasAutoScrolledRef.current = false;
      shouldStickToEndRef.current = true;
    }

    if (!shouldStickToEndRef.current && hasAutoScrolledRef.current) return;

    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
    });
    hasAutoScrolledRef.current = true;
  }, [lines, scrollResetKey]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      {(query || (queryErrors?.length ?? 0) > 0) && (
        <div className="border-b border-white/8 bg-white/3 px-3 py-2 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {query && (
              <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[11px] text-slate-200">
                {query}
              </span>
            )}
            {(queryErrors?.length ?? 0) > 0 && (
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                {queryErrors!.length} query warning{queryErrors!.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {queryErrors?.map((warning, index) => (
            <p
              key={`${index}:${warning}`}
              className="mt-1 leading-5 text-amber-100/90"
            >
              {warning}
            </p>
          ))}
        </div>
      )}

      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className="overflow-auto overscroll-contain"
        onScroll={handleScroll}
        role="region"
        style={{ maxHeight: viewportMaxHeight }}
        tabIndex={0}
      >
        {(renderedEntries ?? lines).length > 0 ? (
          <div className="min-w-max py-2 font-mono text-xs leading-6">
            {(renderedEntries ?? lines).map((item, index) => {
              const line = typeof item === 'string' ? item : item.line;
              const severity = typeof item === 'string' ? undefined : item.severity;
              const time = typeof item === 'string' ? undefined : item.time;

              return (
              <div
                key={`${index}:${line}`}
                className={cn(
                  'grid grid-cols-[4.25rem_minmax(0,1fr)] border-b border-white/5 last:border-b-0 hover:bg-white/5',
                  severity && 'bg-white/1',
                )}
              >
                <div className="sticky left-0 flex select-none flex-col justify-center gap-0.5 bg-slate-950 px-3 py-1.5 text-right text-slate-500">
                  <span>{index + 1}</span>
                  {severity || time ? (
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                      {severity || ''}
                      {severity && time ? ' · ' : ''}
                      {time || ''}
                    </span>
                  ) : null}
                </div>
                <code className="whitespace-pre-wrap wrap-break-word px-3 py-1.5 text-slate-100">
                  {line || ' '}
                </code>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-28 flex-col items-center justify-center gap-1 px-4 py-6 text-sm text-slate-400">
            <p>{emptyLabel}</p>
            {emptyDescription && (
              <p className="max-w-md text-center text-xs leading-5 text-slate-500">
                {emptyDescription}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
