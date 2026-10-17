import type { ReactNode } from 'react';

import { CheckIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero/accents';
import type { FlowAccent } from '@/shared/presentation/organisms/FlowHero/accents';

export type StepCardAccent = FlowAccent;

export interface StepCardProps {
  number: number;
  /** When true the number is replaced by a check mark. */
  done: boolean;
  /** The first step still to complete; it gets the accent glow. */
  active?: boolean;
  icon?: LucideIcon;
  title: string;
  description?: string;
  accent?: StepCardAccent;
  /** Rendered in the header's right corner, for example a badge or a button. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * A numbered section of a flow. Sections are all visible at once; the number
 * turns into a check mark once the section is complete, and the section the
 * user should work on next carries the flow's accent.
 */
export function StepCard(props: StepCardProps) {
  const {
    accent = 'sky',
    active = false,
    aside,
    children,
    className,
    description,
    done,
    icon: Icon,
    number,
    title,
  } = props;
  const tone = FLOW_ACCENTS[accent];

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card transition-colors',
        done && 'border-emerald-500/30',
        active && 'border-sky-400/30',
        active && accent === 'violet' && 'border-violet-400/30',
        className,
      )}
      aria-label={title}
    >
      {active && (
        <div
          className={cn('pointer-events-none absolute inset-0', tone.glow)}
        />
      )}

      <header className="relative flex items-start gap-4 border-b p-5">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl border text-base font-bold transition-colors',
            done
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : active
                ? tone.icon
                : 'bg-background text-muted-foreground',
          )}
          aria-hidden
        >
          {done ? <CheckIcon className="size-5" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {Icon && (
              <Icon
                className={cn(
                  'size-4',
                  active ? tone.text : 'text-muted-foreground',
                )}
              />
            )}
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      <div className="relative p-5">{children}</div>
    </section>
  );
}
