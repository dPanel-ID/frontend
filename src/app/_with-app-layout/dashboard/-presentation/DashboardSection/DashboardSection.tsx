import type { ReactNode } from 'react';

export interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** The standard panel shell every dashboard section sits in. */
export default function DashboardSection(props: DashboardSectionProps) {
  const { action, children, description, title } = props;

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-primary">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
