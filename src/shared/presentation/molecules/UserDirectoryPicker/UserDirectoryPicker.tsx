import { useState } from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  MailIcon,
  SearchIcon,
  UserIcon,
} from 'lucide-react';

import { ApiUser } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/atoms/Popover';

export type UserDirectoryPickerUser = DTOs.User;

export interface UserDirectoryPickerProps {
  label?: string;
  selectedUser?: UserDirectoryPickerUser | null;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  pageSize?: number;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
  onSelect: (user: UserDirectoryPickerUser) => void;
}

const DEFAULT_PAGE_SIZE = 5;

export default function UserDirectoryPicker(props: UserDirectoryPickerProps) {
  const {
    label,
    selectedUser,
    placeholder = 'Select user',
    searchPlaceholder = 'Search by name, username, or email',
    emptyText = 'No users found',
    loadingText = 'Loading users...',
    pageSize = DEFAULT_PAGE_SIZE,
    disabled,
    errorMessage,
    className,
    onSelect,
  } = props;

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearchInput] = useDebounceValue(searchInput);

  const [response] = ApiUser.Find.useGet({
    username: debouncedSearchInput.trim() || undefined,
    page,
    pageSize,
  });

  const users = response.$status === 'success' ? (response.users ?? []) : [];
  const pagination =
    response.$status === 'success' ? response.pagination : undefined;
  const totalPage = Math.max(1, pagination?.total_page ?? 1);
  const isInitialLoading =
    response.$status === 'loading' && response.prevData == null;
  const isRefreshing =
    response.$status === 'loading' && response.prevData != null;

  const selectedLabel = selectedUser
    ? selectedUser.fullname ||
      selectedUser.username ||
      selectedUser.email ||
      String(selectedUser.id)
    : '';
  const selectedSubtext = selectedUser
    ? selectedUser.email || selectedUser.username || String(selectedUser.id)
    : '';

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleSelect = (user: UserDirectoryPickerUser) => {
    onSelect(user);
    setOpen(false);
  };

  return (
    <section className={cn('flex flex-col gap-1.5', className)}>
      {label && <p className="text-sm font-medium">{label}</p>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full min-h-12 rounded-lg border bg-card px-3 py-2 text-left transition-colors',
              'flex items-center justify-between gap-3 hover:bg-accent/10',
              'disabled:cursor-not-allowed disabled:opacity-60',
              errorMessage && 'border-destructive/60',
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <UserAvatar user={selectedUser} />
              <span className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    'truncate text-sm font-medium',
                    !selectedUser && 'text-muted-foreground',
                  )}
                >
                  {selectedLabel || placeholder}
                </span>
                {selectedUser && selectedSubtext && (
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedSubtext}
                  </span>
                )}
              </span>
            </span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] min-w-[320px] overflow-hidden p-0"
        >
          <div className="flex flex-col bg-card">
            <div className="border-b p-2">
              <label className="flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 transition-colors focus-within:border-primary">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                />
                {isRefreshing && (
                  <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />
                )}
              </label>
            </div>

            <div className="max-h-72 min-h-44 overflow-y-auto py-1">
              {isInitialLoading ? (
                <div className="flex h-44 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" />
                  {loadingText}
                </div>
              ) : users.length === 0 ? (
                <div className="flex h-44 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="size-7 opacity-50" />
                  {emptyText}
                </div>
              ) : (
                <ul className="space-y-0.5 px-1">
                  {users.map((user) => {
                    const userId = String(user.id);
                    const isSelected =
                      String(selectedUser?.id ?? '') === userId;
                    const title =
                      user.fullname || user.username || user.email || userId;
                    const subtitle = user.email || user.username || userId;

                    return (
                      <li key={userId}>
                        <button
                          type="button"
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
                            'hover:bg-accent/10',
                            isSelected && 'bg-primary/10',
                          )}
                          onClick={() => handleSelect(user)}
                        >
                          <UserAvatar user={user} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">
                              {title}
                            </span>
                            {subtitle && (
                              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                                <MailIcon className="size-3 shrink-0" />
                                <span className="truncate">{subtitle}</span>
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <CheckIcon className="size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t bg-background/60 px-3 py-2">
              <button
                type="button"
                aria-label="Previous users page"
                disabled={page <= 1 || response.$status !== 'success'}
                className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
              >
                <ChevronLeftIcon className="size-3.5" />
              </button>

              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPage}
              </p>

              <button
                type="button"
                aria-label="Next users page"
                disabled={page >= totalPage || response.$status !== 'success'}
                className="rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() =>
                  setPage((currentPage) => Math.min(totalPage, currentPage + 1))
                }
              >
                <ChevronRightIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className="text-xs font-medium text-destructive">{errorMessage}</p>
      )}
    </section>
  );
}

function UserAvatar(props: { user?: UserDirectoryPickerUser | null }) {
  const { user } = props;
  const name = user?.fullname || user?.username || user?.email || 'User';

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        <UserIcon className="size-4 text-muted-foreground" />
      )}
    </span>
  );
}
