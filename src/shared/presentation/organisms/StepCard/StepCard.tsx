import type { ReactNode } from 'react';

import { CheckIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

export type StepCardAccent = 'sky' | 'violet';

const ACCENT_NUMBER: Record<StepCardAccent, string> = {
  sky: 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  violet:
    'border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
};

export interface StepCardProps {
  number: number;
  /** When true the number is replaced by a check mark. */
  done: boolean;
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
 * turns into a check mark once the section is complete.
 */
export function StepCard(props: StepCardProps) {
  const {
    accent = 'sky',
    aside,
    children,
    className,
    description,
    done,
    icon: Icon,
    number,
    title,
  } = props;

  return (
    <section
      className={cn('rounded-2xl border bg-card', className)}
      aria-label={title}
    >
      <header className="flex items-start gap-4 border-b p-5">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-colors',
            done
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : ACCENT_NUMBER[accent],
          )}
          aria-hidden
        >
          {done ? <CheckIcon className="size-5" /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
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
      <div className="p-5">{children}</div>
    </section>
  );
}
