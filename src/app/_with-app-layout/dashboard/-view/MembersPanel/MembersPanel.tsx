import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';
import { Badge } from '@/shared/presentation/atoms/Badge';

import { DashboardSection, EmptyLine } from '../../-presentation';

export default function MembersPanel(props: {
  members: DTOs.OrganizationPeopleV1[];
  isTeamWorkspace: boolean;
  totalMembers?: number;
}) {
  const { isTeamWorkspace, members, totalMembers } = props;
  const t = useDevetekTranslations('page.dashboard.members');

  return (
    <DashboardSection
      title={t('title')}
      description={t(
        isTeamWorkspace ? 'teamDescription' : 'personalDescription',
      )}
      action={
        isTeamWorkspace ? (
          <Link
            to="/teams"
            search={{
              page: 1,
              viewMode: 'auto',
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            {t('manage')}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        ) : undefined
      }
    >
      <div className="grid gap-2">
        {isTeamWorkspace && members.length ? (
          members.slice(0, 5).map((member) => {
            const displayName =
              member.user?.fullname || member.user?.username || t('unknown');
            return (
              <div
                key={member.id || member.user_id || displayName}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user?.email || t('noEmail')}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t('member')}
                </Badge>
              </div>
            );
          })
        ) : (
          <EmptyLine>
            {isTeamWorkspace ? t('emptyTeam') : t('personalOnly')}
          </EmptyLine>
        )}

        {totalMembers != null && totalMembers > members.length && (
          <p className="text-xs text-muted-foreground">
            {t('moreMembers', { count: totalMembers - members.length })}
          </p>
        )}
      </div>
    </DashboardSection>
  );
}
