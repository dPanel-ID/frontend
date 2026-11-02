import dayjs from 'dayjs';
import { CloudIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { personOf } from '@/entities/user/lib/person';
import { UserLink } from '@/entities/user/ui/UserLink';


import type { DTOs } from '@/shared/api';
import { Badge } from '@/shared/presentation/atoms/Badge';

export default function CloudProjectListRow(props: {
  cloudProject: DTOs.CloudProjectV1;
  serverCount: number;
}) {
  const { cloudProject, serverCount } = props;
  const t = useDevetekTranslations('page.dashboard.cloudProjects');
  const displayName = cloudProject.name || t('unknown');
  const provider = cloudProject.provider || t('unknownProvider');
  const team = cloudProject.organization?.name;
  const person = personOf(cloudProject.user);
  const updatedAt = cloudProject.updated_at
    ? t('updated', {
        date: dayjs(cloudProject.updated_at).format('YYYY-MM-DD HH:mm'),
      })
    : t('notUpdated');

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-amber-600">
        <CloudIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">
          {displayName}
        </span>
        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="shrink-0">{provider} /</span>
          {team || !person ? (
            <span className="truncate">{team || t('unknownOwner')}</span>
          ) : (
            <UserLink {...person} className="shrink" />
          )}
          <span className="shrink-0">/ {updatedAt}</span>
        </span>
      </span>
      <Badge variant="outline" className="shrink-0">
        {t('servers', { count: serverCount })}
      </Badge>
    </div>
  );
}
