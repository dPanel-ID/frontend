import dayjs from 'dayjs';
import {
  BuildingIcon,
  EyeIcon,
  GithubIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ServerIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  applicationSource,
  applicationStatusKey,
  applicationTone,
  isApplicationMoving,
} from '../../-lib/describe-application';

export interface AppTableHandlers {
  openDetails: () => void;
  edit: () => void;
  migrateOwnership: () => void;
  remove: () => void;
}

interface AppTableProps {
  list: ApplicationCard[];
  handlersFor: (application: ApplicationCard) => AppTableHandlers;
}

/** The dense view: one line per application, for larger estates. */
export default function AppTable(props: AppTableProps) {
  const { handlersFor, list } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[840px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.applications.table.application')}
            </TableHead>
            <TableHead>{t('page.applications.table.status')}</TableHead>
            <TableHead>{t('page.applications.table.source')}</TableHead>
            <TableHead>{t('page.applications.table.servers')}</TableHead>
            <TableHead>{t('page.applications.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.applications.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((application) => {
            const handlers = handlersFor(application);
            const servers = application.additionalInfo.servers;

            return (
              <TableRow key={application.id}>
                <TableCell className="px-4">
                  <div className="flex min-w-0 flex-col">
                    <button
                      type="button"
                      onClick={handlers.openDetails}
                      className="max-w-full truncate text-left text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {application.identity.name}
                    </button>
                    <span className="truncate text-xs text-muted-foreground">
                      {application.identity.bundleType}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPill
                    tone={applicationTone(application)}
                    pulse={isApplicationMoving(application)}
                    label={t(applicationStatusKey(application))}
                  />
                </TableCell>
                <TableCell>
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-primary/80">
                    {application.identity.source === 'repository' && (
                      <GithubIcon className="size-3 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">
                      {applicationSource(application)}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-primary/80">
                    <ServerIcon className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">
                      {servers.length > 0
                        ? (servers[0]?.name ?? servers[0]?.address ?? '—')
                        : '—'}
                      {servers.length > 1 && ` +${servers.length - 1}`}
                    </span>
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-primary/80">
                      {getDistanceFromNow(
                        application.timestamp.updated,
                        locale,
                      )}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {dayjs(application.timestamp.updated).format(
                        'YYYY/MM/DD HH:mm',
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      aria-label={t('common.actions.details')}
                      title={t('common.actions.details')}
                      onClick={handlers.openDetails}
                      className="inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={t('common.actions.more')}
                          title={t('common.actions.more')}
                          className="inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handlers.edit}>
                          <PencilIcon className="size-4" />
                          {t('common.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlers.migrateOwnership}>
                          <BuildingIcon className="size-4" />
                          {t('common.actions.migrateOwnership')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={handlers.remove}
                        >
                          <Trash2Icon className="size-4" />
                          {t('common.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
