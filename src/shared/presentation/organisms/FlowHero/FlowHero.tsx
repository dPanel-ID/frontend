import type { ReactNode } from 'react';

import { ClockIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

import { FLOW_ACCENTS } from './accents';
import type { FlowAccent } from './accents';

export interface FlowHeroProps {
  accent: FlowAccent;
  icon: LucideIcon;
  /** Breadcrumb or back link shown above the title. */
  headnote?: ReactNode;
  badge?: string;
  title: string;
  description: string;
  /** For example "Ready in about 10–20 minutes". */
  duration?: string;
  /** Rendered on the right, for example a docs link. */
  aside?: ReactNode;
  className?: string;
}

/**
 * The opening card of a flow page: the same glow, icon tile and badge as
 * the card that led here, so the two pages read as one journey.
 */
export function FlowHero(props: FlowHeroProps) {
  const {
    accent,
    aside,
    badge,
    className,
    description,
    duration,
    headnote,
    icon: Icon,
    title,
  } = props;
  const tone = FLOW_ACCENTS[accent];

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card',
        className,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0', tone.glow)} />

      <div className="relative flex flex-col gap-4 p-5 sm:p-6">
        {headnote && <div className="text-sm">{headnote}</div>}

        {/* Below lg the aside goes under the title. Beside it, the title keeps
            at least 18rem and the aside shrinks and wraps its buttons, so
            several actions never squeeze the title to nothing. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4 lg:min-w-72">
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl border',
                tone.icon,
              )}
            >
              <Icon className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {title}
                </h1>
                {badge && (
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-semibold',
                      tone.badge,
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              {duration && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ClockIcon className="size-3.5" />
                  {duration}
                </p>
              )}
            </div>
          </div>

          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </div>
    </header>
  );
}
