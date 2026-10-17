import type { ReactNode } from 'react';

import { CheckIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

export type ReviewPanelAccent = 'sky' | 'violet';

const ACCENT_GLOW: Record<ReviewPanelAccent, string> = {
  sky: 'bg-[radial-gradient(120%_100%_at_100%_0%,rgba(56,189,248,0.16),transparent_60%)]',
  violet:
    'bg-[radial-gradient(120%_100%_at_100%_0%,rgba(167,139,250,0.14),transparent_60%)]',
};

export interface ReviewPanelRow {
  /** Stable key; also the text when `label` is omitted. */
  key: string;
  label: string;
  /** Shown under the label once known, in a monospace tone. */
  value?: ReactNode;
  done: boolean;
}

export interface ReviewPanelProps {
  eyebrow: string;
  /** Title while something is still missing. */
  title: string;
  /** Title once every row is done. */
  readyTitle: string;
  rows: ReviewPanelRow[];
  /** The primary action; the caller disables it until the rows are done. */
  action: ReactNode;
  /** An optional secondary action rendered under the primary one. */
  secondaryAction?: ReactNode;
  /** Short note on what the action will do. */
  footnote?: ReactNode;
  accent?: ReviewPanelAccent;
  className?: string;
}

/**
 * Sticky checklist that summarizes a flow and holds its one primary action.
 * On wide screens it sits beside the steps; on narrow screens it follows them.
 */
export function ReviewPanel(props: ReviewPanelProps) {
  const {
    accent = 'sky',
    action,
    className,
    eyebrow,
    footnote,
    readyTitle,
    rows,
    secondaryAction,
    title,
  } = props;
  const ready = rows.every((row) => row.done);
  const doneCount = rows.filter((row) => row.done).length;

  return (
    <aside
      className={cn(
        'flex h-max flex-col overflow-hidden rounded-2xl border bg-card xl:sticky xl:top-20',
        className,
      )}
      aria-label={eyebrow}
    >
      <div className="relative border-b p-5">
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            ACCENT_GLOW[accent],
          )}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {ready ? readyTitle : title}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border bg-background/60 px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {doneCount}/{rows.length}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 p-5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                row.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'text-muted-foreground/50',
              )}
              aria-hidden
            >
              {row.done ? (
                <CheckIcon className="size-3" />
              ) : (
                <CircleIcon className="size-2 fill-current" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{row.label}</span>
              {row.value != null && row.value !== '' && (
                <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                  {row.value}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t p-5">
        {action}
        {secondaryAction}
        {footnote && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {footnote}
          </p>
        )}
      </div>
    </aside>
  );
}
