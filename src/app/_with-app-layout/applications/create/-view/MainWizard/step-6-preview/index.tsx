import { useState } from 'react';

import { RocketIcon, WarehouseIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import useHandler from '@/shared/libs/react-hooks/useHandler';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';

import useHandleDeploy from '../../../-model/handle-deploy';
import useHandleUpdateApplication from '../../../-model/handle-update';
import useProgressCta from '../../../-model/progress-cta';
import { useFormStore } from '../../../-model/store/form';
import { useServersStore } from '../../../-model/store/servers';
import { CtaBar } from '../../../-presentation/CtaBar';
import { Sectioned } from '../../../-presentation/Sectioned';

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
  const { goToPrevious, isPreviousHidden } = useProgressCta();
  const [flowMode] = useFormStore((s) => [s.flowMode]);
  const { handleDeploy } = useHandleDeploy();
  const { handleUpdate } = useHandleUpdateApplication();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAction = flowMode === 'update' ? handleUpdate : handleDeploy;
  const handleSubmit = useHandler(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isSubmitted = await submitAction();
      if (!isSubmitted) {
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  });
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
  ]);
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
      <CtaBar
        placement="top"
        goToNext={handleSubmit}
        goToPrevious={goToPrevious}
        isPreviousHidden={isPreviousHidden}
        isPreviousDisabled={isSubmitting}
        isNextLoading={isSubmitting}
        labelNext={flowMode === 'update' ? t('update') : t('deploy')}
      />

      <Sectioned
        withinCard
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

      <CtaBar
        goToNext={handleSubmit}
        goToPrevious={goToPrevious}
        isPreviousHidden={isPreviousHidden}
        isPreviousDisabled={isSubmitting}
        isNextLoading={isSubmitting}
        labelNext={flowMode === 'update' ? t('update') : t('deploy')}
      />
    </div>
  );
}
