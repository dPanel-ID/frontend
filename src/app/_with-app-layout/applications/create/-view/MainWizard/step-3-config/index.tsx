import { useMemo } from 'react';

import { CheckCircle2Icon, Code2Icon, PencilLineIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  titleizeModuleValue,
  toServerModuleFromCatalog,
} from '@/entities/server-modules/lib/catalog';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { ApiModule, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Input } from '@/shared/presentation/atoms/Input';

import useProgressCta from '../../../-model/progress-cta';
import { useFormStore } from '../../../-model/store/form';
import type { RequiredBinaryConfig } from '../../../-model/store/form.types';
import { CtaBar } from '../../../-presentation/CtaBar';
import { Sectioned } from '../../../-presentation/Sectioned';
import { CommandSettingsSection, useCommandPortState } from '../step-4-deploy';

const LANGUAGE_MODULE_IDS = new Set([
  'bun',
  'go',
  'nodejs',
  'php',
  'python',
  'ruby',
]);

function moduleVersion(installation: DTOs.ModuleInstallationV1) {
  const variables = installation.variables ?? {};
  const moduleName = installation.module_name;
  const preferredKeys = [
    `${moduleName}_version`,
    moduleName === 'go' ? 'golang_version' : '',
    moduleName === 'nodejs' ? 'nodejs_version' : '',
    moduleName === 'python' ? 'python_version' : '',
    moduleName === 'ruby' ? 'ruby_version' : '',
    moduleName === 'bun' ? 'bun_version' : '',
    moduleName === 'php' ? 'php_version' : '',
  ].filter(Boolean);

  for (const key of preferredKeys) {
    const value = variables[key];
    if (value != null && String(value).trim() !== '') {
      return String(value);
    }
  }

  for (const [key, value] of Object.entries(variables)) {
    if (key.endsWith('_version') && value != null && String(value).trim()) {
      return String(value);
    }
  }

  const keyVersion = installation.installation_key?.match(/@([^:]+)(?::|$)/);
  return keyVersion?.[1] ?? '';
}

function moduleInstanceLabel(installation: DTOs.ModuleInstallationV1) {
  const version = moduleVersion(installation);
  if (version) return version;

  const key = installation.installation_key || installation.module_name;
  if (key && key !== installation.module_name) return key;

  return installation.status || '';
}

function requiredBinarySelectionId(installation: DTOs.ModuleInstallationV1) {
  return `binary:${installation.id || installation.installation_key || installation.module_name}`;
}

function isInstalledBinarySelectable(installation: DTOs.ModuleInstallationV1) {
  return !['failed', 'cancelled', 'deleted'].includes(
    String(installation.status || '').toLowerCase(),
  );
}

