import { useState } from 'react';

import { useSidepanelEmit } from '@/services/sidepanel/model/event';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
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

import type { ServerUserCreateSidepanelProps as Props } from '../rules/types';

const LINUX_USERNAME_MAX_LENGTH = 32;
const LINUX_USERNAME_PATTERN = /^[a-z_][a-z0-9_-]{0,31}$/;
const GROUP_ADMIN = 'administrator';

export default function ServerUserCreateSidepanel(props: Props) {
  const { serverId, onCreated } = props;

  const emitSidepanel = useSidepanelEmit();
  const [pushToast] = useToaster();
  const [selectedUser, setSelectedUser] =
    useState<UserDirectoryPickerUser | null>(null);
  const [username, setUsername] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [homeDirectory, setHomeDirectory] = useState('/home/');
  const [group, setGroup] = useState(GROUP_ADMIN);
  const [isCreating, setIsCreating] = useState(false);
  const usernameError =
    username && !isValidLinuxUsername(username)
      ? 'Use lowercase letters, numbers, underscores, or hyphens. Start with a letter or underscore.'
      : '';

  const canSubmit =
    !isCreating &&
    Boolean(username.trim()) &&
    !usernameError &&
    Boolean(selectedUserId) &&
    Boolean(password.trim());

  const handleSelectUser = (user: UserDirectoryPickerUser) => {
    const linuxUsername = resolveDefaultLinuxUsername(user);

    setSelectedUser(user);
    setSelectedUserId(user.id);
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

  const handleCreate = async () => {
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

    setIsCreating(true);

    const response = await ApiServer.Origin.$Id.User.Create.doPost({
      serverId,
      payload: {
        id: selectedUserId,
        username: normalizedUsername,
        password,
        group,
        home_dir: homeDirectory,
      },
    });

    if (response.$status === 'failed') {
      pushToast('error', response.error.message);
      setIsCreating(false);
      return;
    }

    pushToast('success', 'Create user machine in progress!');
    onCreated?.();
    emitSidepanel('%%sidepanel/pop', null);
    setIsCreating(false);
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
        <UserDirectoryPicker
          label="dPanel User"
          selectedUser={selectedUser}
          placeholder="Select user"
          searchPlaceholder="Search by username, name, or email"
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
    user.email || user.fullname || user.username || String(user.id),
    `user-${user.id}`,
  );
}

function normalizeLinuxUsername(value: string, fallback: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  const sourceValue = trimmedValue.includes('@')
    ? trimmedValue.split('@')[0]
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
