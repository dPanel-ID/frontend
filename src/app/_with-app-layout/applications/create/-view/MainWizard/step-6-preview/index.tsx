import { RocketIcon, WarehouseIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Checkbox } from '@/shared/presentation/atoms/Checkbox';

import { useFormStore } from '../../../-model/store/form';
import { useServersStore } from '../../../-model/store/servers';
import { Sectioned } from '../../../-presentation/Sectioned';
import { usePreflight } from '../../../-usecase/preflight';
import { useSubmitFlow } from '../../../-usecase/submit-flow';
import PreflightPanel from '../../LaravelPreset/PreflightPanel';

function SummaryRow(props: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b px-3 py-2 last:border-b-0">
      <span className="text-sm font-semibold text-muted-foreground">
        {props.label}
      </span>
      <span className="min-w-0 break-words text-sm text-primary">
        {props.value || '-'}
      </span>
    </div>
  );
}

export default function Step6Preview() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step6.preview',
  );
  const [flowMode] = useFormStore((s) => [s.flowMode]);
  const { isSubmitting } = useSubmitFlow();
  const [
    appName,
    appSourceGithubRepo,
    gitRepoConfig,
    hostedServerID,
    appBuildCommand,
    appRunCommand,
    appPort,
    dependencyConfigs,
    selectedDependencyIds,
    buildEnvText,
    runtimeEnvText,
    updateTriggerBootstrap,
    setUpdateTriggerBootstrap,
    lifecycle,
    preflightOverride,
    setPreflightOverride,
  ] = useFormStore((s) => [
    s.appName,
    s.appSourceGithubRepo,
    s.gitRepoConfig,
    s.hostedServerID,
    s.appBuildCommand,
    s.appRunCommand,
    s.appPort,
    s.dependencyConfigs,
    s.selectedDependencyIds,
    s.buildEnvText,
    s.runtimeEnvText,
    s.updateTriggerBootstrap,
    s.setUpdateTriggerBootstrap,
    s.lifecycle,
    s.preflightOverride,
    s.setPreflightOverride,
  ]);
  const {
    enabled: isPreflightEnabled,
    preflight,
    retry: retryPreflight,
  } = usePreflight();
  const releaseCommands = (lifecycle.release?.commands ?? []).filter(
    (command) => command.trim(),
  );
  const enabledProcesses = lifecycle.offeredProcesses.filter((process) =>
    lifecycle.enabledProcessNames.includes(process.name),
  );
  const [serversStore, { knownServersById }] = useServersStore();
  const selectedServer =
    (hostedServerID ? knownServersById[hostedServerID] : undefined) ??
    (serversStore.$status === 'success'
      ? serversStore.servers.find((server) => server.id === hostedServerID)
      : null);

  const selectedDependencies = selectedDependencyIds
    .map((id) => ({
      selectionId: id,
      dependency: dependencyConfigs[id],
    }))
    .filter(
      (
        item,
      ): item is {
        selectionId: string;
        dependency: NonNullable<(typeof item)['dependency']>;
      } => Boolean(item.dependency),
    );

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <Sectioned
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        sectionIcon={WarehouseIcon}
        classNameContent="grid gap-4"
      >
        <div className="overflow-hidden rounded-lg border bg-background">
          <SummaryRow label={t('application')} value={appName} />
          <SummaryRow label={t('repository')} value={appSourceGithubRepo} />
          {gitRepoConfig?.gitBranch && (
            <SummaryRow label={t('branch')} value={gitRepoConfig.gitBranch} />
          )}
          <SummaryRow label={t('server')} value={selectedServer?.hostname} />
          <SummaryRow
            label={t('buildCommand')}
            value={appBuildCommand
              .filter((command) => command.trim())
              .join(' && ')}
          />
          <SummaryRow label={t('runCommand')} value={appRunCommand} />
          <SummaryRow label={t('port')} value={appPort} />
          {releaseCommands.length > 0 && (
            <SummaryRow
              label={t('release')}
              value={
                lifecycle.release?.enabled === false
                  ? t('releaseOff')
                  : releaseCommands.join(' && ')
              }
            />
          )}
          {lifecycle.postDeployCommands.some((command) => command.trim()) && (
            <SummaryRow
              label={t('postDeploy')}
              value={lifecycle.postDeployCommands
                .filter((command) => command.trim())
                .join(' && ')}
            />
          )}
          {lifecycle.healthCheck?.path.trim() && (
            <SummaryRow
              label={t('healthCheck')}
              value={lifecycle.healthCheck.path}
            />
          )}
          {lifecycle.offeredProcesses.length > 0 && (
            <SummaryRow
              label={t('processes')}
              value={
                enabledProcesses.length
                  ? enabledProcesses.map((process) => process.name).join(', ')
                  : t('processesNone')
              }
            />
          )}
          <SummaryRow
            label={t('buildEnv')}
            value={buildEnvText ? t('configured') : t('notConfigured')}
          />
          <SummaryRow
            label={t('runtimeEnv')}
            value={runtimeEnvText ? t('configured') : t('notConfigured')}
          />
        </div>

        <div className="rounded-lg border bg-background p-3">
          <h4 className="text-sm font-semibold">{t('dependencies')}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedDependencies.map(({ dependency, selectionId }) => (
              <span
                key={selectionId}
                className="rounded-full border bg-card px-2.5 py-1 text-xs font-medium"
              >
                {dependency.name}
                {dependency.version ? ` ${dependency.version}` : ''}
              </span>
            ))}
          </div>
        </div>

        {isPreflightEnabled && (
          <PreflightPanel
            preflight={preflight}
            override={preflightOverride}
            onOverrideChange={setPreflightOverride}
            onRetry={() => void retryPreflight()}
            disabled={isSubmitting}
          />
        )}

        {flowMode === 'update' ? (
          <div className="flex items-start gap-3 rounded-lg border bg-background p-3">
            <Checkbox
              id="application-update-bootstrap"
              checked={updateTriggerBootstrap}
              disabled={isSubmitting}
              onCheckedChange={(checked) =>
                setUpdateTriggerBootstrap(checked === true)
              }
              aria-label={t('bootstrapAriaLabel')}
              aria-labelledby="application-update-bootstrap-title"
              aria-describedby="application-update-bootstrap-desc"
            />
            <span className="grid gap-1">
              <label
                id="application-update-bootstrap-title"
                htmlFor="application-update-bootstrap"
                className="cursor-pointer text-sm font-semibold text-primary"
              >
                {t('bootstrapTitle')}
              </label>
              <span
                id="application-update-bootstrap-desc"
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {t('bootstrapDesc')}
              </span>
            </span>
          </div>
        ) : null}

        <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          <RocketIcon className="mb-2 size-4 text-primary" />
          {flowMode === 'update' ? t('updateNote') : t('deployNote')}
        </div>
      </Sectioned>
    </div>
  );
}
