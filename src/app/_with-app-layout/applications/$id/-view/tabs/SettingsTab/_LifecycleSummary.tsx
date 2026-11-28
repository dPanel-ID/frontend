import { useDevetekTranslations } from '@/services/i18n';

import type { LifecycleView } from '@/entities/application/lib/lifecycle';
import { isLifecycleEmpty } from '@/entities/application/lib/lifecycle';

import { Badge } from '@/shared/presentation/atoms/Badge';

import { Field } from './_ConfigBlocks';

function Commands(props: { commands: string[]; empty: string }) {
  if (!props.commands.length) {
    return <p className="text-xs text-muted-foreground">{props.empty}</p>;
  }
  return (
    <ol className="flex flex-col gap-1">
      {props.commands.map((command, index) => (
        <li
          key={`${index}-${command}`}
          className="break-all rounded bg-muted px-2 py-1 font-mono text-[11px]"
        >
          {command}
        </li>
      ))}
    </ol>
  );
}

/**
 * Release commands, post-deploy commands, processes and the health check
 * of any application, read-only; the section's Edit button changes them.
 */
export function LifecycleSummary(props: { view: LifecycleView }) {
  const t = useDevetekTranslations(
    'page.applicationDetail.configuration.lifecycle',
  );
  const { view } = props;

  if (isLifecycleEmpty(view)) {
    return (
      <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Field label={t('release')}>
        {view.release?.enabled === false &&
          view.release.commands.length > 0 && (
            <Badge variant="outline" className="w-fit text-xs">
              {t('releaseOff')}
            </Badge>
          )}
        <Commands commands={view.release?.commands ?? []} empty={t('none')} />
      </Field>

      <Field label={t('postDeploy')}>
        <Commands
          commands={view.postDeploy?.commands ?? []}
          empty={t('none')}
        />
      </Field>

      <Field label={t('processes')}>
        {view.processes.length ? (
          <ul className="flex flex-col gap-1.5">
            {view.processes.map((process) => (
              <li
                key={process.name}
                className="grid gap-1 rounded-lg border bg-background px-2 py-1.5"
              >
                <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  {process.name}
                  <Badge variant="secondary" className="text-[10px]">
                    {process.type === 'schedule'
                      ? t('everyMinute')
                      : t('instances', { count: process.instances })}
                  </Badge>
                </span>
                <code className="break-all font-mono text-[11px] text-muted-foreground">
                  {process.command}
                </code>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">{t('none')}</p>
        )}
      </Field>

      <Field label={t('healthCheck')}>
        {view.healthCheck ? (
          <p className="font-mono text-xs">
            GET {view.healthCheck.path} → {view.healthCheck.expectedStatus}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('none')}</p>
        )}
      </Field>
    </div>
  );
}
