import { useEffect, useRef } from 'react';

interface LogViewerProps {
  ariaLabel: string;
  emptyLabel: string;
  lines: string[];
  maxVisibleLines?: number;
  scrollResetKey?: string;
}

const DEFAULT_MAX_VISIBLE_LINES = 10;
const SCROLL_EDGE_THRESHOLD_PX = 8;

export default function LogViewer(props: LogViewerProps) {
  const {
    ariaLabel,
    emptyLabel,
    lines,
    maxVisibleLines = DEFAULT_MAX_VISIBLE_LINES,
    scrollResetKey,
  } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = useRef(false);
  const shouldStickToEndRef = useRef(true);
  const previousScrollResetKeyRef = useRef<string | undefined>(undefined);
  const viewportMaxHeight = `calc(${maxVisibleLines} * 1.5rem + 1rem)`;

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
      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className="overflow-auto overscroll-contain"
        onScroll={handleScroll}
        role="region"
        style={{ maxHeight: viewportMaxHeight }}
        tabIndex={0}
      >
        {lines.length > 0 ? (
          <div className="min-w-max py-2 font-mono text-xs leading-6">
            {lines.map((line, index) => (
              <div
                key={`${index}:${line}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] border-b border-white/5 last:border-b-0 hover:bg-white/5"
              >
                <span className="sticky left-0 select-none bg-slate-950 px-3 text-right text-slate-500">
                  {index + 1}
                </span>
                <code className="whitespace-pre px-3 text-slate-100">
                  {line || ' '}
                </code>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-28 items-center justify-center px-4 py-6 text-sm text-slate-400">
            {emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}
