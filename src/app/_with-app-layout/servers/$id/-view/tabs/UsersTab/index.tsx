import { useMemo, useState } from 'react';

import {
  FolderIcon,
  PlusIcon,
  RefreshCwIcon,
  TerminalIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { useServerUserCreateSidepanel } from '@/features/server-user-create-sidepanel';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
  dataTable,
  usePagedList,
} from '@/shared/presentation/organisms/DataPanel';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useServerDataModel } from '../../../-model/server-data';

interface UserItem {
  username: string;
  uid: string;
  gid: string;
  home: string;
  shell: string;
}

const NO_LOGIN_SHELLS = new Set(['-', '/usr/sbin/nologin', '/bin/false']);

/** Local Linux accounts, searched and paged in the browser. */
export default function UsersTab() {
  const t = useDevetekTranslations('page.serverDetail.users');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const [serverId] = useServerDataModel((s) => [String(s.serverId)]);
  const [openServerUserCreateSidepanel] = useServerUserCreateSidepanel();
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [searchQuery, setSearchQuery] = useState('');

  const [responseUsers, refreshUsers] = ApiServer.Origin.$Id.User.useGet({
    serverId,
  });

  const users = useAdapter(responseUsers, (raw): UserItem[] =>
    raw.map((item) =>
      typeof item === 'string'
        ? { username: item, uid: '-', gid: '-', home: '-', shell: '-' }
        : {
            username: item.username ?? '-',
            uid: String(item.uid ?? '-'),
            gid: String(item.gid ?? '-'),
            home: item.home_dir ?? item.home ?? '-',
            shell: item.shell ?? '-',
          },
    ),
  );

  const allUsers = useMemo(
    () => (users.$status === 'success' ? users : []),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allUsers;
    return allUsers.filter((user) =>
      [user.username, user.uid, user.gid, user.home, user.shell].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [allUsers, searchQuery]);

  const { page, pageItems, setPage, totalPage } = usePagedList(filteredUsers);

  const shellUsers = allUsers.filter(
    (user) => !NO_LOGIN_SHELLS.has(user.shell),
  ).length;
  const homeUsers = allUsers.filter((user) =>
    user.home.startsWith('/home/'),
  ).length;
  const isLoading = responseUsers.$status === 'loading';

  const handleClickAddUser = () => {
    openServerUserCreateSidepanel({ serverId, onCreated: refreshUsers });
  };

  const handleClickDelete = (username: string) => {
    openDialog({
      title: t('deleteTitle'),
      content: t.rich('deleteMessage', {
        username,
        code: (chunks) => <code>{chunks}</code>,
      }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const response = await ApiServer.Origin.$Id.User.Delete.doDelete({
            serverId,
            payload: { username },
          });

          if (response.$status === 'success') {
            openToaster({
              variant: 'success',
              message: t.rich('deleted', {
                username,
                code: (chunks) => <code>{chunks}</code>,
              }),
            });
            refreshUsers();
            return;
          }

          openToaster({
            variant: 'error',
            title: t.rich('deleteFailed', {
              username,
              code: (chunks) => <code>{chunks}</code>,
            }),
            message: getApiErrorDetail(response.error),
          });
        },
      },
    });
  };

  return (
    <DataPanel
      icon={UsersIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            disabled={isLoading}
            onClick={() => refreshUsers()}
          >
            <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
            {tCommon('refresh')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky', 'h-8 px-3 text-xs')}
            onClick={handleClickAddUser}
          >
            <PlusIcon className="size-4" />
            {t('add')}
          </button>
        </>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={UsersIcon}
            label={t('tiles.total')}
            value={users.$status === 'success' ? allUsers.length : '-'}
          />
          <StatTile
            size="sm"
            icon={TerminalIcon}
            tone="sky"
            label={t('tiles.shells')}
            value={users.$status === 'success' ? shellUsers : '-'}
          />
          <StatTile
            size="sm"
            icon={FolderIcon}
            tone="emerald"
            label={t('tiles.homes')}
            value={users.$status === 'success' ? homeUsers : '-'}
          />
        </>
      }
      toolbar={
        <>
          <DataPanelSearch
            value={searchQuery}
            placeholder={t('searchPlaceholder')}
            onChange={setSearchQuery}
          />
          <DataPanelMeta>
            {tCommon('rows', { count: filteredUsers.length })}
          </DataPanelMeta>
        </>
      }
      footer={
        <DataPanelPagination
          page={page}
          totalPage={totalPage}
          onPageChange={setPage}
        />
      }
    >
      {users.$status === 'initial' || users.$status === 'loading' ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : users.$status === 'failed' ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(users.error)}
          action={<DataPanelRetry onClick={() => refreshUsers()} />}
        />
      ) : filteredUsers.length === 0 ? (
        <DataPanelState
          state="empty"
          title={searchQuery ? t('noMatch') : t('empty')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={dataTable.head}>
                {t('table.username')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-20')}>
                {t('table.uid')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-20')}>
                {t('table.gid')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.home')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.shell')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-28 text-right')}>
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((user) => (
              <TableRow key={`${user.username}-${user.uid}`}>
                <TableCell className={cn(dataTable.cell, 'font-semibold')}>
                  {user.username}
                </TableCell>
                <TableCell className={dataTable.monoCell}>{user.uid}</TableCell>
                <TableCell className={dataTable.monoCell}>{user.gid}</TableCell>
                <TableCell
                  className={cn(dataTable.monoCell, 'max-w-56 truncate')}
                  title={user.home}
                >
                  {user.home}
                </TableCell>
                <TableCell
                  className={cn(
                    dataTable.monoCell,
                    'max-w-48 truncate',
                    NO_LOGIN_SHELLS.has(user.shell) && 'text-muted-foreground',
                  )}
                  title={user.shell}
                >
                  {user.shell}
                </TableCell>
                <TableCell className={cn(dataTable.cell, 'text-right')}>
                  <Button
                    size="sm"
                    buttonStyle="outline"
                    buttonColor="secondary"
                    className="text-red-600 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300"
                    onClick={() => handleClickDelete(user.username)}
                  >
                    <Trash2Icon className="size-4" />
                    {t('delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}