function groupLanguageModules(
  modules: DTOs.ModuleInstallationV1[],
  catalogById: Map<string, ServerModule>,
) {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      logoUrl?: string;
      installations: DTOs.ModuleInstallationV1[];
    }
  >();

  for (const installation of modules) {
    const moduleName = installation.module_name || installation.name;
    if (!moduleName) continue;

    const catalogModule = catalogById.get(moduleName);
    const isLanguage =
      catalogModule?.category.includes('language') ||
      LANGUAGE_MODULE_IDS.has(moduleName);
    if (!isLanguage) continue;

    const current = groups.get(moduleName);
    if (current) {
      current.installations.push(installation);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      name:
        catalogModule?.name ||
        installation.display_name ||
        installation.name ||
        titleizeModuleValue(moduleName),
      logoUrl: catalogModule?.logoUrl,
      installations: [installation],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      installations: group.installations.sort((left, right) =>
        moduleInstanceLabel(left).localeCompare(moduleInstanceLabel(right)),
      ),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function buildRequiredBinaryConfig(
  moduleGroup: ReturnType<typeof groupLanguageModules>[number],
  installation: DTOs.ModuleInstallationV1,
): RequiredBinaryConfig {
  return {
    selectionId: requiredBinarySelectionId(installation),
    id: moduleGroup.id,
    moduleId: moduleGroup.id,
    name: moduleGroup.name,
    title: moduleGroup.name,
    version: moduleVersion(installation),
    installationId: installation.id,
    installationKey: installation.installation_key,
    status: installation.status,
  };
}

function RequiredBinariesPicker() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step3.sectionDetails',
  );
  const [
    hostedServerID,
    selectedRequiredBinaryIds,
    toggleRequiredBinary,
    setRequiredBinaryConfig,
  ] = useFormStore((s) => [
    s.hostedServerID,
    s.selectedRequiredBinaryIds,
    s.toggleRequiredBinary,
    s.setRequiredBinaryConfig,
  ]);

  const [inventoryResponse] = ApiServer.Modules.$Id.useGet({
    serverId: hostedServerID ? String(hostedServerID) : '',
    options: {
      skip: !hostedServerID,
    },
  });
  const [catalogResponse] = ApiModule.Find.useGet({
    serverId: hostedServerID ? String(hostedServerID) : undefined,
    options: {
      skip: !hostedServerID,
    },
  });

  const catalogById = useMemo(() => {
    const catalog =
      catalogResponse.$status === 'success'
        ? catalogResponse
        : catalogResponse.$status === 'loading'
          ? catalogResponse.prevData
          : undefined;

    return new Map(
      (catalog?.modules ?? []).map((module) => [
        module.id,
        toServerModuleFromCatalog(
          module,
          catalog?.repository.ref.name,
          catalog?.repository.ref.resolved_commit,
        ),
      ]),
    );
  }, [catalogResponse]);

  const languageGroups = useMemo(() => {
    const inventory =
      inventoryResponse.$status === 'success'
        ? (inventoryResponse.modules ?? [])
        : inventoryResponse.$status === 'loading'
          ? (inventoryResponse.prevData?.modules ?? [])
          : [];

    return groupLanguageModules(inventory, catalogById);
  }, [catalogById, inventoryResponse]);

  const toggleInstallation = (
    moduleGroup: (typeof languageGroups)[number],
    installation: DTOs.ModuleInstallationV1,
  ) => {
    const selectionId = requiredBinarySelectionId(installation);

    if (!selectedRequiredBinaryIds.includes(selectionId)) {
      setRequiredBinaryConfig(
        selectionId,
        buildRequiredBinaryConfig(moduleGroup, installation),
      );
    }

    toggleRequiredBinary(selectionId);
  };

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card">
          <Code2Icon className="size-4 text-primary/70" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">
            {t('requiredBinariesTitle')}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('requiredBinariesDesc')}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {!hostedServerID ? (
          <span className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
            {t('requiredBinariesSelectServer')}
          </span>
        ) : languageGroups.length ? (
          languageGroups.map((moduleGroup) => {
            const selectedInstallations = moduleGroup.installations.filter(
              (installation) =>
                selectedRequiredBinaryIds.includes(
                  requiredBinarySelectionId(installation),
                ),
            );
            const selected = selectedInstallations.length > 0;
            const singleInstallation =
              moduleGroup.installations.length === 1
                ? moduleGroup.installations[0]
                : null;

            if (singleInstallation) {
              const versionLabel =
                moduleInstanceLabel(singleInstallation) || t('defaultInstance');
              const selectable =
                isInstalledBinarySelectable(singleInstallation);

              return (
                <button
                  key={moduleGroup.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={t(
                    selected
                      ? 'deselectRequiredBinaryAria'
                      : 'selectRequiredBinaryAria',
                    {
                      module: moduleGroup.name,
                      version: versionLabel,
                    },
                  )}
                  disabled={!selectable}
                  onClick={() =>
                    toggleInstallation(moduleGroup, singleInstallation)
                  }
                  className={cn(
                    'rounded-lg border bg-card p-3 text-left transition hover:bg-border/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    selected && 'border-primary/70 bg-primary/10',
                    !selectable && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {moduleGroup.logoUrl && (
                        <img
                          src={moduleGroup.logoUrl}
                          alt=""
                          className="size-6 rounded object-contain"
                        />
                      )}
                      <span className="truncate text-sm font-semibold">
                        {moduleGroup.name}
                      </span>
                    </div>
                    {selected && (
                      <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 inline-flex rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground',
                      selected &&
                        'border-primary/40 bg-primary/10 text-primary',
                    )}
                  >
                    {versionLabel}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selected
                      ? t('requiredBinariesSelected')
                      : t('useRequiredBinary')}
                  </p>
                </button>
              );
            }

            return (
              <div
                key={moduleGroup.id}
                role="group"
                aria-label={moduleGroup.name}
                className={cn(
                  'rounded-lg border bg-card p-3 transition',
                  selected && 'border-primary/70 bg-primary/10',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {moduleGroup.logoUrl && (
                      <img
                        src={moduleGroup.logoUrl}
                        alt=""
                        className="size-6 rounded object-contain"
                      />
                    )}
                    <span className="truncate text-sm font-semibold">
                      {moduleGroup.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {moduleGroup.installations.length}x
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {moduleGroup.installations.map((installation) => {
                    const selectionId = requiredBinarySelectionId(installation);
                    const versionSelected =
                      selectedRequiredBinaryIds.includes(selectionId);
                    const selectable =
                      isInstalledBinarySelectable(installation);
                    const versionLabel =
                      moduleInstanceLabel(installation) || t('defaultInstance');

                    return (
                      <button
                        key={selectionId}
                        type="button"
                        aria-pressed={versionSelected}
                        aria-label={t(
                          versionSelected
                            ? 'deselectRequiredBinaryAria'
                            : 'selectRequiredBinaryAria',
                          {
                            module: moduleGroup.name,
                            version: versionLabel,
                          },
                        )}
                        disabled={!selectable}
                        onClick={() =>
                          toggleInstallation(moduleGroup, installation)
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground transition',
                          'hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                          versionSelected &&
                            'border-primary/40 bg-primary/10 text-primary',
                          !selectable && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        {versionSelected && (
                          <CheckCircle2Icon className="size-3" />
                        )}
                        {versionLabel}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {selected
                    ? t('requiredBinariesSelected')
                    : t('useRequiredBinaryVersion')}
                </p>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
            {t('requiredBinariesEmpty')}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Step3Config() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step3.sectionDetails',
  );
  const { goToNext, goToPrevious, isNextDisabled, isPreviousHidden } =
    useProgressCta();
  const [appName, setAppName] = useFormStore((s) => [s.appName, s.setAppName]);
  const portState = useCommandPortState();
  const isContinueDisabled = isNextDisabled || portState.isPortUsed;

  return (
    <div className="flex flex-col gap-4">
      <CtaBar
        placement="top"
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isContinueDisabled}
        isPreviousHidden={isPreviousHidden}
      />

      <Sectioned
        withinCard
        sectionIcon={PencilLineIcon}
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        classNameContent="grid gap-4"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('inputAppName')}</span>
          <Input
            className="w-full"
            placeholder={t('inputAppNamePlaceholder')}
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
          />
        </label>
        <RequiredBinariesPicker />
      </Sectioned>

      <CommandSettingsSection portState={portState} />

      <CtaBar
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isContinueDisabled}
        isPreviousHidden={isPreviousHidden}
      />
    </div>
  );
}
