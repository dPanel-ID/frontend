
import dayjs from 'dayjs';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { UserLink } from '@/entities/user/ui/UserLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import type { CloudProjectCard } from '../../../-lib/describe-cloud-project';
import { CloudProjectActions } from '../CloudProjectActions';
import {
  CloudProjectAccessPill,
  CloudProjectIdentity,
  CloudProjectStatusPill,
} from '../CloudProjectIdentity';
import type { CloudProjectHandlers } from '../useCloudProjectHandlers';

export interface CloudTableProps {
  cloudProjects: CloudProjectCard[];
  handlersFor: (cloudProject: CloudProjectCard) => CloudProjectHandlers;
}

/** The dense view: one line per account, for workspaces with many of them. */
export default function CloudTable(props: CloudTableProps) {
  const { cloudProjects, handlersFor } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.cloudProjects.table.account')}
            </TableHead>
            <TableHead>{t('page.cloudProjects.table.status')}</TableHead>
            <TableHead>{t('page.cloudProjects.table.owner')}</TableHead>
            <TableHead>{t('page.cloudProjects.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.cloudProjects.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cloudProjects.map((cloudProject) => {
            const handlers = handlersFor(cloudProject);

            return (
              <TableRow key={cloudProject.id}>
                <TableCell className="px-4">
                  <CloudProjectIdentity
                    cloudProject={cloudProject}
                    size="sm"
                    onClickName={handlers.openDetails}
                  />
                </TableCell>
                <TableCell>
                  <CloudProjectStatusPill cloudProject={cloudProject} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-primary/80">
                      {cloudProject.owner ? (
                        <UserLink {...cloudProject.owner} />
                      ) : (
                        '—'
                      )}
                    </span>
                    <CloudProjectAccessPill cloudProject={cloudProject} />
                  </div>
                </TableCell>
                <TableCell>
                  {cloudProject.updatedAt ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-primary/80">
                        {getDistanceFromNow(cloudProject.updatedAt, locale)}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {dayjs(cloudProject.updatedAt).format(
                          'YYYY/MM/DD HH:mm',
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-primary/40">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4">
                  <CloudProjectActions handlers={handlers} layout="menu" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
