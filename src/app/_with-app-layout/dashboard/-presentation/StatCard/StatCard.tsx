import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';

export default function StatCard(props: {
  label: string;
  value?: number;
  helper: string;
  icon: LucideIcon;
  to: string;
  tone: Tone;
}) {
  const { helper, icon: Icon, label, to, tone, value } = props;

  return (
    <Link
      to={to}
      className={cn(
        'group min-w-0 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-background xl:px-3 xl:py-2.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border xl:size-8',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {value == null ? (
        <Shimmer className="mt-4 h-7 w-16" />
      ) : (
        <p className="mt-4 text-2xl font-bold tabular-nums text-primary xl:mt-3 xl:text-xl">
          {value}
        </p>
      )}
      <p className="mt-1 truncate text-sm font-semibold text-primary xl:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>
    </Link>
  );
}
