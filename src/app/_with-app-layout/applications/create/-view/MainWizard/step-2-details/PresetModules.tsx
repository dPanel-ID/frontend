import { useState } from 'react';

import { CheckCircle2Icon, PlusIcon, SparklesIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { ServerModule } from '@/entities/server-modules/model/types';

import { ApiModule } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  presetModuleVariables,
  versionMatches,
} from '../../../-lib/laravel-preset';
import { useFormStore } from '../../../-model/store/form';

/** A module already on the server that fits a preset module. */
export interface PresetInstalledOption {
  moduleName: string;
  version: string;
  selected: boolean;
  onUse: () => void;
}

function PresetModuleRow(props: {
  module: DTOs.ApplicationPresetModuleV1;
  catalogModule?: ServerModule;
  refName?: string;
  installed: PresetInstalledOption[];
}) {
  const { module, catalogModule, refName, installed } = props;
  const t = useDevetekTranslations('page.applicationsCreate.preset.modules');
  const [selectedDependencyIds, dependencyConfigs] = useFormStore((s) => [
    s.selectedDependencyIds,
    s.dependencyConfigs,
  ]);
  const [setDependencyConfig, toggleDependency] = useFormStore((s) => [
    s.setDependencyConfig,
    s.toggleDependency,
  ]);
  const [problem, setProblem] = useState('');

  const isSelected = selectedDependencyIds.some((id) => {
    const config = dependencyConfigs[id];
    const moduleId = (config?.moduleId || config?.id || '').toLowerCase();
    return (
      moduleId === module.name &&
      versionMatches(module.version, config?.version ?? '')
    );
  });
  const installedMatch = installed.find(
    (option) =>
      option.moduleName === module.name &&
      versionMatches(module.version, option.version),
  );

  const [detail] = ApiModule.Detail.$Name.useGet({
    name: module.name,
    ref: refName,
    options: { skip: !catalogModule || isSelected || Boolean(installedMatch) },
  });

  const title = catalogModule?.name || module.name;
  const versionLabel = module.version
    ? t('version', { version: module.version })
    : t('anyVersion');

  const addFromCatalog = () => {
    if (!catalogModule || detail.$status !== 'success') return;
    const action =
      detail.action_details.find((item) => item.name === 'install') ??
      detail.action_details[0];
    const variables = presetModuleVariables(module, detail.inputs);
    if (!action || !variables) {
      setProblem(t('noOption', { module: title, version: versionLabel }));
      return;
    }
    const versionKey = Object.keys(variables).find(
      (key) => key === `${module.name}_version`,
    );
    setDependencyConfig(catalogModule.id, {
      selectionId: catalogModule.id,
      id: catalogModule.id,
      moduleId: catalogModule.id,
      name: catalogModule.name,
      title: catalogModule.name,
      version: versionKey ? String(variables[versionKey]) : '',
      category: catalogModule.category,
      logoUrl: catalogModule.logoUrl,
      source: 'catalog',
      variables,
      roles: action.roles?.length
        ? action.roles
        : (detail.source.roles ?? [detail.id]),
      ref: {
        name: detail.input_catalog.ref_name,
        expectedCommit: detail.resolved_commit,
      },
    });
    if (!selectedDependencyIds.includes(catalogModule.id)) {
      toggleDependency(catalogModule.id);
    }
  };

  const isLoadingOptions = detail.$status === 'loading';

  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {title} <span className="text-muted-foreground">{versionLabel}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {module.role === 'language' ? t('roleLanguage') : t('roleDependency')}
        </p>
        {problem && <p className="mt-1 text-xs text-red-600">{problem}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isSelected ? (
          <StatusPill
            tone="success"
            icon={CheckCircle2Icon}
            label={t('selected')}
          />
        ) : installedMatch ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={installedMatch.onUse}
            aria-label={t('useInstalledAria', {
              module: title,
              version: installedMatch.version,
            })}
          >
            {t('useInstalled', { version: installedMatch.version })}
          </Button>
        ) : catalogModule ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={detail.$status !== 'success'}
            onClick={addFromCatalog}
            aria-label={t('addAria', { module: title, version: versionLabel })}
          >
            {isLoadingOptions ? (
              <Spinner className="size-4" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            {t('add')}
          </Button>
        ) : (
          <StatusPill tone="warning" label={t('unavailable')} />
        )}
      </div>
    </li>
  );
}

/**
 * The modules the preset needs, each with one action: use the copy
 * already on this server, or add it from the catalog. Nothing is selected
 * behind the user's back.
 */
export default function PresetModules(props: {
  catalogById: Map<string, ServerModule>;
  refName?: string;
  installed: PresetInstalledOption[];
}) {
  const t = useDevetekTranslations('page.applicationsCreate.preset.modules');
  const preset = useFormStore((s) => s.laravelPreset);
  if (!preset?.modules.length) return null;

  return (
    <section
      aria-labelledby="preset-modules-title"
      className="rounded-xl border border-sky-400/30 bg-sky-500/5 p-3"
    >
      <div className="flex items-start gap-3">
        <SparklesIcon className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-300" />
        <div className="min-w-0">
          <h4 id="preset-modules-title" className="text-sm font-semibold">
            {t('title')}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('desc')}</p>
        </div>
      </div>
      <ul className="mt-3 grid gap-2">
        {preset.modules.map((module) => (
          <PresetModuleRow
            key={`${module.name}@${module.version ?? ''}`}
            module={module}
            catalogModule={props.catalogById.get(module.name)}
            refName={props.refName}
            installed={props.installed}
          />
        ))}
      </ul>
    </section>
  );
}
