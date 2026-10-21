import type { MouseEvent, ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

/** Color family of the icon tile. */
export type StatTileTone = 'neutral' | 'sky' | 'emerald' | 'amber' | 'red';

const TONE_CLASSES: Record<StatTileTone, string> = {
  neutral: 'border-border bg-background text-muted-foreground',
  sky: 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  emerald:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  amber:
    'border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  red: 'border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300',
};

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  /** Small text under the value, for example "of 12 servers". */
  hint?: string;
  tone?: StatTileTone;
  /** `md` for page-level overviews, `sm` inside cards. */
  size?: 'sm' | 'md';
  /** Marks the tile as the current selection, for tiles that filter a list. */
  active?: boolean;
  /** Renders a shimmer in place of the value. */
  loading?: boolean;
  /** When set the tile is a button. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/**
 * One number with a name: a count, a percentage, a total. Page overviews use
 * the medium size and let the tiles act as filters; cards use the small size
 * for quick links.
 */
export function StatTile(props: StatTileProps) {
  const {
    active = false,
    className,
    hint,
    icon: Icon,
    label,
    loading = false,
    onClick,
    size = 'md',
    tone = 'neutral',
    value,
  } = props;

  const body = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border',
          size === 'md' ? 'size-10' : 'size-8',
          TONE_CLASSES[tone],
        )}
        aria-hidden
      >
        <Icon className={size === 'md' ? 'size-5' : 'size-4'} />
      </span>
      {/* max-w-full: in the stacked phone layout the column axis gives this
          span an auto width, so a long hint would push past the tile. */}
      <span className="min-w-0 max-w-full flex-1">
        {loading ? (
          <span
            className={cn(
              'block animate-pulse rounded bg-border/70',
              size === 'md' ? 'h-6 w-12' : 'h-4 w-8',
            )}
          />
        ) : (
          <span
            className={cn(
              'block truncate font-bold leading-tight text-primary',
              size === 'md' ? 'text-xl' : 'text-sm',
            )}
          >
            {value}
          </span>
        )}
        <span
          className={cn(
            'block truncate font-semibold text-muted-foreground',
            size === 'md' ? 'text-xs' : 'text-[0.7rem]',
          )}
        >
          {label}
        </span>
        {hint && size === 'md' && (
          <span className="mt-0.5 block truncate text-[0.7rem] text-muted-foreground/80">
            {hint}
          </span>
        )}
      </span>
    </>
  );

  const tileClassName = cn(
    'flex min-w-0 items-center gap-3 rounded-xl border bg-card text-left',
    // Phones fit two tiles per row only when the icon sits above the text.
    size === 'md'
      ? 'p-3 max-sm:flex-col max-sm:items-start max-sm:gap-2'
      : 'px-3 py-2',
    active && 'border-sky-400/60 bg-sky-500/5 ring-1 ring-sky-400/40',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          tileClassName,
          'transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        )}
      >
        {body}
      </button>
    );
  }

  return <div className={tileClassName}>{body}</div>;
}
