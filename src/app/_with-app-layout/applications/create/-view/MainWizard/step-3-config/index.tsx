import { useMemo } from 'react';

import { CheckCircle2Icon, Code2Icon, PencilLineIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { resolveServerModuleLogo } from '@/entities/server-modules/config/registry';

import { cn } from '@/shared/libs/tailwind/cn';
import { Input } from '@/shared/presentation/atoms/Input';

import useProgressCta from '../../../-model/progress-cta';
import { useFormStore } from '../../../-model/store/form';
import type {
  DependencyConfig,
  RequiredBinaryConfig,
} from '../../../-model/store/form.types';
import { CtaBar } from '../../../-presentation/CtaBar';
import { Sectioned } from '../../../-presentation/Sectioned';
import { CommandSettingsSection, useCommandPortState } from '../step-4-deploy';

interface LanguageDependencyItem {
  dependencyId: string;
  selectionId: string;
  dependency: DependencyConfig;
}

function dependencyModuleId(dependency: DependencyConfig) {
  return (dependency.moduleId || dependency.id).toLowerCase();
}

function isLanguageDependency(dependency: DependencyConfig) {
  return (
    dependency.category?.some((category) => category === 'language') === true
  );
}

function requiredBinarySelectionId(
  dependencyId: string,
  dependency: DependencyConfig,
) {
  return `binary:${dependency.selectionId || dependencyId}`;
}

function dependencyVersionLabel(dependency: DependencyConfig) {
  if (dependency.version && dependency.version.trim()) {
    return dependency.version;
  }

  return dependency.status || '';
}

function groupLanguageDependencies(
  selectedDependencyIds: string[],
  dependencyConfigs: Record<string, DependencyConfig>,
) {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      logoUrl: string;
      dependencies: LanguageDependencyItem[];
    }
  >();

  for (const dependencyId of selectedDependencyIds) {
    const dependency = dependencyConfigs[dependencyId];
    if (!dependency || !isLanguageDependency(dependency)) continue;

    const moduleId = dependencyModuleId(dependency);
    const current = groups.get(moduleId);
    const selectionId = requiredBinarySelectionId(dependencyId, dependency);
    const item = {
      dependencyId,
      selectionId,
      dependency,
    };

    if (current) {
      current.dependencies.push(item);
      continue;
    }

    groups.set(moduleId, {
      id: moduleId,
      name: dependency.title || dependency.name,
      logoUrl:
        dependency.logoUrl ||
        resolveServerModuleLogo({
          id: moduleId,
        }),
      dependencies: [item],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      dependencies: group.dependencies.sort((left, right) =>
        dependencyVersionLabel(left.dependency).localeCompare(
          dependencyVersionLabel(right.dependency),
        ),
      ),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function buildRequiredBinaryConfig(
  item: LanguageDependencyItem,
): RequiredBinaryConfig {
  const { dependency } = item;

  return {
    selectionId: item.selectionId,
    id: dependency.id,
    moduleId: dependency.moduleId || dependency.id,
    name: dependency.name,
    title: dependency.title,
    version: dependency.version || '',
    dependencySelectionId: dependency.selectionId || item.dependencyId,
    logoUrl: dependency.logoUrl,
    source: dependency.source,
    installationId: dependency.installationId,
    installationKey: dependency.installationKey,
    status: dependency.status,
  };
}

function RequiredBinariesPicker() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step3.sectionDetails',
  );
  const [
    selectedDependencyIds,
    dependencyConfigs,
    selectedRequiredBinaryIds,
    toggleRequiredBinary,
    setRequiredBinaryConfig,
  ] = useFormStore((s) => [
    s.selectedDependencyIds,
    s.dependencyConfigs,
    s.selectedRequiredBinaryIds,
    s.toggleRequiredBinary,
    s.setRequiredBinaryConfig,
  ]);

  const languageGroups = useMemo(() => {
    return groupLanguageDependencies(selectedDependencyIds, dependencyConfigs);
  }, [dependencyConfigs, selectedDependencyIds]);

  const toggleDependencyRuntime = (item: LanguageDependencyItem) => {
    const { selectionId } = item;

    if (!selectedRequiredBinaryIds.includes(selectionId)) {
      setRequiredBinaryConfig(selectionId, buildRequiredBinaryConfig(item));
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
        {languageGroups.length ? (
          languageGroups.map((moduleGroup) => {
            const selectedRuntimes = moduleGroup.dependencies.filter((item) =>
              selectedRequiredBinaryIds.includes(item.selectionId),
            );
            const selected = selectedRuntimes.length > 0;
            const singleRuntime =
              moduleGroup.dependencies.length === 1
                ? moduleGroup.dependencies[0]
                : null;

            if (singleRuntime) {
              const versionLabel =
                dependencyVersionLabel(singleRuntime.dependency) ||
                t('defaultInstance');

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
                  onClick={() => toggleDependencyRuntime(singleRuntime)}
                  className={cn(
                    'rounded-lg border bg-card p-3 text-left transition hover:bg-border/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    selected && 'border-primary/70 bg-primary/10',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        src={moduleGroup.logoUrl}
                        alt=""
                        className="size-6 rounded object-contain"
                      />
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
                aria-label={t('requiredBinaryGroupAria', {
                  module: moduleGroup.name,
                })}
                className={cn(
                  'rounded-lg border bg-card p-3 transition',
                  selected && 'border-primary/70 bg-primary/10',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={moduleGroup.logoUrl}
                      alt=""
                      className="size-6 rounded object-contain"
                    />
                    <span className="truncate text-sm font-semibold">
                      {moduleGroup.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {moduleGroup.dependencies.length}x
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {moduleGroup.dependencies.map((item) => {
                    const { selectionId } = item;
                    const versionSelected =
                      selectedRequiredBinaryIds.includes(selectionId);
                    const versionLabel =
                      dependencyVersionLabel(item.dependency) ||
                      t('defaultInstance');

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
                        onClick={() => toggleDependencyRuntime(item)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground transition',
                          'hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                          versionSelected &&
                            'border-primary/40 bg-primary/10 text-primary',
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
