import { CheckIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

export interface FlowStepperItem {
  key: string;
  label: string;
  done: boolean;
  reachable: boolean;
}

interface FlowStepperProps {
  items: FlowStepperItem[];
  activeKey: string;
  /** Zero-based position of the active item. */
  activeIndex: number;
  /** "Step 2 of 5", already localised. */
  positionLabel: string;
  onSelect: (key: string) => void;
}

/**
 * Where you are in the flow.
 *
 * On a phone this is a line of text and a progress bar — no horizontal
 * scrolling, no row of pills squeezed off the edge. The numbered row only
 * appears once there is room for it.
 */
export default function FlowStepper(props: FlowStepperProps) {
  const { activeIndex, activeKey, items, onSelect, positionLabel } = props;

  const percent =
    items.length > 0 ? ((activeIndex + 1) / items.length) * 100 : 0;

  return (
    <nav
      className="rounded-2xl border bg-card px-4 py-3"
      aria-label={positionLabel}
    >
      {/* Phone: position and a bar. The card below names the section. */}
      <div className="sm:hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {positionLabel}
        </p>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Tablet and up: the numbered row. */}
      <ol className="hidden items-center gap-1 sm:flex">
        {items.map((item, index) => {
          const isActive = item.key === activeKey;
          const isLast = index === items.length - 1;

          return (
            <li
              key={item.key}
              className="flex min-w-0 flex-1 items-center gap-1"
            >
              <button
                type="button"
                disabled={!item.reachable}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onSelect(item.key)}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                  item.reachable
                    ? 'hover:bg-accent'
                    : 'cursor-not-allowed opacity-50',
                  isActive && 'bg-sky-500/10',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums transition-colors',
                    item.done &&
                      'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    !item.done &&
                      isActive &&
                      'border-sky-400/50 bg-sky-500/15 text-sky-600 dark:text-sky-300',
                    !item.done &&
                      !isActive &&
                      'border-border text-muted-foreground',
                  )}
                >
                  {item.done ? <CheckIcon className="size-3" /> : index + 1}
                </span>

                <span
                  className={cn(
                    'min-w-0 truncate text-xs font-semibold',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </button>

              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'hidden h-px w-4 shrink-0 lg:block',
                    item.done ? 'bg-emerald-500/40' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
