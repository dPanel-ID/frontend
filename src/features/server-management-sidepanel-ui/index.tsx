import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

interface ServerManagementSidepanelProps {
  title: string;
  subtitle?: string;
  classNameFrame?: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  actions?: ReactNode;
  metrics?: ReactNode;
  children: ReactNode;
}

export function ServerManagementSidepanel(
  props: ServerManagementSidepanelProps,
) {
  const {
    title,
    subtitle,
    classNameFrame = 'w-[calc(100svw_-_16px)] max-w-[860px]',
    icon: Icon,
    heading,
    description,
    actions,
    metrics,
    children,
  } = props;

  return (
    <Layout classNameFrame={classNameFrame}>
      <Layout.Title
        className="bg-background"
        title={title}
        subtitle={subtitle}
        hasCloseButton
      />

      <div className="grid h-full min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden border-t bg-background">
        <header className="grid gap-3 border-b bg-card p-3">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{heading}</p>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            {actions ? (
              <div className="flex shrink-0 items-center gap-2">{actions}</div>
            ) : null}
          </div>

          {metrics ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
              {metrics}
            </div>
          ) : null}
        </header>

        <div className="min-h-0 overflow-y-auto p-3">{children}</div>
      </div>
    </Layout>
  );
}

interface ServerManagementMetricProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}

export function ServerManagementMetric(props: ServerManagementMetricProps) {
  const { label, value, icon: Icon } = props;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2">
      {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
}

interface ServerManagementToolbarProps {
  children: ReactNode;
  className?: string;
}

export function ServerManagementToolbar(props: ServerManagementToolbarProps) {
  const { children, className } = props;

  return (
    <div
      className={cn(
        'mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ServerManagementSurfaceProps {
  title?: string;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ServerManagementSurface(props: ServerManagementSurfaceProps) {
  const { title, description, meta, children, className } = props;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-sm',
        className,
      )}
    >
      {title || description || meta ? (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b bg-background/60 px-3 py-2">
          <div className="min-w-0">
            {title ? (
              <p className="truncate text-sm font-semibold text-primary">
                {title}
              </p>
            ) : null}
            {description ? (
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {meta ? (
            <div className="shrink-0 text-xs text-muted-foreground">{meta}</div>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

interface ServerManagementIconButtonProps {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export function ServerManagementIconButton(
  props: ServerManagementIconButtonProps,
) {
  const { label, icon: Icon, disabled, isLoading, onClick } = props;

  return (
    <Button
      size="icon-sm"
      buttonColor="secondary"
      buttonStyle="outline"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon className={cn('size-4', isLoading && 'animate-spin')} />
    </Button>
  );
}

interface ServerManagementStateProps {
  title: string;
  description?: string;
  state?: 'loading' | 'empty' | 'failed';
  action?: ReactNode;
}

export function ServerManagementState(props: ServerManagementStateProps) {
  const { title, description, state = 'empty', action } = props;

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card px-6 py-10 text-center">
      {state === 'loading' ? <Spinner /> : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-primary">{title}</p>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export const serverManagementTableClassNames = {
  head: 'h-auto px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground',
  cell: 'px-3 py-2 text-sm',
  mutedCell: 'px-3 py-2 text-sm text-muted-foreground',
};
