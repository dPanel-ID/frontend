import { useMemo, useState } from 'react';

import {
  FolderIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import {
  ServerManagementIconButton,
  ServerManagementMetric,
  ServerManagementSidepanel,
  ServerManagementState,
  ServerManagementSurface,
  ServerManagementToolbar,
  serverManagementTableClassNames,
} from '@/features/server-management-sidepanel-ui';
import { useServerUserCreateSidepanel } from '@/features/server-user-create-sidepanel';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import type { ServerUsersSidepanelProps as Props } from '../rules/types';

interface UserItem {
  username: string;
  uid: string;
  gid: string;
  home: string;
  shell: string;
}

export default function ServerUsersSidepanel(props: Props) {
  const { serverId, serverName } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [openServerUserCreateSidepanel] = useServerUserCreateSidepanel();
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const [responseUsers, refreshUsers] = ApiServer.Origin.$Id.User.useGet({
    serverId,
  });

  const users = useAdapter(responseUsers, (raw): UserItem[] => {
    return raw.map((item) => {
      if (typeof item === 'string') {
        return {
          username: item,
          uid: '-',
          gid: '-',
          home: '-',
          shell: '-',
        };
      }

      return {
        username: item.username ?? '-',
        uid: String(item.uid ?? '-'),
        gid: String(item.gid ?? '-'),
        home: item.home_dir ?? item.home ?? '-',
        shell: item.shell ?? '-',
      };
    });
  });

  const filteredUsers = useMemo(() => {
    if (users.$status !== 'success') {
      return [];
    }

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    if (!normalizedSearchQuery) {
      return users;
    }

    return users.filter((item) => {
      return [item.username, item.uid, item.gid, item.home, item.shell].some(
        (value) => value.toLowerCase().includes(normalizedSearchQuery),
      );
    });
  }, [searchQuery, users]);

  const userStats = useMemo(() => {
    if (users.$status !== 'success') {
      return {
        total: '-',
        shellUsers: '-',
        homeUsers: '-',
      };
    }

    return {
      total: users.length,
      shellUsers: users.filter(
        (user) =>
          !['-', '/usr/sbin/nologin', '/bin/false'].includes(user.shell),
      ).length,
      homeUsers: users.filter((user) => user.home.startsWith('/home/')).length,
    };
  }, [users]);

  const handleClickAddUser = () => {
    openServerUserCreateSidepanel({
      $mode: 'push',
      serverId,
      onCreated: refreshUsers,
    });
  };

  const handleClickDeleteUser = (username: string) => {
    return () => {
      openDialog({
        title: 'Delete Linux User',
        content: (
          <>
            Are you sure you want to delete Linux user <br />
            <code>{username}</code> ?
          </>
        ),
        variant: 'warning',
        actions: {
          variant: 'YesNo',
          yes: async () => {
            const deleteResponse =
              await ApiServer.Origin.$Id.User.Delete.doDelete({
                serverId,
                payload: {
                  username,
                },
              });

            if (deleteResponse.$status === 'success') {
              openToaster({
                variant: 'success',
                message: (
                  <>
                    Successfully deleted Linux user <code>{username}</code>
                  </>
                ),
              });

              refreshUsers();
              return;
            }

            openToaster({
              variant: 'error',
              title: (
                <>
                  Failed to delete Linux user <code>{username}</code>
                </>
              ),
              message: getApiErrorDetail(deleteResponse.error),
            });
          },
        },
      });
    };
  };

  const isLoading = responseUsers.$status === 'loading';

  return (
    <ServerManagementSidepanel
      title="Linux Users"
      subtitle={serverName || `Server ID: ${serverId}`}
      icon={UsersIcon}
      heading="Linux user manager"
      description="Search local accounts, inspect shells and home directories, and add managed users."
      actions={
        <>
          <ServerManagementIconButton
            label="Refresh users"
            icon={RefreshCwIcon}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => refreshUsers()}
          />
          <Button
            size="sm"
            buttonColor="primary"
            buttonStyle="flat"
            onClick={handleClickAddUser}
          >
            <PlusIcon className="size-4" />
            Add User
          </Button>
        </>
      }
      metrics={
        <>
          <ServerManagementMetric
            label="Users"
            value={userStats.total}
            icon={UsersIcon}
          />
          <ServerManagementMetric
            label="Login shells"
            value={userStats.shellUsers}
            icon={ShieldIcon}
          />
          <ServerManagementMetric
            label="Home dirs"
            value={userStats.homeUsers}
            icon={FolderIcon}
          />
        </>
      }
    >
      <ServerManagementToolbar>
        <label className="relative min-w-[260px] flex-1">
          <span className="sr-only">Search Linux users</span>
          <Input
            className="pl-9"
            inputSize="sm"
            value={searchQuery}
            placeholder="Search username, UID, home or shell"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </label>

        <p className="text-xs text-muted-foreground">
          {users.$status === 'success'
            ? `${filteredUsers.length} / ${users.length} users`
            : 'Waiting for user data'}
        </p>
      </ServerManagementToolbar>

      {users.$status === 'initial' || users.$status === 'loading' ? (
        <ServerManagementState
          state="loading"
          title="Loading Linux users"
          description="Reading account data from the server."
        />
      ) : users.$status === 'failed' ? (
        <ServerManagementState
          state="failed"
          title="Failed to load users"
          description={getApiErrorDetail(users.error)}
          action={
            <ServerManagementIconButton
              label="Retry"
              icon={RefreshCwIcon}
              onClick={() => refreshUsers()}
            />
          }
        />
      ) : filteredUsers.length < 1 ? (
        <ServerManagementState
          title={
            searchQuery.trim() ? 'No users match the filter' : 'No users found'
          }
          description={
            searchQuery.trim()
              ? 'Try another username, UID, home directory or shell.'
              : 'The agent did not report any Linux users for this server.'
          }
        />
      ) : (
        <ServerManagementSurface
          title="Linux users"
          description="Local account identity and login configuration"
          meta={`${filteredUsers.length} rows`}
        >
          <Table>
            <TableHeader className="bg-background/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className={serverManagementTableClassNames.head}>
                  Username
                </TableHead>
                <TableHead className={serverManagementTableClassNames.head}>
                  UID
                </TableHead>
                <TableHead className={serverManagementTableClassNames.head}>
                  GID
                </TableHead>
                <TableHead className={serverManagementTableClassNames.head}>
                  Home
                </TableHead>
                <TableHead className={serverManagementTableClassNames.head}>
                  Shell
                </TableHead>
                <TableHead className={serverManagementTableClassNames.head}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map((item, index) => (
                <TableRow key={`${item.username}-${item.uid}-${index}`}>
                  <TableCell
                    className={cn(
                      serverManagementTableClassNames.cell,
                      'font-semibold text-primary',
                    )}
                  >
                    {item.username}
                  </TableCell>
                  <TableCell
                    className={cn(
                      serverManagementTableClassNames.mutedCell,
                      'font-mono',
                    )}
                  >
                    {item.uid}
                  </TableCell>
                  <TableCell
                    className={cn(
                      serverManagementTableClassNames.mutedCell,
                      'font-mono',
                    )}
                  >
                    {item.gid}
                  </TableCell>
                  <TableCell
                    className={cn(
                      serverManagementTableClassNames.mutedCell,
                      'max-w-60 truncate font-mono',
                    )}
                    title={item.home}
                  >
                    {item.home}
                  </TableCell>
                  <TableCell
                    className={cn(
                      serverManagementTableClassNames.mutedCell,
                      'max-w-[200px] truncate font-mono',
                    )}
                    title={item.shell}
                  >
                    {item.shell}
                  </TableCell>
                  <TableCell className={serverManagementTableClassNames.cell}>
                    <Button
                      size="sm"
                      buttonStyle="outline"
                      buttonColor="secondary"
                      className="text-red-500 hover:text-red-600"
                      onClick={handleClickDeleteUser(item.username)}
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ServerManagementSurface>
      )}
    </ServerManagementSidepanel>
  );
}
