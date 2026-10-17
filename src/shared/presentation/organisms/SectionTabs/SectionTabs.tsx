import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

export interface SectionTabItem<Id extends string> {
  id: Id;
  label: string;
  icon: LucideIcon;
  /** Small count shown after the label. */
  count?: number;
}

interface SectionTabsProps<Id extends string> {
  items: ReadonlyArray<SectionTabItem<Id>>;
  active: Id;
  onSelect: (id: Id) => void;
  ariaLabel: string;
}

/**
 * The sections of a page as a pill bar. The page owns the active tab, so it
 * can mirror it into the URL and keep tabs shareable.
 */
export function SectionTabs<Id extends string>(props: SectionTabsProps<Id>) {
  const { active, ariaLabel, items, onSelect } = props;

  return (
    <nav aria-label={ariaLabel} className="overflow-x-auto">
      <div
        role="tablist"
        className="flex w-max min-w-full gap-1 rounded-xl border bg-card/60 p-1"
      >
        {items.map(({ count, icon: Icon, id, label }) => {
          const isActive = id === active;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(id)}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                isActive
                  ? 'bg-background text-primary shadow-sm ring-1 ring-sky-400/40'
                  : 'text-muted-foreground hover:bg-background/60 hover:text-primary',
              )}
            >
              <Icon
                className={cn(
                  'size-4',
                  isActive ? 'text-sky-600 dark:text-sky-300' : undefined,
                )}
              />
              {label}
              {count != null && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[0.65rem] font-bold',
                    isActive
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                      : 'bg-border/60 text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
