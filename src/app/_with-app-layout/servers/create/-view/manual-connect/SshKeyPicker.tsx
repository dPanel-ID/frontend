import { useMemo, useState } from 'react';

import {
  CheckIcon,
  KeyRoundIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useSSHKeyCreateModal } from '@/features/ssh-create-modal';

import type { DTOs } from '@/shared/api';
import { ApiSecret } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

const PAGE_SIZE = 6;

/** Selectable grid of the workspace's SSH keys, with search and create. */
export default function SshKeyPicker(props: {
  selectedID?: string;
  onSelect: (sshKey: DTOs.SshKeyV1) => void;
}) {
  const { onSelect, selectedID } = props;
  const t = useDevetekTranslations();
  const [openSSHKeyCreateModal] = useSSHKeyCreateModal();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounceValue(search);

  const [response, refresh] = ApiSecret.SshKey.Find.useGet({
    page,
    pageSize: PAGE_SIZE,
    searchQuery: debouncedSearch.trim() || undefined,
  });

  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const sshKeys = useMemo(
    () =>
      (data?.secrets ?? []).filter(
        (sshKey): sshKey is DTOs.SshKeyV1 & { id: number } => sshKey.id != null,
      ),
    [data?.secrets],
  );
  const totalPages = Math.max(1, data?.pagination.total_page ?? 1);
  const showSearch = Boolean(data) && (sshKeys.length > 0 || search.trim());

  const handleCreate = () =>
    openSSHKeyCreateModal({
      onSubmitSuccess: () => {
        setPage(1);
        refresh();
      },
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative min-w-48 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              inputSize="sm"
              value={search}
              placeholder={t('page.servers.create.ssh.searchPlaceholder')}
              aria-label={t('page.servers.create.ssh.searchLabel')}
              className="pl-9"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('common.actions.refresh')}
            title={t('common.actions.refresh')}
            onClick={() => refresh()}
          >
            <RefreshCwIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={handleCreate}
          >
            <PlusIcon className="size-4" />
            {t('page.servers.create.ssh.createKey')}
          </Button>
        </div>
      </div>

      {response.$status === 'loading' && !data && (
        <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed">
          <Spinner />
        </div>
      )}

      {response.$status === 'failed' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorDetail(response.error)}
        </div>
      )}

      {data && sshKeys.length === 0 && (
        <button
          type="button"
          onClick={handleCreate}
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:border-violet-400/50 hover:bg-violet-500/5"
        >
          <KeyRoundIcon className="size-6" />
          {search.trim()
            ? t('page.servers.create.ssh.emptySearch')
            : t('page.servers.create.ssh.emptyKeys')}
        </button>
      )}

      {sshKeys.length > 0 && (
        <div
          role="radiogroup"
          aria-label={t('page.servers.create.ssh.keysTitle')}
          className="grid gap-2 sm:grid-cols-2"
        >
          {sshKeys.map((sshKey) => {
            const id = String(sshKey.id);
            const isSelected = id === selectedID;
            const name =
              sshKey.name ||
              t('page.servers.create.ssh.fallbackKeyName', { id: sshKey.id });

            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(sshKey)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all',
                  'hover:border-violet-400/50 hover:bg-violet-500/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50',
                  isSelected &&
                    'border-violet-400/70 bg-violet-500/10 shadow-sm shadow-violet-500/10',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground',
                    isSelected &&
                      'border-violet-400/40 text-violet-600 dark:text-violet-300',
                  )}
                >
                  <KeyRoundIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {t('page.servers.create.ssh.keyId', { id: sshKey.id })}
                    {sshKey.data?.length
                      ? t('page.servers.create.ssh.keyLengthSuffix', {
                          length: sshKey.data.length,
                        })
                      : ''}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent',
                    isSelected &&
                      'border-violet-500 bg-violet-500 text-white dark:border-violet-400 dark:bg-violet-400 dark:text-violet-950',
                  )}
                >
                  <CheckIcon className="size-3" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {t('page.servers.create.ssh.paginationSummary', {
              page: Math.min(page, totalPages),
              totalPage: totalPages,
              totalItem: data.pagination.total_item,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {t('page.servers.create.ssh.previousPage')}
            </Button>
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              {t('page.servers.create.ssh.nextPage')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
