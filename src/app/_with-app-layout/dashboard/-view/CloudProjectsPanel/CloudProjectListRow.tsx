import dayjs from 'dayjs';
import { CloudIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { personOf } from '@/entities/user/lib/person';
import { UserLink } from '@/entities/user/ui/UserLink';

import type { DTOs } from '@/shared/api';
import { Badge } from '@/shared/presentation/atoms/Badge';

import { SUBTITLE_SEPARATOR, joinSubtitle } from '../../-lib/subtitle';

export default function CloudProjectListRow(props: {
  cloudProject: DTOs.CloudProjectV1;
  serverCount: number;
}) {
  const { cloudProject, serverCount } = props;
  const t = useDevetekTranslations('page.dashboard.cloudProjects');
  const displayName = cloudProject.name?.trim() || t('unknown');
  const team = cloudProject.organization?.name?.trim();
  // A team owner is plain text; a personal owner is a link to their profile.
  const person = team ? undefined : personOf(cloudProject.user);
  const meta = joinSubtitle([
    cloudProject.provider?.trim() || t('unknownProvider'),
    team,
  ]);
  const updatedAt = cloudProject.updated_at
    ? t('updated', {
        date: dayjs(cloudProject.updated_at).format('YYYY-MM-DD HH:mm'),
      })
    : t('notUpdated');

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-amber-600">
        <CloudIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold text-primary"
          title={displayName}
        >
          {displayName}
        </p>
        <p
          className="flex min-w-0 items-center text-xs text-muted-foreground"
          data-testid="cloud-project-meta"
        >
          <span className="truncate" title={meta}>
            {meta}
          </span>
          {person && (
            <>
              <span aria-hidden="true" className="shrink-0 whitespace-pre">
                {SUBTITLE_SEPARATOR}
              </span>
              <UserLink {...person} className="shrink" />
            </>
          )}
        </p>
        <p className="truncate text-xs tabular-nums text-muted-foreground">
          {updatedAt}
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 self-center">
        {t('servers', { count: serverCount })}
      </Badge>
    </div>
  );
}
