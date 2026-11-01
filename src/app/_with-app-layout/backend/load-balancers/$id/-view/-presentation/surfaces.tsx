import type { ReactNode } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import type { IconComponent } from '../../-lib/types';

export function DetailSurface(props: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  icon: IconComponent;
  title: string;
}) {
  const { action, children, description, icon: Icon, title } = props;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

export function InlineMetric(props: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase text-muted-foreground">
          {label}
        </span>
        <span className="block truncate font-semibold">{value}</span>
      </span>
    </div>
  );
}

export function StatusPill(props: {
  icon: IconComponent;
  label: string;
  color: string;
}) {
  const { color, icon: Icon, label } = props;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
      style={{ borderColor: color, color }}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export function StateSurface(props: {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { action, description, icon: Icon, title } = props;

  return (
    <Card className="rounded-lg p-6 text-center shadow-none">
      <span className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function LoadingState() {
  const t = useDevetekTranslations();

  return (
    <Card className="flex min-h-80 items-center justify-center rounded-lg shadow-none">
      <span className="flex items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        {t('page.loadBalancersDetail.state.loading')}
      </span>
    </Card>
  );
}

export function EmptyInline(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

export function HeaderHelpAction(props: {
  icon: IconComponent;
  label: string;
  href: string;
}) {
  const { href, icon: Icon, label } = props;

  return (
    <Button buttonStyle="outline" buttonColor="secondary" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noreferrer"
      >
        <Icon />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </Button>
  );
}
