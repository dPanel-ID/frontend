import { useEffect, useMemo, useState } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import {
  ActivityIcon,
  FolderTreeIcon,
  PlusIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { toHostGroupSummary } from '@/entities/host-group/adapter';
import type {
  HostGroupMember,
  HostGroupSummary,
} from '@/entities/host-group/rules/schema';

import { useRetainedResponseData } from '@/features/server-groups/usecase/use-retained-response-data';

import { ApiHostGroup } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

import { GroupCard } from './GroupCard';
import type { GroupExtras } from './GroupCard';
import { GroupsEmptyState } from './GroupsEmptyState';
import { NewGroupWizard } from './NewGroupWizard';

/**
 * fetchGet spreads a list payload into the response object, so the items sit
 * under numeric keys; this puts them back into an array.
 */
function arrayPayload<T>(response: object): T[] {
  const record = response as Record<string, unknown>;
  return Object.keys(record)
    .filter((key) => /^\d+$/.test(key))
    .sort((left, right) => Number(left) - Number(right))
    .map((key) => record[key] as T);
}

function isUnauthorizedStatus(status?: number | string) {
  const normalizedStatus = Number(status);
  return normalizedStatus === 401 || normalizedStatus === 403;
}

function isConfigDisabledMessage(message: string) {
  return /(disabled|not configured|unavailable)/i.test(message);
}

/** Every group in the workspace, with who is in it and what ran last. */
export default function ServerGroupsView() {
  const t = useDevetekTranslations('page.serverGroups');
  const tSidebar = useDevetekTranslations();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [extras, setExtras] = useState<Record<string, GroupExtras>>({});

  const [groupsResponse, refreshGroups] = ApiHostGroup.Find.useGet({});
  const { data: retainedGroupsData, isDegraded } =
    useRetainedResponseData(groupsResponse);

  const groups = useMemo<HostGroupSummary[]>(() => {
    if (!retainedGroupsData) return [];
    return retainedGroupsData
      .map((item) => toHostGroupSummary(item).unwrap())
      .sort(
        (a, b) => b.timestamp.updated.getTime() - a.timestamp.updated.getTime(),
      );
  }, [retainedGroupsData]);

  // Members and the last operation live behind per-group endpoints; a few
  // small requests keep the cards honest without a bigger list API.
  useEffect(() => {
    const groupIds = groups.map((group) => group.id);
    if (groupIds.length === 0) return;

    const lifecycle = { disposed: false };

    void (async () => {
      const entries = await Promise.all(
        groupIds.map(async (groupId) => {
          const [detail, operations] = await Promise.all([
            ApiHostGroup.Detail.$Id.fetchGet({ id: groupId }),
            ApiHostGroup.Operations.$Id.fetchGet({ id: groupId }),
          ]);

          const members: HostGroupMember[] =
            detail.$status === 'success'
              ? detail.members.map((member) => ({
                  id: member.id,
                  hostname: member.hostname,
                  address: member.address || undefined,
                  status: member.status || undefined,
                  provider: member.provider || undefined,
                  region: member.region || undefined,
                }))
              : [];
          const operationList =
            operations.$status === 'success'
              ? arrayPayload<DTOs.HostGroupOperationV1>(operations)
              : [];
          const latest = operationList
            .sort(
              (left, right) =>
                new Date(right.updated_at).getTime() -
                new Date(left.updated_at).getTime(),
            )
            .at(0);

          return [
            groupId,
            {
              members,
              operationCount: operationList.length,
              lastOperation:
                latest === undefined
                  ? undefined
                  : {
                      type: latest.type,
                      status: latest.status,
                      updatedAt: latest.updated_at,
                    },
            } satisfies GroupExtras,
          ] as const;
        }),
      );

      if (lifecycle.disposed) return;
      setExtras(Object.fromEntries(entries));
    })();

    return () => {
      lifecycle.disposed = true;
    };
  }, [groups]);

  const groupedServers = Object.values(extras).reduce(
    (total, extra) => total + extra.members.length,
    0,
  );
  const operationCount = Object.values(extras).reduce(
    (total, extra) => total + extra.operationCount,
    0,
  );

  const groupsStatus =
    groupsResponse.$status === 'failed' && groupsResponse.kind === 'api'
      ? groupsResponse.error.status
      : undefined;
  const groupsErrorMessage =
    groupsResponse.$status === 'failed'
      ? getApiErrorDetail(groupsResponse.error)
      : '';
  const isLoading = groupsResponse.$status === 'loading' && groups.length === 0;
  const isFailed = groupsResponse.$status === 'failed' && groups.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <FlowHero
        accent="sky"
        icon={FolderTreeIcon}
        headnote={
          <Breadcrumb
            items={[
              { text: tSidebar('sidebar.dashboard'), url: '/dashboard' },
              { text: tSidebar('page.servers.headerTitle'), url: '/servers' },
            ]}
          />
        }
        title={t('title')}
        description={t('hero.description')}
        aside={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link
              to="/servers"
              className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background/50 px-3 text-sm font-semibold text-primary/75 transition-colors hover:bg-border/40 hover:text-primary"
            >
              <ServerIcon className="size-4" />
              {t('hero.back')}
            </Link>
            <button
              type="button"
              className={flowCtaClassName('sky')}
              onClick={() => setCreateOpen(true)}
            >
              <PlusIcon className="size-4" />
              {t('hero.create')}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <StatTile
          icon={FolderTreeIcon}
          tone="sky"
          label={t('overview.groups')}
          value={groups.length}
          loading={isLoading}
        />
        <StatTile
          icon={ServerIcon}
          tone="emerald"
          label={t('overview.servers')}
          value={groupedServers}
          loading={isLoading}
        />
        <StatTile
          icon={ActivityIcon}
          label={t('overview.operations')}
          value={operationCount}
          loading={isLoading}
          className="max-lg:col-span-2"
        />
      </div>

      {isDegraded && (
        <FailedState.BannerRetryable onClickRetry={() => refreshGroups()} />
      )}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border bg-card"
              style={{ opacity: 1 - index * 0.25 }}
            />
          ))}
        </div>
      ) : isFailed ? (
        isUnauthorizedStatus(groupsStatus) ? (
          <FallbackState.Unauthorized withCard />
        ) : isConfigDisabledMessage(groupsErrorMessage) ? (
          <div className="rounded-2xl border border-dashed bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            {t('unavailable')}
          </div>
        ) : (
          <FailedState.WallCentered.Retryable
            withCard
            errorPayload={groupsErrorMessage}
            onClickRetry={() => refreshGroups()}
          />
        )
      ) : groups.length === 0 ? (
        <GroupsEmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} extras={extras[group.id]} />
          ))}
        </div>
      )}

      <NewGroupWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => refreshGroups()}
        onOpenGroup={(groupId, tab) => {
          refreshGroups();
          navigate({
            to: '/servers/groups/$id',
            params: { id: groupId },
            search: { tab },
          });
        }}
      />
    </div>
  );
}
