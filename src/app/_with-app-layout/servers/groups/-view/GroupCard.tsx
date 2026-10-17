import { Link } from '@tanstack/react-router';
import { Clock3Icon, FolderTreeIcon, ServerIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type {
  HostGroupMember,
  HostGroupSummary,
} from '@/entities/host-group/rules/schema';
import { OperationStatusPill } from '@/entities/host-group/ui/OperationStatusPill';
import { SERVER_STATE_METADATA } from '@/entities/server/ui/constants/state-metadata';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

export interface GroupExtras {
  members: HostGroupMember[];
  operationCount: number;
  lastOperation?: { type: string; status: string; updatedAt: string };
}

const MAX_CHIPS = 4;

/** One group: who is in it and what ran on it last. */
export function GroupCard(props: {
  group: HostGroupSummary;
  extras?: GroupExtras;
}) {
  const { extras, group } = props;
  const t = useDevetekTranslations('page.serverGroups');
  const locale = useDevetekLocale();
  const memberCount = extras?.members.length ?? group.memberCount;
  const chips = extras?.members.slice(0, MAX_CHIPS) ?? [];

  return (
    <Link
      to="/servers/groups/$id"
      params={{ id: group.id }}
      search={{ tab: 'members' }}
      className="group flex flex-col gap-4 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
          <FolderTreeIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-primary">
              {group.name}
            </h3>
            <StatusPill
              tone={memberCount > 0 ? 'info' : 'neutral'}
              label={
                memberCount > 0
                  ? t('card.members', { count: memberCount })
                  : t('card.noMembers')
              }
            />
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {group.description || t('card.noDescription')}
          </p>
        </div>
      </div>

      <div className="flex min-h-7 flex-wrap gap-1.5">
        {chips.map((member) => (
          <MemberChip key={member.id} member={member} />
        ))}
        {memberCount > chips.length && (
          <span className="inline-flex items-center rounded-full border border-dashed px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {t('card.more', { count: memberCount - chips.length })}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-semibold">
            {t('card.lastOperation')}
          </span>
          {extras?.lastOperation ? (
            <>
              <span className="truncate">
                {operationTypeLabel(extras.lastOperation.type, t)}
              </span>
              <OperationStatusPill status={extras.lastOperation.status} />
            </>
          ) : (
            <span className="truncate">{t('card.noOperation')}</span>
          )}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3Icon className="size-3.5" />
          {t('card.updated', {
            when: getDistanceFromNow(group.timestamp.updated, locale),
          })}
        </span>
      </div>
    </Link>
  );
}

function MemberChip(props: { member: HostGroupMember }) {
  const { member } = props;
  const t = useDevetekTranslations();
  const isCloud = Boolean(getCloudProviderLabel(member.provider));
  const metadata =
    member.status && member.status in SERVER_STATE_METADATA
      ? SERVER_STATE_METADATA[
          member.status as keyof typeof SERVER_STATE_METADATA
        ]
      : undefined;

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background/60 py-0.5 pl-0.5 pr-2.5 text-xs font-semibold"
      title={member.address}
    >
      {isCloud ? (
        <CloudProviderLogo
          provider={member.provider}
          className="size-5 rounded-full p-0.5"
        />
      ) : (
        <span className="flex size-5 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300">
          <ServerIcon className="size-3" />
        </span>
      )}
      <span className="truncate">{member.hostname || member.address}</span>
      {metadata && (
        <span
          className={cn('size-1.5 rounded-full', {
            'bg-emerald-500': metadata.tone === 'success',
            'bg-sky-500': metadata.tone === 'info',
            'bg-amber-500': metadata.tone === 'warning',
            'bg-red-500': metadata.tone === 'danger',
            'bg-neutral-400': metadata.tone === 'neutral',
          })}
          title={t(metadata.i18n.statusLabel)}
        />
      )}
    </span>
  );
}

const OPERATION_TYPE_KEYS: Record<string, string> = {
  'module.install': 'moduleInstall',
  'module.action': 'moduleAction',
  'application.deploy': 'applicationDeploy',
  'module.inventory': 'moduleInventory',
  'agent.upgrade': 'agentUpgrade',
  'system.reboot': 'systemReboot',
};

/** Human label of an operation type, falling back to the raw type. */
export function operationTypeLabel(
  type: string,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const key = OPERATION_TYPE_KEYS[type];
  return key ? t(`operationType.${key}`) : type;
}
