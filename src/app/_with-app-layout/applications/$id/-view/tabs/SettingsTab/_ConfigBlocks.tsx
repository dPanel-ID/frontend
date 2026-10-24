import type { ReactNode } from 'react';

import { PencilIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';

export function Field(props: {
  label: string;
  action?: () => void;
  children: ReactNode;
}) {
  const { action, children, label } = props;

  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={action}
          >
            <PencilIcon className="size-3" />
            {t('common.actions.edit')}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export function EnvTable(props: {
  envs: Array<{ key: string; value?: string }>;
}) {
  const { envs } = props;

  const t = useDevetekTranslations('page.applicationDetail.configuration');

  if (envs.length === 0) {
    return <Empty>{t('empty.envVars')}</Empty>;
  }

  return (
    <div className="flex flex-col gap-1">
      {envs.map((env) => (
        <div
          key={env.key}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 rounded-lg bg-muted/50 px-2 py-1 font-mono text-xs"
        >
          <span className="truncate font-semibold text-primary">{env.key}</span>
          {/* Values are never rendered: an environment variable is as
              likely to be a token as a feature flag. */}
          <span className="truncate text-muted-foreground">••••••</span>
        </div>
      ))}
    </div>
  );
}

export function StepsList(props: {
  steps: Array<{ name: string; command?: string[] }>;
}) {
  const { steps } = props;

  const t = useDevetekTranslations('page.applicationDetail.configuration');

  if (steps.length === 0) {
    return <Empty>{t('empty.buildSteps')}</Empty>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, index) => (
        <li key={`${step.name}-${index}`} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
              {index + 1}
            </span>
            <span className="truncate text-xs font-semibold">{step.name}</span>
          </div>

          {step.command && step.command.length > 0 && (
            <div className="ml-5 flex flex-col gap-0.5">
              {step.command.map((command, commandIndex) => (
                <code
                  key={commandIndex}
                  className="block truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                >
                  {command}
                </code>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-3 py-3 text-xs italic text-muted-foreground">
      {children}
    </p>
  );
}
