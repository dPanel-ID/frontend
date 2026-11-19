import { useState } from 'react';

import { useSidepanelEmit } from '@/services/sidepanel/model/event';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';
import { useToaster } from '@/services/toaster';

import { ApiServer, ApiServiceAccounts } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { secretFieldAutofillProps } from '@/shared/libs/browser/autofill';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { UserDirectoryPicker } from '@/shared/presentation/molecules/UserDirectoryPicker';
import type { UserDirectoryPickerUser } from '@/shared/presentation/molecules/UserDirectoryPicker';

import { serverWorkspaceId, toServiceAccountOptions } from '../lib/target';
import type { ServerUserCreateSidepanelProps as Props } from '../rules/types';

const LINUX_USERNAME_MAX_LENGTH = 32;
const LINUX_USERNAME_PATTERN = /^[a-z_][a-z0-9_-]{0,31}$/;
const GROUP_ADMIN = 'administrator';
const GROUP_GUEST = 'guest';

type TargetKind = 'person' | 'service-account';

export default function ServerUserCreateSidepanel(props: Props) {
  const { serverId, onCreated } = props;

  const emitSidepanel = useSidepanelEmit();
  const [pushToast] = useToaster();
  const [selectedUser, setSelectedUser] =
    useState<UserDirectoryPickerUser | null>(null);
  const [username, setUsername] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [homeDirectory, setHomeDirectory] = useState('/home/');
  const [group, setGroup] = useState(GROUP_ADMIN);
  const [isCreating, setIsCreating] = useState(false);
  const [targetKind, setTargetKind] = useState<TargetKind>('person');
  const [serviceAccountId, setServiceAccountId] = useState('');

  const [responseServer] = ApiServer.Detail.$Id.useGet({ serverId });
  const teamId =
    responseServer.$status === 'success'
      ? (serverWorkspaceId(responseServer) ?? '')
      : '';
  // Listing needs workspace owner or admin rights; for anyone else the
  // request fails and the choice stays hidden.
  const [responseAccounts] = ApiServiceAccounts.Find.useGet({
    workspaceId: teamId,
    options: { skip: !teamId },
  });
  const canChooseServiceAccount = responseAccounts.$status === 'success';
  const accountOptions =
    responseAccounts.$status === 'success'
      ? toServiceAccountOptions(responseAccounts)
      : [];
  const isServiceAccount = targetKind === 'service-account';
  const selectedAccount = accountOptions.find(
    (account) => account.id === serviceAccountId,
  );
  const usernameError =
    username && !isValidLinuxUsername(username)
      ? 'Use lowercase letters, numbers, underscores, or hyphens. Start with a letter or underscore.'
      : '';

  const canSubmit =
    !isCreating &&
    (isServiceAccount
      ? Boolean(selectedAccount)
      : Boolean(username.trim()) &&
        !usernameError &&
        Boolean(selectedUserId) &&
        Boolean(password.trim()));

  const handleChangeTargetKind = (value: string) => {
    const kind = value as TargetKind;

    setTargetKind(kind);
    setGroup(kind === 'service-account' ? GROUP_GUEST : GROUP_ADMIN);
  };

  const handleSelectUser = (user: UserDirectoryPickerUser) => {
    const linuxUsername = resolveDefaultLinuxUsername(user);

    setSelectedUser(user);
    setSelectedUserId(String(user.id));
    setUsername(linuxUsername);
    setHomeDirectory(`/home/${linuxUsername}`);
  };

  const handleChangeUsername = (value: string) => {
    const previousUsername = username;
    const linuxUsername = normalizeLinuxUsername(value, 'dpanel');

    setUsername(linuxUsername);
    setHomeDirectory((currentHomeDirectory) => {
      if (
        currentHomeDirectory === '' ||
        currentHomeDirectory === '/home/' ||
        currentHomeDirectory === `/home/${previousUsername}`
      ) {
        return linuxUsername ? `/home/${linuxUsername}` : '/home/';
      }

      return currentHomeDirectory;
    });
  };

  const submit = async (
    payload: Parameters<
      typeof ApiServer.Origin.$Id.User.Create.doPost
    >[0]['payload'],
  ) => {
    setIsCreating(true);

    const response = await ApiServer.Origin.$Id.User.Create.doPost({
      serverId,
      payload,
    });

    if (response.$status === 'failed') {
      pushToast('error', getApiErrorDetail(response.error));
      setIsCreating(false);
      return;
    }

    pushToast('success', 'Create user machine in progress!');
    onCreated?.();
    emitSidepanel('%%sidepanel/pop', null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    if (isServiceAccount) {
      if (!selectedAccount) {
        pushToast('error', 'Please select a service account.');
        return;
      }

      await submit({ service_account_id: selectedAccount.id, group });
      return;
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      pushToast('error', 'Username is required.');
      return;
    }

    if (!selectedUserId) {
      pushToast('error', 'Please select a valid username.');
      return;
    }

    if (!isValidLinuxUsername(normalizedUsername)) {
      pushToast('error', 'Linux username is not valid.');
      return;
    }

    if (!password.trim()) {
      pushToast('error', 'Password is required.');
      return;
    }

    await submit({
      id: selectedUserId,
      username: normalizedUsername,
      password,
      group,
      home_dir: homeDirectory,
    });
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[520px]">
      <Layout.CloseButton position="right" />

      <Layout.Title
        title="Add New"
        subtitle={`Server ID: ${serverId}`}
        hasCloseButton={false}
      />

      <Layout.Content className="flex flex-col gap-y-3 pb-4">
        {canChooseServiceAccount && (
          <div className="grid gap-y-1">
            <span className="text-sm font-medium">Add for</span>
            <Select value={targetKind} onValueChange={handleChangeTargetKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">dPanel user</SelectItem>
                <SelectItem value="service-account">Service account</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isServiceAccount ? (
          <div className="grid gap-y-1">
            <span className="text-sm font-medium">Service Account</span>
            {accountOptions.length > 0 ? (
              <Select
                value={serviceAccountId}
                onValueChange={setServiceAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                This workspace has no service accounts yet. Create one on the
                team&apos;s Service accounts tab.
              </p>
            )}
            {selectedAccount && (
              <p className="text-xs text-muted-foreground">
                Linux username: {selectedAccount.username}. It has no password,
                so nobody can log in with one.
              </p>
            )}
          </div>
        ) : (
          <>
            <UserDirectoryPicker
              label="dPanel User"
              selectedUser={selectedUser}
              placeholder="Select user"
              searchPlaceholder="Search by username or name"
              pageSize={5}
              onSelect={handleSelectUser}
            />

            <div className="grid gap-y-1">
              <span className="text-sm font-medium">Linux Username</span>
              <Input
                value={username}
                placeholder="Linux username"
                onChange={(e) => handleChangeUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase Linux account name used on the server.
              </p>
              {usernameError && (
                <p className="text-xs font-medium text-destructive">
                  {usernameError}
                </p>
              )}
            </div>

            <div className="grid gap-y-1">
              <span className="text-sm font-medium">Password</span>
              <Input
                type="password"
                {...secretFieldAutofillProps}
                value={password}
                placeholder="Input password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-y-1">
              <span className="text-sm font-medium">Home Directory</span>
              <Input
                value={homeDirectory}
                placeholder="e.g. /home/devops"
                onChange={(e) => setHomeDirectory(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="grid gap-y-1">
          <span className="text-sm font-medium">Group</span>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GROUP_ADMIN}>admin</SelectItem>
              <SelectItem value="staff">staff</SelectItem>
              <SelectItem value="guest">guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Layout.Content>

      <Layout.Cta className="gap-y-2">
        <Button disabled={!canSubmit} onClick={handleCreate}>
          {isCreating ? 'Creating...' : 'Create User'}
        </Button>

        <Button
          buttonColor="secondary"
          disabled={isCreating}
          onClick={() => emitSidepanel('%%sidepanel/pop', null)}
        >
          Close
        </Button>
      </Layout.Cta>
    </Layout>
  );
}

function resolveDefaultLinuxUsername(user: UserDirectoryPickerUser) {
  return normalizeLinuxUsername(
    user.fullname || user.username || String(user.id),
    `user-${user.id}`,
  );
}

function normalizeLinuxUsername(value: string, fallback: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  const sourceValue = trimmedValue.includes('@')
    ? (trimmedValue.split('@')[0] ?? '')
    : trimmedValue;
  let username = sourceValue
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .slice(0, LINUX_USERNAME_MAX_LENGTH);

  if (!username || !/^[a-z_]/.test(username)) {
    username = `u${username}`;
  }

  username = username.slice(0, LINUX_USERNAME_MAX_LENGTH).replace(/-+$/, '');

  if (!isValidLinuxUsername(username)) {
    return normalizeLinuxUsername(fallback, 'dpanel');
  }

  return username;
}

function isValidLinuxUsername(username: string) {
  return LINUX_USERNAME_PATTERN.test(username);
}
