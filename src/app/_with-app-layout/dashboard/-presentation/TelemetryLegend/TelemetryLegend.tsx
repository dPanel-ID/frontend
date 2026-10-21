import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

import { formatPercent } from '../../-lib/percent';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';

export default function TelemetryLegend(props: {
  icon: LucideIcon;
  label: string;
  value?: number;
  tone: Tone;
}) {
  const { icon: Icon, label, tone, value } = props;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold tabular-nums text-primary">
        {formatPercent(value)}
      </p>
    </div>
  );
}
