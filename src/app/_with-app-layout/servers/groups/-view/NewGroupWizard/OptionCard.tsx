import type { ReactNode } from 'react';

import { CheckIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description?: string;
  /** A short line under the description, for example the minimum servers. */
  meta?: ReactNode;
  /** A pill in the corner, for example "Recommended" or "Coming soon". */
  badge?: string;
  badgeTone?: 'sky' | 'neutral';
  disabled?: boolean;
  /** Why the card cannot be picked; shown in place of the meta line. */
  disabledReason?: string;
}

/** A pickable card with room for a description, used inside a radiogroup. */
export function OptionCard(props: OptionCardProps) {
  const {
    badge,
    badgeTone = 'sky',
    description,
    disabled,
    disabledReason,
    icon,
    meta,
    onSelect,
    selected,
    title,
  } = props;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'relative flex h-full w-full items-start gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        selected && 'border-sky-400/60 bg-sky-500/5 ring-1 ring-sky-400/40',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-primary">
            {title}
          </span>
          {selected ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
              <CheckIcon className="size-3" />
            </span>
          ) : (
            badge && (
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                  badgeTone === 'sky'
                    ? 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                    : 'bg-background/60 text-muted-foreground',
                )}
              >
                {badge}
              </span>
            )
          )}
        </span>
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}
        {disabledReason ? (
          <span className="mt-1.5 block text-xs font-medium text-amber-700 dark:text-amber-300">
            {disabledReason}
          </span>
        ) : (
          meta && (
            <span className="mt-1.5 block text-xs font-medium text-primary/70">
              {meta}
            </span>
          )
        )}
      </span>
    </button>
  );
}
