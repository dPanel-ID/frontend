import dayjs from 'dayjs';
import { UserIcon, UsersIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { personOf } from '@/entities/user/lib/person';
import { UserLink } from '@/entities/user/ui/UserLink';

import type { AdminResourceV2 } from '@/shared/api/-dtos';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { buildPaginationV2 } from '@/widgets/ui-atomic-builder/atom-pagination-v2';

import { statusTone } from '../../-lib/resource-types';
import { useAdminResourcesDataModel } from '../../-model/resources-data';
import { ResourceListState } from '../ResourceListState';

const ResourcePagination = buildPaginationV2({});

/** The selected type's rows, newest first, with owner and workspace. */
export default function ResourceTable() {
  const t = useDevetekTranslations('page.adminResources');
  const [type, resources, page, search, changePage, refresh] =
    useAdminResourcesDataModel((s) => [
      s.type,
      s.resources,
      s.page,
      s.search,
      s.changePage,
      s.refresh,
    ]);

  const data =
    resources.$status === 'success'
      ? resources
      : resources.$status === 'loading'
        ? resources.prevData
        : undefined;

  if (resources.$status === 'failed') {
    return <ResourceListState.Error {...resources} onRetry={refresh} />;
  }
  if (!data) return <ResourceListState.Loading />;

  if (data.items.length < 1) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        {search ? t('empty.search', { search }) : t(`empty.${type}`)}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">
                {t(`columns.${type}.name`)}
              </TableHead>
              <TableHead>{t(`columns.${type}.kind`)}</TableHead>
              <TableHead>{t('columns.owner')}</TableHead>
              <TableHead>{t('columns.workspace')}</TableHead>
              <TableHead className="px-4">{t('columns.created')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <ResourceRow key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t('total', { count: data.total })}
        </p>
        {data.totalPage > 1 && (
          <ResourcePagination
            currentPage={page}
            totalPage={data.totalPage}
            onClickBack={() => changePage(Math.max(1, page - 1))}
            onClickForward={() =>
              changePage(Math.min(data.totalPage, page + 1))
            }
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}

function ResourceRow(props: { item: AdminResourceV2 }) {
  const { item } = props;
  const t = useDevetekTranslations('page.adminResources');
  const owner = personOf(item.owner);
  const isTeam = item.workspace?.type === 'team';

  return (
    <TableRow className="align-top">
      <TableCell className="max-w-[22rem] px-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold" title={item.name}>
            {item.name || t('unnamed')}
          </span>
          <span className="truncate font-mono text-[0.7rem] text-muted-foreground">
            {[`#${item.id}`, item.detail].filter(Boolean).join(' · ')}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-[12rem]">
        <div className="flex flex-col items-start gap-1">
          {item.kind ? (
            <span className="truncate text-xs text-primary/80">
              {item.kind}
            </span>
          ) : (
            <span className="text-xs text-primary/40">—</span>
          )}
          {item.status && (
            <StatusPill tone={statusTone(item.status)} label={item.status} />
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-[13rem] text-xs text-primary/80">
        {owner ? (
          <UserLink {...owner} />
        ) : (
          <span className="text-primary/40">{t('unknownOwner')}</span>
        )}
      </TableCell>
      <TableCell className="max-w-[14rem]">
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
          {isTeam ? (
            <UsersIcon
              className="size-3.5 shrink-0 text-violet-600 dark:text-violet-300"
              aria-hidden
            />
          ) : (
            <UserIcon
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-primary/80">
              {isTeam
                ? item.workspace?.name || t('workspace.unnamedTeam')
                : t('workspace.personal')}
            </span>
            {isTeam && (
              <span className="truncate text-[0.65rem] text-muted-foreground">
                {t('workspace.team')}
                {item.workspace?.id ? ` · ${item.workspace.id}` : ''}
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        {item.created_at ? (
          <span className="text-xs text-primary/80">
            {dayjs(item.created_at).format('YYYY/MM/DD HH:mm')}
          </span>
        ) : (
          <span className="text-xs text-primary/40">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
