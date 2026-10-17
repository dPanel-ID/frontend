import type { ElementType } from 'react';

import { cn } from '@/shared/libs/tailwind/cn';

/** Meaning of a status, mapped to a color family. */
export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  success: {
    pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  info: {
    pill: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  warning: {
    pill: 'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  danger: {
    pill: 'border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
  neutral: {
    pill: 'border-border bg-background/60 text-muted-foreground',
    dot: 'bg-neutral-400',
  },
};

export interface StatusPillProps {
  tone: StatusTone;
  label: string;
  /** Replaces the dot; useful for terminal states such as failed. */
  icon?: ElementType<{ className?: string }>;
  /** Animates the dot for states that are still changing. */
  pulse?: boolean;
  size?: 'sm' | 'md';
  /** Shown on hover; use it for the status message. */
  title?: string;
  /** When set the pill is a button, for example to open a status log. */
  onClick?: () => void;
  className?: string;
}

/**
 * A colored pill naming the state of a resource. The dot pulses while the
 * state is in flux, so a glance at a list tells what is still moving.
 */
export function StatusPill(props: StatusPillProps) {
  const {
    className,
    icon: Icon,
    label,
    onClick,
    pulse = false,
    size = 'sm',
    title,
    tone,
  } = props;
  const classes = TONE_CLASSES[tone];

  const content = (
    <>
      {Icon ? (
        <Icon className={cn(size === 'sm' ? 'size-3' : 'size-3.5')} />
      ) : (
        <span className="relative flex size-2">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex size-full animate-ping rounded-full opacity-60',
                classes.dot,
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex size-2 rounded-full',
              classes.dot,
            )}
          />
        </span>
      )}
      <span className="truncate">{label}</span>
    </>
  );

  const pillClassName = cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold',
    size === 'sm' ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-sm',
    classes.pill,
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className={cn(
          pillClassName,
          'cursor-pointer transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <span title={title} className={pillClassName}>
      {content}
    </span>
  );
}
