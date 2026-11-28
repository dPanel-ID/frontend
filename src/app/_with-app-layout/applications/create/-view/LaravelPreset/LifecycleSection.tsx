import { HeartPulseIcon, RefreshCwIcon, WorkflowIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Input } from '@/shared/presentation/atoms/Input';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { CommandListEditor } from '@/shared/presentation/molecules/CommandListEditor';

import { useFormStore } from '../../-model/store/form';
import { Sectioned } from '../../-presentation/Sectioned';

const KNOWN_PROCESSES = new Set(['worker', 'scheduler']);

function Block(props: {
  title: string;
  desc: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-bold">{props.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {props.desc}
          </p>
        </div>
        {props.aside}
      </div>
      <div className="mt-3">{props.children}</div>
    </section>
  );
}

/**
 * The deployment steps around the build that a preset fills in: release
 * commands (migrations), post-deploy commands, the health check, and the
 * worker and scheduler, which stay off until the user turns them on.
 */
export default function LifecycleSection() {
  const t = useDevetekTranslations('page.applicationsCreate.preset.lifecycle');
  const [preset, lifecycle, setLifecycle] = useFormStore((s) => [
    s.laravelPreset,
    s.lifecycle,
    s.setLifecycle,
  ]);
  if (!preset) return null;

  const release = lifecycle.release ?? {
    enabled: true,
    commands: [],
    timeout: '',
  };
  const enabled = new Set(lifecycle.enabledProcessNames);

  const toggleProcess = (name: string, on: boolean) => {
    const next = new Set(enabled);
    if (on) next.add(name);
    else next.delete(name);
    setLifecycle({
      enabledProcessNames: lifecycle.offeredProcesses
        .map((process) => process.name)
        .filter((processName) => next.has(processName)),
    });
  };

  return (
    <Sectioned
      sectionIcon={WorkflowIcon}
      sectionTitle={t('title')}
      sectionDescription={t('desc')}
      className="md:flex-col"
      classNameContent="basis-auto grid gap-4 lg:grid-cols-2"
    >
      <Block
        title={t('releaseTitle')}
        desc={t('releaseDesc')}
        aside={
          <span className="flex shrink-0 items-center gap-2">
            <Switch
              id="wizard-release-enabled"
              checked={release.enabled}
              aria-label={t('releaseEnabled')}
              onCheckedChange={(checked) =>
                setLifecycle({
                  release: { ...release, enabled: checked === true },
                })
              }
            />
          </span>
        }
      >
        <CommandListEditor
          idPrefix="wizard-release-command"
          commands={release.commands}
          disabled={!release.enabled}
          onChange={(commands) =>
            setLifecycle({ release: { ...release, commands } })
          }
          itemLabel={(index) => t('commandLabel', { n: index + 1 })}
          removeLabel={(index) => t('removeCommand', { n: index + 1 })}
          addLabel={t('addCommand')}
          emptyLabel={t('releaseEmpty')}
        />
      </Block>

      <Block title={t('postDeployTitle')} desc={t('postDeployDesc')}>
        <CommandListEditor
          idPrefix="wizard-post-deploy-command"
          commands={lifecycle.postDeployCommands}
          onChange={(postDeployCommands) =>
            setLifecycle({ postDeployCommands })
          }
          itemLabel={(index) => t('commandLabel', { n: index + 1 })}
          removeLabel={(index) => t('removeCommand', { n: index + 1 })}
          addLabel={t('addCommand')}
          emptyLabel={t('postDeployEmpty')}
        />
      </Block>

      <Block title={t('healthTitle')} desc={t('healthDesc')}>
        <label className="grid gap-1.5" htmlFor="wizard-health-path">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <HeartPulseIcon className="size-3.5" />
            {t('healthPath')}
          </span>
          <Input
            id="wizard-health-path"
            className="font-mono text-xs"
            value={lifecycle.healthCheck?.path ?? ''}
            placeholder="/up"
            maxLength={512}
            onChange={(event) => {
              const path = event.target.value;
              setLifecycle({
                healthCheck: path.trim()
                  ? {
                      expectedStatus: 200,
                      timeout: '5s',
                      retries: 10,
                      ...lifecycle.healthCheck,
                      path,
                    }
                  : null,
              });
            }}
          />
          <span className="text-xs text-muted-foreground">
            {t('healthHint')}
          </span>
        </label>
      </Block>

      {lifecycle.offeredProcesses.length > 0 && (
        <Block title={t('processesTitle')} desc={t('processesDesc')}>
          <ul className="grid gap-2">
            {lifecycle.offeredProcesses.map((process) => {
              const on = enabled.has(process.name);
              const id = `wizard-process-${process.name}`;
              return (
                <li
                  key={process.name}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  <Switch
                    id={id}
                    checked={on}
                    aria-describedby={`${id}-desc`}
                    onCheckedChange={(checked) =>
                      toggleProcess(process.name, checked === true)
                    }
                  />
                  <span className="grid min-w-0 gap-1">
                    <label
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
                    >
                      <RefreshCwIcon className="size-3.5" />
                      {KNOWN_PROCESSES.has(process.name)
                        ? t(`process.${process.name}.title`)
                        : process.name}
                    </label>
                    <span
                      id={`${id}-desc`}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      {KNOWN_PROCESSES.has(process.name)
                        ? t(`process.${process.name}.desc`)
                        : t('process.other')}
                    </span>
                    <code className="truncate rounded bg-muted/50 px-1.5 py-0.5 text-xs">
                      {process.command}
                    </code>
                  </span>
                </li>
              );
            })}
          </ul>
        </Block>
      )}
    </Sectioned>
  );
}
