import type { ReactNode } from 'react';

import { CalendarIcon, Clock3Icon, ShieldIcon, UsersIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useEmit } from '../../-model/events';
import { useTeamMemberCount } from '../../-model/team-member-count';
import { TeamAccessBadge } from '../../-presentation/TeamAccessBadge';
import { TeamMark } from '../../-presentation/TeamMark';
import { TeamStatusPill } from '../../-presentation/TeamStatusPill';

import { TeamActions } from './TeamActions';
import type { TeamRow } from './types';

/** One team: who is in it, what you can do in it, and its actions. */
export function TeamCard(props: { team: TeamRow }) {
  const { team } = props;
  const emit = useEmit();
  const t = useDevetekTranslations('page.teams.card');
  const locale = useDevetekLocale();
  const members = useTeamMemberCount(team.id);

  const open = () =>
    emit('@teams/open--details', { orgId: team.id, orgName: team.name });

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-violet-400/40">
      <div className="flex min-w-0 items-start gap-3">
        <TeamMark name={team.name} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={open}
              className="min-w-0 truncate text-left text-lg font-bold tracking-tight hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {team.name}
            </button>
            <TeamStatusPill status={team.status} />
            {team.isActive && (
              <span className="rounded-md border border-sky-400/30 bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                {t('activeWorkspace')}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            #{team.id}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 divide-x rounded-xl border bg-background/50">
        <Fact icon={UsersIcon} label={t('members')}>
          {members.loading ? (
            <Spinner className="size-3.5" />
          ) : (
            <span className="text-base font-bold tabular-nums">
              {members.count ?? '-'}
            </span>
          )}
        </Fact>
        <Fact icon={ShieldIcon} label={t('yourRole')}>
          {team.access ? <TeamAccessBadge access={team.access} /> : '-'}
        </Fact>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
          {team.createdAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              {t('created', {
                when: getDistanceFromNow(team.createdAt, locale),
              })}
            </span>
          )}
          {team.updatedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3Icon className="size-3.5" />
              {t('updated', {
                when: getDistanceFromNow(team.updatedAt, locale),
              })}
            </span>
          )}
        </div>
        <TeamActions id={team.id} name={team.name} />
      </div>
    </article>
  );
}

function Fact(props: { icon: LucideIcon; label: string; children: ReactNode }) {
  const { children, icon: Icon, label } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1 px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="flex min-h-6 min-w-0 items-center">{children}</dd>
    </div>
  );
}
