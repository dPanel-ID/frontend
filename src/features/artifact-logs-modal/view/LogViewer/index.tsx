import { useEffect, useRef } from 'react';

import { ListEndIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

interface LogViewerProps {
  ariaLabel: string;
  emptyLabel: string;
  lineLimit: number;
  lines: string[];
  maxVisibleLines?: number;
}

const DEFAULT_MAX_VISIBLE_LINES = 10;

export default function LogViewer(props: LogViewerProps) {
  const {
    ariaLabel,
    emptyLabel,
    lineLimit,
    lines,
    maxVisibleLines = DEFAULT_MAX_VISIBLE_LINES,
  } = props;
  const t = useDevetekTranslations('page.applicationDetail.artifactsHistory');
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportMaxHeight = `calc(${maxVisibleLines} * 1.5rem + 1rem)`;

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
    });
  }, [lines]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <ListEndIcon className="size-4" />
          {t('artifactLogLatestLines')}
        </span>
        <span className="font-medium">
          {t('artifactLogLineWindow', {
            count: lines.length,
            limit: lineLimit,
          })}
        </span>
      </div>

      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className="overflow-auto overscroll-contain"
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
