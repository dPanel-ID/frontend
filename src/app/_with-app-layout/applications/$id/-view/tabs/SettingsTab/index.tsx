import {
  CodeIcon,
  FileTextIcon,
  GitBranchIcon,
  HammerIcon,
  PencilIcon,
  PlayIcon,
  RocketIcon,
  SlidersHorizontalIcon,
  TimerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/Button';

import { useAppDataModel } from '../../../-model/app-data';
import { useEmit } from '../../../-model/events';
import DangerZone from '../../DangerZone';
import { Row, Section } from '../OverviewTab/_Partials';

import { EnvTable, Field, StepsList } from './_ConfigBlocks';

const FallbackLoading = () => (
  <div className="h-64 animate-pulse rounded-2xl border bg-card" />
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

/**
 * How the application is built and how it is run, each with the editors
 * that change it, and the irreversible action last.
 */
export default guard(function SettingsTab() {
  const t = useDevetekTranslations('page.applicationDetail.configuration');
  const emit = useEmit();

  const [appId, appName, configDefs] = useAppDetail((s) => [
    s.id,
    s.identity.name,
    s.configDefs,
  ]);
  const [gitDetail, rawAppDefinition] = useAppDataModel((s) => [
    s.gitDetail,
    s.rawAppDefinition,
  ]);

  const lifecycle = configDefs.lifecycle;

  const editBuild = () => {
    if (!rawAppDefinition || !lifecycle?.build) return;
    emit('@applications::detail/application-build-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      steps: lifecycle.build.steps,
      envs: lifecycle.build.envs,
    });
  };

  const editRun = () => {
    if (!rawAppDefinition || !lifecycle?.run) return;
    emit('@applications::detail/application-run-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      command: lifecycle.run.command,
      envs: lifecycle.run.envs,
    });
  };

  const editDeployment = () => {
    emit('@applications::detail/application-edit', {
      applicationId: appId,
      applicationName: appName,
    });
  };
  const buildTimeout = rawAppDefinition?.build?.timeout;
  const description = rawAppDefinition?.run?.description;

  const editSetup = () => {
    if (!rawAppDefinition || !lifecycle?.setup) return;
    emit('@applications::detail/application-setup-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      language: lifecycle.setup.languages[0] ?? { name: '', version: '' },
      languages: lifecycle.setup.languages.slice(1),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {gitDetail.$status === 'success' && (
        <Section icon={GitBranchIcon} title={t('sections.repository')}>
          <dl className="divide-y">
            <Row
              icon={GitBranchIcon}
              label={t('labels.repository')}
              value={
                <a
                  href={gitDetail.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {gitDetail.repo_org} / {gitDetail.repo_name}
                </a>
              }
            />
            {gitDetail.repo_language && (
              <Row
                icon={CodeIcon}
                label={t('labels.language')}
                value={
                  <Badge variant="secondary" className="text-xs">
                    {capitalizeFirstLetter(gitDetail.repo_language)}
                  </Badge>
                }
              />
            )}
            {gitDetail.repo_framework && (
              <Row
                icon={CodeIcon}
                label={t('labels.framework')}
                value={
                  <Badge variant="secondary" className="text-xs">
                    {capitalizeFirstLetter(gitDetail.repo_framework)}
                  </Badge>
                }
              />
            )}
          </dl>
        </Section>
      )}

      <Section
        icon={RocketIcon}
        title={t('sections.deployment')}
        description={t('sections.deploymentHint')}
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={editDeployment}
          >
            <PencilIcon className="size-3.5" />
            {t('editDeployment')}
          </Button>
        }
      >
        <dl className="divide-y">
          <Row
            icon={TimerIcon}
            label={t('labels.buildTimeout')}
            value={buildTimeout || t('defaultTimeout')}
            mono={!!buildTimeout}
          />
          <Row
            icon={FileTextIcon}
            label={t('labels.description')}
            value={description || '-'}
          />
        </dl>
      </Section>

      <div className="grid gap-4 xl:grid-cols-2">
        {lifecycle?.build && (
          <Section
            icon={HammerIcon}
            title={t('sections.build')}
            description={t('sections.buildHint')}
          >
            <div className="flex flex-col gap-4">
              {lifecycle.setup?.languages[0] && (
                <Field label={t('labels.language')} action={editSetup}>
                  <div className="flex flex-wrap gap-1">
                    {lifecycle.setup.languages.map(
                      (
                        language: { name: string; version: string },
                        index: number,
                      ) => (
                        <Badge
                          key={`${language.name}-${language.version}-${index}`}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {language.name} {language.version}
                        </Badge>
                      ),
                    )}
                  </div>
                </Field>
              )}

              <Field label={t('labels.buildSteps')} action={editBuild}>
                <StepsList steps={lifecycle.build.steps} />
              </Field>

              <Field label={t('labels.envVars')} action={editBuild}>
                <EnvTable envs={lifecycle.build.envs} />
              </Field>
            </div>
          </Section>
        )}

        {lifecycle?.run && (
          <Section
            icon={PlayIcon}
            title={t('sections.run')}
            description={t('sections.runHint')}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('labels.serviceName')}>
                  <p className="truncate font-mono text-xs">
                    {lifecycle.run.name || '-'}
                  </p>
                </Field>
                <Field label={t('labels.port')}>
                  <p className="font-mono text-xs">
                    {lifecycle.run.port || '-'}
                  </p>
                </Field>
              </div>

              <Field label={t('labels.command')} action={editRun}>
                <code className="block break-all rounded bg-muted px-2 py-1.5 font-mono text-[11px]">
                  {lifecycle.run.command || '-'}
                </code>
              </Field>

              <Field label={t('labels.envVars')} action={editRun}>
                <EnvTable envs={lifecycle.run.envs} />
              </Field>
            </div>
          </Section>
        )}
      </div>

      {!lifecycle && (
        <Section
          icon={SlidersHorizontalIcon}
          title={t('title')}
          description={t('description')}
        >
          <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
            {t('empty.configuration')}
          </p>
        </Section>
      )}

      <DangerZone />
    </div>
  );
});
