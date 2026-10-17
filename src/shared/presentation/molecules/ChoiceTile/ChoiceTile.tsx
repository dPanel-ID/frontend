import type { ReactNode } from 'react';

import { CheckIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero/accents';
import type { FlowAccent } from '@/shared/presentation/organisms/FlowHero/accents';

export interface ChoiceTileProps {
  selected: boolean;
  onSelect: () => void;
  /** Logo or icon shown on the left. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small pill in the corner, for example "Recommended". */
  badge?: string;
  accent?: FlowAccent;
  disabled?: boolean;
  className?: string;
  /** Accessible name when the title is not plain text. */
  ariaLabel?: string;
}

/**
 * One option in a small set, shown as a card instead of a dropdown entry.
 * Use it inside a `role="radiogroup"` container.
 */
export function ChoiceTile(props: ChoiceTileProps) {
  const {
    accent = 'sky',
    ariaLabel,
    badge,
    className,
    disabled,
    leading,
    onSelect,
    selected,
    subtitle,
    title,
  } = props;
  const tone = FLOW_ACCENTS[accent];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2',
        tone.ring,
        disabled
          ? 'cursor-not-allowed opacity-50'
          : cn(
              'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5',
              tone.hover,
            ),
        selected && tone.selected,
        className,
      )}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      {badge && !selected && (
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
            tone.badge,
          )}
        >
          {badge}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent transition-colors',
          selected && 'border-emerald-500 bg-emerald-500 text-white',
        )}
      >
        <CheckIcon className="size-3" />
      </span>
    </button>
  );
}
