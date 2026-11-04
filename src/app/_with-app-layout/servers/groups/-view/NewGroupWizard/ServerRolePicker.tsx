import { useState } from 'react';

import { CheckIcon, ServerIcon, XIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import type {
  ClusterCandidate,
  ClusterNodeDraft,
} from '@/features/server-groups/shared/lib/cluster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';
import {
  DataPanelMeta,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import type { ClusterRoleDto } from '@/shared/rules/cluster';

import { toClusterCandidate } from './candidates';

const PAGE_SIZE = 8;

interface ServerRolePickerProps {
  roles: ClusterRoleDto[];
  nodes: ClusterNodeDraft[];
  onToggle: (server: ClusterCandidate) => void;
  onRoleChange: (serverId: string, role: string) => void;
}

/**
 * Pick cluster nodes from the servers the user can see and give each one a
 * role. Servers that already belong to a group cannot be picked.
 */
export function ServerRolePicker(props: ServerRolePickerProps) {
  const { nodes, onRoleChange, onToggle, roles } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard.cluster');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const { userProfile } = useAuthLoggedIn();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [response, refresh] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page,
    pageSize: PAGE_SIZE,
    searchQuery: searchQuery.trim() || undefined,
    userId: userProfile.id,
  });

  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const candidates = (data?.machines ?? [])
    .map(toClusterCandidate)
    .filter((candidate) => candidate != null);
  const totalPage = Math.max(1, data?.pagination.total_page ?? 1);
  const pickedIds = new Set(nodes.map((node) => node.server.id));

  return (
    <div className="grid gap-3">
      {nodes.length > 0 && (
        <ul className="grid gap-1.5">
          {nodes.map((node) => (
            <li
              key={node.server.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border bg-background/60 px-3 py-2"
            >
              <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {node.server.hostname}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[
                    node.server.address,
                    node.server.arch ?? t('archUnknown'),
                    node.server.region,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <RoleToggle
                label={t('role')}
                roles={roles}
                value={node.role}
                onChange={(role) => onRoleChange(node.server.id, role)}
              />
              <button
                type="button"
                aria-label={t('remove')}
                title={t('remove')}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-border/40 hover:text-primary"
                onClick={() => onToggle(node.server)}
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DataPanelSearch
          value={searchQuery}
          placeholder={t('searchPlaceholder')}
          onChange={(value) => {
            setSearchQuery(value);
            setPage(1);
          }}
        />
        <DataPanelMeta>{t('picked', { count: nodes.length })}</DataPanelMeta>
      </div>

      {response.$status === 'failed' && candidates.length === 0 ? (
        <DataPanelState
          state="failed"
          title={t('loadFailed')}
          description={getApiErrorDetail(response.error)}
          action={<DataPanelRetry onClick={() => refresh()} />}
        />
      ) : !data ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : candidates.length === 0 ? (
        <DataPanelState
          state="empty"
          title={searchQuery ? t('noMatch') : t('noServers')}
        />
      ) : (
        <div className="grid gap-1.5 sm:grid-cols-2" role="group">
          {candidates.map((candidate) => {
            const picked = pickedIds.has(candidate.id);
            const inGroup = Boolean(candidate.hostGroupId);

            return (
              <button
                key={candidate.id}
                type="button"
                role="checkbox"
                aria-checked={picked}
                disabled={inGroup}
                onClick={() => onToggle(candidate)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border bg-background/60 px-3 py-2 text-left transition-colors',
                  inGroup
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:border-sky-400/40',
                  picked && 'border-sky-400/60 bg-sky-500/5',
                )}
              >
                {getCloudProviderLabel(candidate.provider) ? (
                  <CloudProviderLogo
                    provider={candidate.provider}
                    className="size-7"
                  />
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300">
                    <ServerIcon className="size-3.5" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {candidate.hostname}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {inGroup
                      ? t('inGroup')
                      : [candidate.arch ?? t('archUnknown'), candidate.region]
                          .filter(Boolean)
                          .join(' · ')}
                  </span>
                </span>
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded border',
                    picked && 'border-sky-500 bg-sky-500 text-white',
                  )}
                >
                  {picked && <CheckIcon className="size-3" />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {totalPage > 1 && (
        <DataPanelPagination
          page={Math.min(page, totalPage)}
          totalPage={totalPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function RoleToggle(props: {
  label: string;
  roles: ClusterRoleDto[];
  value: string;
  onChange: (role: string) => void;
}) {
  const { label, onChange, roles, value } = props;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-md border bg-background p-0.5"
    >
      {roles.map((role) => (
        <button
          key={role.name}
          type="button"
          role="radio"
          aria-checked={value === role.name}
          title={role.description || undefined}
          onClick={() => onChange(role.name)}
          className={cn(
            'rounded px-2.5 py-1 text-xs font-semibold transition-colors',
            value === role.name
              ? 'bg-sky-500 text-white'
              : 'text-muted-foreground hover:text-primary',
          )}
        >
          {role.title || role.name}
        </button>
      ))}
    </div>
  );
}
