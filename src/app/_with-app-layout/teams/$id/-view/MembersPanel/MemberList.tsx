import dayjs from 'dayjs';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { MemberListState } from '../-presentation/MemberListState';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useMembersDataModel } from '../../-model/members-data';
import { teamAccessOf } from '../../../-lib/team-roles';

import { MemberActions, MemberIdentity, MemberRoles } from './MemberParts';
import type { MemberRow } from './types';

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])];
}

/** The members on this page, as a table or as cards. */
export default buildResponseView({
  useResponse: () => useMembersDataModel((s) => s.members),
  fallbackError: MemberListState.Error,
  fallbackLoading: MemberListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const [derivedViewMode] = useFilterModel((s) => [s.derivedViewMode]);
    const t = useDevetekTranslations();
    const emit = useEmit();

    if (list.length < 1) {
      return (
        <div className="p-4">
          <EmptyState
            title={t('page.teamDetail.emptyState.title')}
            message={t('page.teamDetail.emptyState.message')}
            ctaText={t('page.teamDetail.emptyState.cta')}
            ctaOnClick={() => emit('@team-members/add-member', undefined)}
          />
        </div>
      );
    }

    const members: MemberRow[] = list.flatMap((member) => {
      const { created_at, id, role, role_id, role_ids, roles, user, user_id } =
        member;
      if (!id) return [];

      const roleIds = uniqueStrings([
        ...(role_ids ?? []),
        role_id,
        role?.id,
        ...(roles ?? []).map((item) => item.id),
      ]);
      const roleLabels = uniqueStrings([
        ...(roles ?? []).map((item) => item.name || item.id),
        role?.name || role_id,
      ]);

      return [
        {
          id,
          name:
            user?.fullname ||
            user?.username ||
            user?.email ||
            user_id ||
            String(id),
          username: user?.username || undefined,
          email: user?.email || undefined,
          avatarUrl: user?.avatar_url || undefined,
          access: teamAccessOf([...roleIds, ...roleLabels]),
          roleLabels,
          roleIds,
          joinedAt: created_at || undefined,
        },
      ];
    });

    if (derivedViewMode === 'table') {
      return <MemberTable members={members} />;
    }

    return (
      <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    );
  },
});

function MemberTable(props: { members: MemberRow[] }) {
  const { members } = props;
  const t = useDevetekTranslations('page.teamDetail');

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-4">{t('memberColumn')}</TableHead>
          <TableHead>{t('roleColumn')}</TableHead>
          <TableHead>{t('joinedColumn')}</TableHead>
          <TableHead className="px-4 text-right">
            {t('actionsColumn')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="max-w-[22rem] px-4">
              <MemberIdentity member={member} />
            </TableCell>
            <TableCell className="max-w-[24rem]">
              <MemberRoles member={member} />
            </TableCell>
            <TableCell>
              <Joined at={member.joinedAt} />
            </TableCell>
            <TableCell className="px-4">
              <MemberActions member={member} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MemberCard(props: { member: MemberRow }) {
  const { member } = props;

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-background/50 p-3">
      <MemberIdentity member={member} />
      <MemberRoles member={member} />
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <Joined at={member.joinedAt} />
        <MemberActions member={member} />
      </div>
    </article>
  );
}

function Joined(props: { at?: string }) {
  const { at } = props;
  const t = useDevetekTranslations('page.teamDetail');
  const locale = useDevetekLocale();

  if (!at) return <span className="text-xs text-muted-foreground">-</span>;

  return (
    <span
      className="text-xs text-muted-foreground"
      title={dayjs(at).format('YYYY/MM/DD HH:mm')}
    >
      {t('joinedAgo', { when: getDistanceFromNow(at, locale) })}
    </span>
  );
}
