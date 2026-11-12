import { useMemo, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { DatabaseIcon, ShieldIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import { indexCatalogModules } from '@/entities/server-modules/lib/catalog-index';
import type { CatalogModuleLook } from '@/entities/server-modules/lib/catalog-index';
import { runtimeInstaller } from '@/entities/server-modules/lib/runtime';
import { useModuleVersionLabel } from '@/entities/server-modules/lib/version';
import { getModuleInfoByFind } from '@/entities/server-modules/model/getModuleInfo';

import { ApiExecution, ApiModule } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';
import { dataTable } from '@/shared/presentation/organisms/DataPanel';

import { isAdoptedModule } from '../-lib/adopt';
import { dbManagerUrl, firstDbManagerUrl } from '../-lib/db-manager';
import { firewallViewSearch, firstFirewallViewSearch } from '../-lib/firewall';
import { installWait } from '../-lib/install-wait';
import { servicesNeedingAttention } from '../../../../-lib/module-health';
import type { ServerDetailSearch } from '../../../../-rules/tabs';
import useModuleInstallationDelete from '../../../../-usecase/module-installation-delete';

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

type GroupStatus = 'installed' | 'installing' | 'failed' | 'mixed';

const DB_MANAGER_HOST = import.meta.env.VITE_DB_MANAGER_HOST as
  | string
  | undefined;

/** One row per module, its installations as version chips. */
export default function ModulesList(props: ModulesListProps) {
  const { moduleHealth, modules, onDeleted, serverId } = props;
  const t = useDevetekTranslations('page.serverDetail.modules');
  const versionLabel = useModuleVersionLabel();
  const [selectedInstallation, setSelectedInstallation] =
    useState<SelectedInstallation | null>(null);

  // The catalog names each module's category and icon; the frontend
  // registry only knows the modules it was written for.
  const [catalogResponse] = ApiModule.Find.useGet({ serverId });
  const catalogModules =
    catalogResponse.$status === 'success'
      ? catalogResponse.modules
      : catalogResponse.$status === 'loading'
        ? catalogResponse.prevData?.modules
        : undefined;
  const catalog = useMemo(
    () => indexCatalogModules(catalogModules),
    [catalogModules],
  );

  const openGroup = (group: InstalledModuleGroup) => {
    const installation = preferredInstallation(group.installations);
    if (installation) setSelectedInstallation({ group, installation });
  };

  const groupedModules = useMemo(
    () => groupInstalledModules(modules, catalog),
    [modules, catalog],
  );

  // An install may wait for another job or install on this server; read the
  // server's unfinished jobs while something installs, to say so.
  const hasInstalling = modules.some(
    (module) => module.status === 'installing' || module.status === 'progress',
  );
  const [pendingResponse] = ApiExecution.Find.useGet({
    machineId: serverId,
    status: ['queued', 'running'],
    limit: 20,
    options: { skip: !hasInstalling, refreshIntervalMs: 10_000 },
  });
  const pendingExecutions = useMemo(() => {
    // The api-client glues $status onto the payload; copy the rows out.
    const list: DTOs.ExecutionV2[] =
      pendingResponse.$status === 'success' ? Array.from(pendingResponse) : [];
    return new Map(list.map((execution) => [execution.id ?? '', execution]));
  }, [pendingResponse]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={dataTable.head}>
              {t('table.module')}
            </TableHead>
            <TableHead className={dataTable.head}>
              {t('table.versions')}
            </TableHead>
            <TableHead className={cn(dataTable.head, 'w-36')}>
              {t('table.status')}
            </TableHead>
            <TableHead className={cn(dataTable.head, 'w-40')}>
              <span className="sr-only">{t('table.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedModules.map((group) => {
            const status = groupStatus(group.installations);
            const category = SERVER_MODULES_CATEGORY.find(
              (item) => item.id === group.categoryID,
            );
            const databaseUrl = firstDbManagerUrl(
              DB_MANAGER_HOST,
              serverId,
              group.installations,
            );
            const firewallSearch = firstFirewallViewSearch(group.installations);
            const serviceIssues = moduleHealth
              ? group.installations.flatMap((installation) =>
                  installation.status === 'installed'
                    ? servicesNeedingAttention(moduleHealth, installation.id)
                    : [],
                )
              : [];

            return (
              <TableRow
                key={group.id}
                className="cursor-pointer"
                onClick={(event) => {
                  // Buttons and links inside the row do their own thing.
                  if ((event.target as HTMLElement).closest('a,button')) return;
                  openGroup(group);
                }}
              >
                <TableCell className={dataTable.cell}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5 shadow-sm">
                      <img
                        className="size-full object-contain"
                        src={group.logoUrl}
                        alt=""
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-primary">
                        {group.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {category?.name ?? group.categoryID}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className={dataTable.cell}>
                  <div className="flex flex-wrap gap-1.5">
                    {group.installations.map((installation) => (
                      <button
                        key={installation.id}
                        type="button"
                        className={cn(
                          'inline-flex max-w-full items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-left text-xs font-semibold text-primary/80 transition-colors hover:border-sky-400/50 hover:bg-sky-500/5',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                          installation.status !== 'installed' &&
                            'border-dashed text-muted-foreground',
                        )}
                        onClick={() =>
                          setSelectedInstallation({ group, installation })
                        }
                      >
                        <span className="truncate">
                          {versionLabel(moduleInstanceLabel(installation))}
                        </span>
                        {runtimeInstaller(installation) === 'previous' && (
                          <span
                            className="shrink-0 rounded-full bg-amber-500/10 px-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300"
                            title={t('previousRuntimeHelp')}
                          >
                            {t('previousRuntime')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {status === 'failed' ? (
                    <button
                      type="button"
                      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
                      aria-label={t('openFailedAria', { module: group.name })}
                      title={t('openFailedAria', { module: group.name })}
                      onClick={() => openGroup(group)}
                    >
                      <StatusPill
                        tone={GROUP_STATUS_TONE[status]}
                        label={t(`status.${status}`)}
                      />
                    </button>
                  ) : serviceIssues.length > 0 ? (
                    <div className="grid justify-items-start gap-1">
                      <StatusPill
                        tone="danger"
                        label={t('status.serviceDown')}
                      />
                      <ul className="grid gap-0.5 text-xs text-muted-foreground">
                        {serviceIssues.map((service) => (
                          <li key={service.unit} className="font-mono">
                            {t('serviceState', {
                              unit: service.unit,
                              state: t(`serviceStates.${service.state}`),
                            })}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/servers/$id"
                        params={{ id: serverId }}
                        search={{ tab: 'services' }}
                        className="text-xs font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-sky-300"
                      >
                        {t('openServices')}
                      </Link>
                    </div>
                  ) : (
                    <StatusPill
                      tone={GROUP_STATUS_TONE[status]}
                      pulse={status === 'installing'}
                      label={t(`status.${status}`)}
                    />
                  )}
                  {(() => {
                    const wait = group.installations
                      .map((installation) =>
                        installWait(installation, pendingExecutions),
                      )
                      .find(Boolean);
                    return wait ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t(`installWait.${wait}`)}
                      </p>
                    ) : null;
                  })()}
                </TableCell>
                <TableCell className={cn(dataTable.cell, 'text-right')}>
                  {databaseUrl && (
                    <OpenDatabaseLink
                      href={databaseUrl}
                      label={t('openDatabase')}
                      ariaLabel={t('openDatabaseAria', { module: group.name })}
                    />
                  )}
                  {firewallSearch && (
                    <ManageFirewallLink
                      serverId={serverId}
                      search={firewallSearch}
                      label={t('manageFirewall')}
                      ariaLabel={t('manageFirewallAria')}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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

const GROUP_STATUS_TONE: Record<GroupStatus, StatusTone> = {
  installed: 'success',
  installing: 'info',
  failed: 'danger',
  mixed: 'warning',
};

/**
 * The installation a click on a module's row opens: a failed one first, so
 * the reason is one click away, otherwise the newest.
 */
export function preferredInstallation(
  installations: DTOs.ModuleInstallationV1[],
): DTOs.ModuleInstallationV1 | undefined {
  return (
    installations.find((installation) => installation.status === 'failed') ??
    installations[installations.length - 1]
  );
}

/** The one word that describes every installation of a module. */
export function groupStatus(
  installations: DTOs.ModuleInstallationV1[],
): GroupStatus {
  const statuses = new Set(
    installations.map((installation) => installation.status || 'unknown'),
  );
  if (statuses.size === 1 && statuses.has('installed')) return 'installed';
  if (statuses.has('failed')) return 'failed';
  if (
    [...statuses].every(
      (status) => status === 'installing' || status === 'progress',
    )
  ) {
    return 'installing';
  }
  return 'mixed';
}

function groupInstalledModules(
  modules: DTOs.ModuleInstallationV1[],
  catalog: Map<string, CatalogModuleLook>,
): InstalledModuleGroup[] {
  const groups = new Map<string, InstalledModuleGroup>();

  for (const installation of modules) {
    const moduleName = installation.module_name || installation.name;
    if (!moduleName) continue;

    const staticModule = getModuleInfoByFind({ id: moduleName });
    const catalogModule = catalog.get(moduleName);
    // A child module, such as a database created on MariaDB, is shown in
    // its parent's Manage view, not as a module of its own.
    if (catalogModule?.parent) continue;
    const categoryID =
      catalogModule?.category ?? staticModule?.category[0] ?? 'utilities';
    const current = groups.get(moduleName);
    if (current) {
      current.installations.push(installation);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      categoryID,
      name:
        staticModule?.name ||
        catalogModule?.name ||
        installation.display_name ||
        moduleName,
      description: staticModule?.description || '',
      logoUrl: resolveServerModuleLogo({
        id: moduleName,
        logoUrl: staticModule?.logoUrl || catalogModule?.iconUrl,
      }),
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

/** The version input a new-runtime language version is uninstalled with. */
function runtimeUninstallVersion(installation: DTOs.ModuleInstallationV1) {
  if (runtimeInstaller(installation) !== 'new') return undefined;
  const version = installation.installation_key?.match(/@([^:]+):/)?.[1];
  if (!version) return undefined;
  const input =
    installation.module_name === 'go'
      ? 'golang_version'
      : `${installation.module_name}_version`;
  return { input, value: version };
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
  const versionLabel = useModuleVersionLabel();
  const { deleteInstallation, deletingInstallationId } =
    useModuleInstallationDelete();
  const isDeleting =
    deletingInstallationId != null &&
    deletingInstallationId === selected?.installation.id;
  const installationLabel = selected
    ? versionLabel(moduleInstanceLabel(selected.installation))
    : '';
  const databaseUrl = selected
    ? dbManagerUrl(DB_MANAGER_HOST, serverId, selected.installation)
    : null;
  const firewallSearch = selected
    ? firewallViewSearch(selected.installation)
    : null;

  const handleClickUninstall = () => {
    if (!selected) return;

    deleteInstallation({
      installationId: selected.installation.id,
      moduleName: selected.group.name,
      onSuccess: onDeleted,
      runtimeVersion: runtimeUninstallVersion(selected.installation),
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
                    {installationLabel}
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription>{t('detailDescription')}</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-5 py-4">
              {selected.installation.status === 'failed' && (
                <FailureReason installation={selected.installation} />
              )}
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
                  value={
                    isAdoptedModule(selected.installation)
                      ? t('adoptedSource')
                      : [
                          selected.installation.module_source_owner,
                          selected.installation.module_source_repo,
                          selected.installation.module_source_ref,
                        ]
                          .filter(Boolean)
                          .join('/')
                  }
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

            <div className="flex shrink-0 flex-col gap-3 border-t px-5 py-4">
              {databaseUrl && (
                <div className="flex flex-col gap-3 rounded-lg border border-sky-400/30 bg-sky-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {t('databasePanel.title')}
                    </p>
                    <p className="mt-1 text-xs text-primary/55">
                      {t('databasePanel.description')}
                    </p>
                  </div>
                  <OpenDatabaseLink
                    href={databaseUrl}
                    label={t('databasePanel.button')}
                    ariaLabel={t('databasePanel.buttonAria', {
                      module: selected.group.name,
                    })}
                  />
                </div>
              )}
              {firewallSearch && (
                <div className="flex flex-col gap-3 rounded-lg border border-sky-400/30 bg-sky-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {t('firewallPanel.title')}
                    </p>
                    <p className="mt-1 text-xs text-primary/55">
                      {t('firewallPanel.description')}
                    </p>
                  </div>
                  <ManageFirewallLink
                    serverId={serverId}
                    search={firewallSearch}
                    label={t('firewallPanel.button')}
                    ariaLabel={t('firewallPanel.buttonAria')}
                  />
                </div>
              )}
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

/** Opens db-manager, on its own domain, in a new tab. */
function OpenDatabaseLink(props: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  const { ariaLabel, href, label } = props;

  return (
    <Button asChild variant="outline" size="sm" className="shrink-0">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        <DatabaseIcon className="size-4" />
        {label}
      </a>
    </Button>
  );
}

/** Opens the Network tab's firewall view of this server. */
function ManageFirewallLink(props: {
  serverId: string;
  search: ServerDetailSearch;
  label: string;
  ariaLabel: string;
}) {
  const { ariaLabel, label, search, serverId } = props;

  return (
    <Button asChild variant="outline" size="sm" className="shrink-0">
      <Link
        to="/servers/$id"
        params={{ id: serverId }}
        search={search}
        aria-label={ariaLabel}
      >
        <ShieldIcon className="size-4" />
        {label}
      </Link>
    </Button>
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

/** The failed task and its message, the first thing a failed install shows. */
export function failureReason(installation: DTOs.ModuleInstallationV1): {
  task?: string;
  message?: string;
} {
  const detail = installation.last_error_detail;
  const text = (value?: string | null) => {
    const trimmed = String(value ?? '').trim();
    return trimmed || undefined;
  };
  return {
    task: text(detail?.task),
    message:
      text(detail?.message) ??
      text(detail?.summary) ??
      text(installation.last_error) ??
      text(detail?.stderr),
  };
}

function FailureReason(props: { installation: DTOs.ModuleInstallationV1 }) {
  const { installation } = props;
  const t = useDevetekTranslations('page.serverDetail.sectionModules');
  const { task, message } = failureReason(installation);

  return (
    <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
      <p className="text-sm font-bold text-destructive">
        {t('whyFailed.title')}
      </p>
      {task && (
        <p className="mt-1 text-xs font-semibold text-primary/70">{task}</p>
      )}
      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-primary/85">
        {message ?? t('whyFailed.noReason')}
      </pre>
      {installation.last_execution_id && (
        <p className="mt-2 font-mono text-[11px] text-primary/55">
          {t('whyFailed.execution', { id: installation.last_execution_id })}
        </p>
      )}
    </div>
  );
}

function ErrorDetailSection(props: {
  installation: DTOs.ModuleInstallationV1;
}) {
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
    Boolean(
      installation.last_error && String(installation.last_error).trim(),
    ) || detailRows.length > 0;

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
          <div
            key={row.label}
            className="grid gap-2 px-4 py-3 md:grid-cols-[14rem_1fr]"
          >
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
