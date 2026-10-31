import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import { useEmit } from '../../-model/events';
import { useTeamMemberCount } from '../../-model/team-member-count';
import { TeamAccessBadge } from '../../-presentation/TeamAccessBadge';
import { TeamMark } from '../../-presentation/TeamMark';
import { TeamStatusPill } from '../../-presentation/TeamStatusPill';

import { TeamActions } from './TeamActions';
import type { TeamRow } from './types';

/** The dense view: one line per team. */
export function TeamTable(props: { teams: TeamRow[] }) {
  const { teams } = props;
  const t = useDevetekTranslations('page.teams.table');

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">{t('team')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('yourRole')}</TableHead>
            <TableHead>{t('members')}</TableHead>
            <TableHead>{t('created')}</TableHead>
            <TableHead>{t('updated')}</TableHead>
            <TableHead className="px-4 text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TeamTableRow key={team.id} team={team} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamTableRow(props: { team: TeamRow }) {
  const { team } = props;
  const emit = useEmit();
  const t = useDevetekTranslations('page.teams');
  const locale = useDevetekLocale();
  const members = useTeamMemberCount(team.id);

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() =>
        emit('@teams/open--details', { orgId: team.id, orgName: team.name })
      }
    >
      <TableCell className="max-w-[20rem] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <TeamMark name={team.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{team.name}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {team.isActive ? t('card.activeWorkspace') : `#${team.id}`}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <TeamStatusPill status={team.status} />
      </TableCell>
      <TableCell>
        {team.access ? <TeamAccessBadge access={team.access} /> : '-'}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {members.loading ? (
          <Spinner className="size-3.5" />
        ) : (
          (members.count ?? '-')
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {team.createdAt ? getDistanceFromNow(team.createdAt, locale) : '-'}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {team.updatedAt ? getDistanceFromNow(team.updatedAt, locale) : '-'}
      </TableCell>
      <TableCell className="px-4">
        <TeamActions id={team.id} name={team.name} />
      </TableCell>
    </TableRow>
  );
}
