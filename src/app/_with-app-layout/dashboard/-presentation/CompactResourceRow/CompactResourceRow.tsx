import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';

export default function CompactResourceRow(props: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status: string;
  statusTone: Tone;
  to?: string;
  params?: Record<string, string>;
}) {
  const {
    icon: Icon,
    params,
    status,
    statusTone: tone,
    subtitle,
    title,
    to,
  } = props;
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-primary/60">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span
        className={cn(
          'max-w-28 shrink-0 truncate rounded-full border px-2 py-0.5 text-xs font-semibold',
          toneClass(tone),
        )}
      >
        {status}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        params={params}
        className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2">
      {content}
    </div>
  );
}
