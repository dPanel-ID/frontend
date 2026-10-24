import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

export function Section(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { action, children, className, description, icon: Icon, title } = props;

  return (
    <section className={cn('rounded-2xl border bg-card', className)}>
      <header className="flex items-start justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="text-base font-bold">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Row(props: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  mono?: boolean;
}) {
  const { icon: Icon, label, mono, value } = props;

  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,9rem)_minmax(0,1fr)] items-center gap-2 py-2.5 first:pt-0 last:pb-0">
      <Icon className="size-4 text-muted-foreground" />
      <dt className="truncate text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 break-words text-sm font-semibold text-primary/90',
          mono && 'font-mono text-xs',
        )}
      >
        {value || '-'}
      </dd>
    </div>
  );
}
