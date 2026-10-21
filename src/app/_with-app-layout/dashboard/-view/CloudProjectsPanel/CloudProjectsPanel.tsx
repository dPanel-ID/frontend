import { useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import { ArrowRightIcon, CloudIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { DashboardSection, EmptyLine } from '../../-presentation';

import CloudProjectListRow from './CloudProjectListRow';

export default function CloudProjectsPanel(props: {
  cloudProjects: DTOs.CloudProjectV1[];
  servers: DTOs.MachineV1[];
  totalCloudProjects?: number;
}) {
  const { cloudProjects, servers, totalCloudProjects } = props;
  const t = useDevetekTranslations('page.dashboard.cloudProjects');

  const serversByCloudProjectId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const server of servers) {
      if (!server.cloud_id) continue;
      counts.set(server.cloud_id, (counts.get(server.cloud_id) ?? 0) + 1);
    }
    return counts;
  }, [servers]);

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <Link
          to="/backend/cloud-projects"
          search={{
            page: 1,
            viewMode: 'auto',
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewAll')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-lg border bg-background p-3">
          <span className="flex size-10 items-center justify-center rounded-md border text-amber-600">
            <CloudIcon className="size-5" />
          </span>
          {totalCloudProjects == null ? (
            <Shimmer className="mt-4 h-8 w-16" />
          ) : (
            <p className="mt-4 text-3xl font-bold tabular-nums text-primary">
              {totalCloudProjects}
            </p>
          )}
          <p className="mt-1 text-sm font-bold text-primary">{t('total')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('totalHelp')}</p>
        </div>

        <div className="grid gap-2">
          {cloudProjects.length ? (
            cloudProjects.map((cloudProject, index) => (
              <CloudProjectListRow
                key={cloudProject.id ?? cloudProject.name ?? index}
                cloudProject={cloudProject}
                serverCount={
                  cloudProject.id
                    ? (serversByCloudProjectId.get(String(cloudProject.id)) ??
                      0)
                    : 0
                }
              />
            ))
          ) : (
            <EmptyLine>{t('empty')}</EmptyLine>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}
