import dayjs from 'dayjs';
import { CloudIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

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
  const owner =
    cloudProject.organization?.name ||
    cloudProject.user?.fullname ||
    cloudProject.user?.username ||
    cloudProject.user?.email ||
    t('unknownOwner');
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
        <span className="block truncate text-xs text-muted-foreground">
          {provider} / {owner} / {updatedAt}
        </span>
      </span>
      <Badge variant="outline" className="shrink-0">
        {t('servers', { count: serverCount })}
      </Badge>
    </div>
  );
}
