import { Link } from '@tanstack/react-router';
import {
  CloudIcon,
  FingerprintIcon,
  GitBranchIcon,
  ServerIcon,
  UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { formatWorkspaceIacMode } from '../../-lib/workspace';
import type { WorkspaceIacRepository } from '../../-lib/workspace';

export interface WorkspaceHeroProps {
  name: string;
  workspaceId?: string;
  iacRepository?: WorkspaceIacRepository;
  isIacRepositoryLoading: boolean;
  memberCount?: number;
  cloudProjectCount?: number;
  serverCount?: number;
}

/**
 * Who this workspace is and what it holds.
 *
 * Follows the server detail hero: one flat header carrying identity, state
 * and the facts that matter at a glance, then counts as tiles. The previous
 * version nested a configuration card inside a card inside a card to show a
 * single repository, which is both disproportionate and the nesting the
 * design standard rules out.
 */
export default function WorkspaceHero(props: WorkspaceHeroProps) {
  const {
    cloudProjectCount,
    iacRepository,
    isIacRepositoryLoading,
    memberCount,
    name,
    serverCount,
    workspaceId,
  } = props;
  const t = useDevetekTranslations('page.dashboard.workspaceHero');

  const repositoryName = iacRepository
    ? `${iacRepository.owner}/${iacRepository.repo}`
    : undefined;
  const repositoryDetail = iacRepository
    ? [
        formatWorkspaceIacMode(iacRepository.mode, t),
        iacRepository.ref && t('ref', { ref: iacRepository.ref }),
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;

  return (
    <header className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2
              className="min-w-0 flex-1 truncate text-xl font-bold text-primary"
              title={name}
            >
              {name}
            </h2>
            <StatusPill tone="info" label={t('teamWorkspace')} />
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Fact icon={FingerprintIcon} value={workspaceId} mono />
            {isIacRepositoryLoading ? (
              <span className="inline-block h-3.5 w-48 animate-pulse rounded bg-border/70" />
            ) : (
              <Fact
                icon={GitBranchIcon}
                value={repositoryName ?? t('noRepository')}
                detail={repositoryDetail}
                mono={Boolean(repositoryName)}
              />
            )}
          </div>
        </div>

        <Link
          to="/teams"
          search={{ page: 1, viewMode: 'table' }}
          className="shrink-0 rounded-lg border bg-background px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {t('manage')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={UsersIcon}
          label={t('members')}
          value={memberCount ?? '—'}
          tone="sky"
          size="sm"
          className="bg-background"
        />
        <StatTile
          icon={ServerIcon}
          label={t('servers')}
          value={serverCount ?? '—'}
          tone="neutral"
          size="sm"
          className="bg-background"
        />
        <StatTile
          icon={CloudIcon}
          label={t('cloudProjects')}
          value={cloudProjectCount ?? '—'}
          tone="neutral"
          size="sm"
          className="bg-background"
        />
      </div>
    </header>
  );
}

function Fact(props: {
  icon: LucideIcon;
  value?: string;
  detail?: string;
  mono?: boolean;
}) {
  const { detail, icon: Icon, mono, value } = props;
  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" />
      <span className={cn('truncate', mono && 'font-mono')}>{value}</span>
      {detail && (
        <span className="truncate text-muted-foreground/70">{detail}</span>
      )}
    </span>
  );
}
