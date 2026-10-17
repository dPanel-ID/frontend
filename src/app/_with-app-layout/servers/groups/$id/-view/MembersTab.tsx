import { useMemo, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  CircleCheckIcon,
  PlusIcon,
  ServerIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';

import type { HostGroupMember } from '@/entities/host-group/rules/schema';
import { SERVER_STATE_METADATA } from '@/entities/server/ui/constants/state-metadata';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelPagination,
  DataPanelSearch,
  DataPanelState,
  dataTable,
  usePagedList,
} from '@/shared/presentation/organisms/DataPanel';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';

import { useGroupDetailModel } from '../-model/group';

import { useMembersPicker } from './Hero';

type KnownStatus = keyof typeof SERVER_STATE_METADATA;

function stateOf(status?: string) {
  return status && status in SERVER_STATE_METADATA
    ? SERVER_STATE_METADATA[status as KnownStatus]
    : undefined;
}

/** The servers in the group, each with its live state and a way out. */
export default function MembersTab() {
  const t = useDevetekTranslations('page.serverGroups.detail.members');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const tTerms = useDevetekTranslations();
  const { group, members } = useGroupDetailModel();
  const { openMembersPicker } = useMembersPicker();
  const [openDialog] = useDialog();
  const [searchQuery, setSearchQuery] = useState('');

  const allMembers = useMemo(() => group?.members ?? [], [group]);
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allMembers;
    return allMembers.filter((member) =>
      [member.hostname, member.address, member.provider, member.region]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [allMembers, searchQuery]);
  const { page, pageItems, setPage, totalPage } = usePagedList(filtered);

  const ready = allMembers.filter((m) => m.status === 'ready').length;
  const attention = allMembers.filter(
    (m) => m.status === 'failed' || m.status === 'deleting',
  ).length;

  const handleRemove = (member: HostGroupMember) => {
    openDialog({
      title: t('removeTitle'),
      content: t.rich('removeMessage', {
        name: member.hostname || member.address || member.id,
        group: group?.name ?? '',
        strong: (chunks) => <strong>{chunks}</strong>,
      }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          await members.removeMember(member.id).catch(() => undefined);
        },
      },
    });
  };

  return (
    <DataPanel
      icon={ServerIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <button
          type="button"
          className={flowCtaClassName('sky', 'h-8 px-3 text-xs')}
          disabled={members.isMutatingMembers}
          onClick={() => openMembersPicker('add')}
        >
          <PlusIcon className="size-4" />
          {t('add')}
        </button>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={ServerIcon}
            tone="sky"
            label={t('tiles.total')}
            value={allMembers.length}
          />
          <StatTile
            size="sm"
            icon={CircleCheckIcon}
            tone="emerald"
            label={t('tiles.ready')}
            value={ready}
          />
          <StatTile
            size="sm"
            icon={ShieldAlertIcon}
            tone={attention > 0 ? 'red' : 'neutral'}
            label={t('tiles.attention')}
            value={attention}
          />
        </>
      }
      toolbar={
        <>
          <DataPanelSearch
            value={searchQuery}
            placeholder={t('searchPlaceholder')}
            onChange={setSearchQuery}
          />
          <DataPanelMeta>
            {tCommon('rows', { count: filtered.length })}
          </DataPanelMeta>
        </>
      }
      footer={
        <DataPanelPagination
          page={page}
          totalPage={totalPage}
          onPageChange={setPage}
        />
      }
    >
      {members.memberActionError && (
        <div className="border-b p-3" aria-live="polite" role="status">
          <FailedState.BannerRetryable
            classNameWrapper="shadow-none"
            onClickRetry={members.memberActionError.retry}
          />
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {members.memberActionError.message}
          </p>
        </div>
      )}

      {allMembers.length === 0 ? (
        <DataPanelState
          state="empty"
          title={t('empty')}
          description={t('emptyHint')}
          action={
            <button
              type="button"
              className={flowCtaClassName('sky')}
              onClick={() => openMembersPicker('add')}
            >
              <PlusIcon className="size-4" />
              {t('add')}
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <DataPanelState state="empty" title={t('noMatch')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={dataTable.head}>
                {t('table.server')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-40')}>
                {t('table.status')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-32 text-right')}>
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((member) => {
              const state = stateOf(member.status);
              const providerLabel = getCloudProviderLabel(member.provider);
              const isRemoving =
                members.pendingMemberAction === `remove:${member.id}`;

              return (
                <TableRow key={member.id}>
                  <TableCell className={dataTable.cell}>
                    <div className="flex min-w-0 items-center gap-3">
                      {providerLabel ? (
                        <CloudProviderLogo
                          provider={member.provider}
                          className="size-9"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300">
                          <ServerIcon className="size-4" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <Link
                          to="/servers/$id"
                          params={{ id: member.id }}
                          className="block truncate font-semibold text-primary hover:underline"
                        >
                          {member.hostname || member.address || member.id}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[
                            member.address,
                            providerLabel
                              ? [providerLabel, member.region]
                                  .filter(Boolean)
                                  .join(' · ')
                              : tTerms('common.terms.ownServer'),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    {state ? (
                      <StatusPill
                        tone={state.tone}
                        pulse={state.pulse}
                        label={tTerms(state.i18n.statusLabel)}
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className={cn(dataTable.cell, 'text-right')}>
                    <Button
                      size="sm"
                      buttonStyle="outline"
                      buttonColor="secondary"
                      className="text-red-600 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300"
                      disabled={members.isMutatingMembers}
                      onClick={() => handleRemove(member)}
                    >
                      <Trash2Icon className="size-4" />
                      {isRemoving ? t('removing') : t('remove')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}
