import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

import { clampPercent } from '../../-lib/percent';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';

export default function StatusMetric(props: {
  icon: LucideIcon;
  label: string;
  helper: string;
  value: number;
  tone: Tone;
  total?: number;
}) {
  const { helper, icon: Icon, label, tone, total, value } = props;
  const percent = total ? (value / total) * 100 : 0;
  const displayTotal = total ?? 0;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight text-primary">
            {label}
          </span>
          <span className="mt-1 block text-xs leading-snug text-muted-foreground">
            {helper}
          </span>
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tabular-nums text-primary">{value}</p>
        <p className="pb-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {value} / {displayTotal}
        </p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${clampPercent(percent)}%` }}
        />
      </div>
    </div>
  );
}
