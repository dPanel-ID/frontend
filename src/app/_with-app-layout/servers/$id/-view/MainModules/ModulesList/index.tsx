import { useMemo, useState } from 'react';

import { Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import { getModuleInfoByFind } from '@/entities/server-modules/model/getModuleInfo';

import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';

import useModuleInstallationDelete from '../../../-usecase/module-installation-delete';

import type { ModulesListProps } from './types';

type InstalledModuleGroup = {
  id: string;
  categoryID: string;
  name: string;
  description: string;
  logoUrl: string;
  installations: DTOs.ModuleInstallationV1[];
};

type SelectedInstallation = {
  group: InstalledModuleGroup;
  installation: DTOs.ModuleInstallationV1;
};

export default function ModulesList(props: ModulesListProps) {
  const { modules, onDeleted, serverId } = props;
  const [selectedInstallation, setSelectedInstallation] =
    useState<SelectedInstallation | null>(null);

  const groupedModules = useMemo(
    () => groupInstalledModules(modules),
    [modules],
  );

  return (
    <>
      <div className="flex w-full flex-col gap-5">
        {SERVER_MODULES_CATEGORY.map((category) => {
          const categoryGroups = groupedModules.filter(
            (group) => group.categoryID === category.id,
          );

          if (categoryGroups.length < 1) return null;

          return (
            <section key={category.id} className="flex flex-col gap-2">
              <h6 className="text-xs font-semibold text-primary/75">
                {category.name}
              </h6>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {categoryGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card/40 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
                        <img
                          className="max-h-6 max-w-6 object-contain"
                          src={group.logoUrl}
                          alt=""
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-primary">
                          {group.name}
                        </p>
                        <p className="truncate text-xs text-primary/55">
                          {group.installations.length}{' '}
                          {group.installations.length === 1
                            ? 'installed instance'
                            : 'installed instances'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.installations.map((installation) => (
                        <button
                          key={installation.id}
                          type="button"
                          className="inline-flex max-w-full items-center gap-1 rounded-2xl border px-2.5 py-1 text-left text-xs font-medium text-primary/80 transition-colors hover:bg-border/40"
                          onClick={() =>
                            setSelectedInstallation({ group, installation })
                          }
                        >
                          <span className="truncate">
                            {moduleInstanceLabel(installation)}
                          </span>
                          {installation.status !== 'installed' && (
                            <span className="text-primary/50">
                              ({installation.status})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <InstalledModuleDialog
        serverId={serverId}
        selected={selectedInstallation}
        onDeleted={() => {
          onDeleted();
          setSelectedInstallation(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelectedInstallation(null);
        }}
      />
    </>
  );
}

function groupInstalledModules(
  modules: DTOs.ModuleInstallationV1[],
): InstalledModuleGroup[] {
  const groups = new Map<string, InstalledModuleGroup>();

  for (const installation of modules) {
    const moduleName = installation.module_name || installation.name;
    if (!moduleName) continue;

    const staticModule = getModuleInfoByFind({ id: moduleName });
    const categoryID = staticModule?.category[0] ?? 'utilities';
    const current = groups.get(moduleName);
    if (current) {
      current.installations.push(installation);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      categoryID,
      name: staticModule?.name || installation.display_name || moduleName,
      description: staticModule?.description || '',
      logoUrl:
        staticModule?.logoUrl || resolveServerModuleLogo({ id: moduleName }),
      installations: [installation],
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    installations: group.installations.sort(compareInstallations),
  }));
}

function compareInstallations(
  left: DTOs.ModuleInstallationV1,
  right: DTOs.ModuleInstallationV1,
) {
  return moduleInstanceLabel(left).localeCompare(moduleInstanceLabel(right));
}

function moduleInstanceLabel(installation: DTOs.ModuleInstallationV1) {
  const version = moduleVersion(installation);
  if (version) return version;

  const key = installation.installation_key || installation.module_name;
  if (key && key !== installation.module_name) return key;

  return installation.status === 'installed' ? 'Default' : 'Pending';
}

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
    moduleName === 'postgresql' ? 'postgresql_version' : '',
    moduleName === 'mariadb' ? 'mariadb_use_official_repo_version' : '',
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

function InstalledModuleDialog(props: {
  serverId: string;
  selected: SelectedInstallation | null;
  onDeleted: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { onDeleted, onOpenChange, selected, serverId } = props;
  const t = useDevetekTranslations('page.serverDetail.sectionModules');
  const { deleteInstallation, deletingInstallationId } =
    useModuleInstallationDelete();
  const isDeleting =
    deletingInstallationId != null &&
    deletingInstallationId === selected?.installation.id;
  const installationLabel = selected
    ? moduleInstanceLabel(selected.installation)
    : '';

  const handleClickUninstall = () => {
    if (!selected) return;

    deleteInstallation({
      installationId: selected.installation.id,
      moduleName: selected.group.name,
      onSuccess: onDeleted,
      serverId,
      versionLabel: installationLabel,
    });
  };

  return (
    <Dialog open={selected != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-2xl overflow-hidden p-0">
        {selected && (
          <div className="flex max-h-[calc(100svh-2rem)] min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b px-5 py-4">
              <DialogTitle className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-card">
                  <img
                    className="max-h-6 max-w-6 object-contain"
                    src={selected.group.logoUrl}
                    alt=""
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{selected.group.name}</span>
                  <span className="block text-xs font-medium text-primary/55">
                    {moduleInstanceLabel(selected.installation)}
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription>{t('detailDescription')}</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-5 py-4">
              <div className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField
                  label="Status"
                  value={selected.installation.status}
                />
                <ReadOnlyField
                  label="Installation key"
                  value={selected.installation.installation_key}
                />
                <ReadOnlyField
                  label="Strategy"
                  value={selected.installation.install_strategy}
                />
                <ReadOnlyField
                  label="Inventory path"
                  value={selected.installation.inventory_path}
                />
                <ReadOnlyField
                  label="Playbook"
                  value={selected.installation.playbook_path}
                />
                <ReadOnlyField
                  label="Source"
                  value={[
                    selected.installation.module_source_owner,
                    selected.installation.module_source_repo,
                    selected.installation.module_source_ref,
                  ]
                    .filter(Boolean)
                    .join('/')}
                />
                <ReadOnlyField
                  label="Installed at"
                  value={formatDateTime(selected.installation.installed_at)}
                />
                <ReadOnlyField
                  label="Last observed"
                  value={formatDateTime(selected.installation.last_observed_at)}
                />
              </div>

              <div className="mt-5 rounded-xl border bg-card/40">
                <div className="border-b px-4 py-3">
                  <h6 className="text-sm font-bold text-primary">
                    Input variables
                  </h6>
                  <p className="mt-1 text-xs text-primary/55">
                    Captured from the install request and kept read-only.
                  </p>
                </div>
                <VariableList variables={selected.installation.variables} />
              </div>

              <ErrorDetailSection installation={selected.installation} />
            </div>

            <div className="shrink-0 border-t px-5 py-4">
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {t('uninstallPanel.title')}
                  </p>
                  <p className="mt-1 text-xs text-primary/55">
                    {t('uninstallPanel.description')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!selected.installation.id || isDeleting}
                  title={t('uninstallPanel.buttonTitle')}
                  aria-label={t('uninstallPanel.buttonAria', {
                    module: selected.group.name,
                    version: installationLabel,
                  })}
                  onClick={handleClickUninstall}
                >
                  <Trash2Icon className="size-4" />
                  {isDeleting
                    ? t('uninstallPanel.uninstalling')
                    : t('uninstallPanel.button')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyField(props: { label: string; value?: unknown }) {
  return (
    <div className="rounded-lg border bg-card/40 px-3 py-2">
      <p className="text-xs font-semibold text-primary/50">{props.label}</p>
      <p className="mt-1 break-words text-sm text-primary/85">
        {formatValue(props.value)}
      </p>
    </div>
  );
}

function VariableList(props: { variables?: Record<string, unknown> }) {
  const entries = Object.entries(props.variables ?? {});

  if (entries.length === 0) {
    return (
      <p className="px-4 py-4 text-sm italic text-primary/55">
        No input variables were captured for this installation.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="grid gap-2 px-4 py-3 md:grid-cols-[14rem_1fr]"
        >
          <p className="break-all text-xs font-semibold text-primary/60">
            {key}
          </p>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-2 text-xs text-primary/80">
            {formatVariable(value)}
          </pre>
        </div>
      ))}
    </div>
  );
}

function ErrorDetailSection(props: { installation: DTOs.ModuleInstallationV1 }) {
  const { installation } = props;
  const detail = installation.last_error_detail;
  const detailRows: Array<{ label: string; value: unknown }> = [
    { label: 'Summary', value: detail?.summary },
    { label: 'Stderr', value: detail?.stderr },
    { label: 'Stdout', value: detail?.stdout },
    { label: 'Playbook', value: detail?.playbook },
    { label: 'Task', value: detail?.task },
    { label: 'Host', value: detail?.host },
    { label: 'Exit code', value: detail?.exit_code },
  ].filter((row) => row.value != null && String(row.value).trim() !== '');
  const hasError =
    Boolean(installation.last_error && String(installation.last_error).trim()) ||
    detailRows.length > 0;

  if (!hasError) return null;

  return (
    <div className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5">
      <div className="border-b border-destructive/20 px-4 py-3">
        <h6 className="text-sm font-bold text-destructive">Error details</h6>
        <p className="mt-1 text-xs text-primary/55">
          Latest installer error captured in module inventory.
        </p>
      </div>
      <div className="divide-y divide-destructive/10">
        <div className="grid gap-2 px-4 py-3 md:grid-cols-[14rem_1fr]">
          <p className="break-all text-xs font-semibold text-primary/60">
            Last error
          </p>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md bg-background p-2 text-xs text-primary/85">
            {formatVariable(installation.last_error)}
          </pre>
        </div>
        {detailRows.map((row) => (
          <div key={row.label} className="grid gap-2 px-4 py-3 md:grid-cols-[14rem_1fr]">
            <p className="break-all text-xs font-semibold text-primary/60">
              {row.label}
            </p>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md bg-background p-2 text-xs text-primary/85">
              {formatVariable(row.value)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatValue(value?: unknown) {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatVariable(value: unknown) {
  if (value == null || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
