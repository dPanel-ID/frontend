import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import {
  CheckCircle2Icon,
  CloudIcon,
  Globe2Icon,
  SearchIcon,
  ServerIcon,
  TerminalIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useController } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { useEmit } from '@/features/artifact-new-sidepanel/model/events';
import { useArtifactNewGeneralModel } from '@/features/artifact-new-sidepanel/model/general';
import type { DeploymentTargetsData } from '@/features/artifact-new-sidepanel/model/workers';
import { useWorkersModel } from '@/features/artifact-new-sidepanel/model/workers';

import type { Response } from '@/shared/libs/api-client/rules/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Pagination } from '@/shared/presentation/atoms/Pagination';
import { resolveExplicitTargetSelection } from '@/shared/lib/explicit-target/resolve-target-selection';
import { ApiHostGroup } from '@/shared/api';

import {
  FieldLoading,
  createFieldError,
} from '../../_presentation/FieldStates';
import FieldWrapper from '../../_presentation/FieldWrapper';

const [guard, useWorkers] = guardedSelects({
  fallbackLoading: FieldLoading,
  fallbackError: createFieldError({
    i18nKey: 'sidepanel.artifactNew.deploymentTarget.onError',
    useTryAgain: () => {
      const emit = useEmit();
      return () => emit('#artifact-new-sidepanel/workers-refresh', null);
    },
  }),
})(
  couple(
    useWorkersModel,
    (s: any): Response<DeploymentTargetsData> => s.workers,
  ),
);

const WorkersList = guard(() => {
  const { form } = useArtifactNewGeneralModel();
  const t = useDevetekTranslations('sidepanel.artifactNew.deploymentTarget');

  const servers = useWorkers((s) => s.servers);
  const pagination = useWorkers((s) => s.pagination);

  const setSearchQuery = useWorkersModel((s) => s.search.setQuery);
  const page = useWorkersModel((s) => s.pagination.page);
  const setPage = useWorkersModel((s) => s.pagination.setPage);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search);

  const { field } = useController({
    control: form.control,
    name: 'workerId',
  });
  const { field: hostGroupField } = useController({
    control: form.control,
    name: 'hostGroupId',
  });
  const { field: targetModeField } = useController({
    control: form.control,
    name: 'targetMode',
  });

  const selectedServer = servers.find((server) => server.id === field.value);
  const [hostGroupResponse] = ApiHostGroup.Detail.$Id.useGet({
    id: selectedServer?.hostGroupId ?? '',
    options: {
      skip: !selectedServer?.hostGroupId,
    },
  });

  const hostGroupTarget =
    hostGroupResponse.$status === 'success'
      ? {
          id: String(hostGroupResponse.id ?? ''),
          label: hostGroupResponse.name ?? `Group ${hostGroupResponse.id ?? ''}`,
          memberCount: hostGroupResponse.members?.length ?? 0,
        }
      : undefined;

  const targetSelection = resolveExplicitTargetSelection({
    preferredMode:
      targetModeField.value === 'hostgroup' ? 'hostgroup' : 'server',
    serverId: field.value,
    hostGroup: hostGroupTarget,
  });

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  useEffect(() => {
    hostGroupField.onChange(selectedServer?.hostGroupId ?? '');
    targetModeField.onChange('server');
  }, [hostGroupField, selectedServer?.hostGroupId, targetModeField]);

  const totalPage = Math.max(1, pagination.total_page);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <div className="grid gap-3">
      <label className="relative">
        <span className="sr-only">{t('searchLabel')}</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={handleSearch}
          className="h-10 pl-9 text-sm"
        />
      </label>

      <div
        className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border bg-background p-2"
        role="radiogroup"
        aria-label={t('title')}
      >
        {servers.length === 0 ? (
          <p className="rounded-md border border-dashed bg-card px-3 py-5 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          servers.map((server) => {
            const isSelected = field.value === server.id;
            const status = server.status || t('unknown');
            const statusKey = String(server.status || '').toLowerCase();
            const metadata = [
              {
                icon: Globe2Icon,
                label: server.address,
              },
              {
                icon: TerminalIcon,
                label: server.sshPort
                  ? t('sshPort', { port: server.sshPort })
                  : undefined,
              },
              {
                icon: UserRoundIcon,
                label: server.defaultUser,
              },
              {
                icon: CloudIcon,
                label: [server.provider, server.region]
                  .filter(Boolean)
                  .join(' / '),
              },
            ].filter((item) => item.label);

            return (
              <button
                key={server.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => field.onChange(server.id)}
                className={cn(
                  'group rounded-lg border bg-card p-3 text-left transition-all',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                  isSelected && 'border-primary bg-primary/10',
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground',
                      isSelected && 'border-primary/50 text-primary',
                    )}
                  >
                    <ServerIcon className="size-5" />
                  </span>

                  <span className="grid min-w-0 flex-1 gap-2">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-primary">
                        {server.hostname}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                          statusKey === 'ready'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : statusKey === 'failed'
                              ? 'border-destructive/30 bg-destructive/10 text-destructive'
                              : 'bg-background text-muted-foreground',
                        )}
                      >
                        <CheckCircle2Icon className="size-3" />
                        {status}
                      </span>
                    </span>

                    <span className="flex min-w-0 flex-wrap gap-1.5">
                      {metadata.map((item) => {
                        const Icon = item.icon;

                        return (
                          <span
                            key={`${server.id}-${item.label}`}
                            className="inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            <Icon className="size-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </span>
                        );
                      })}
                      {server.system ? (
                        <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {server.system}
                        </span>
                      ) : null}
                    </span>
                  </span>

                  <span
                    className={cn(
                      'mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-transparent',
                      isSelected &&
                        'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    <CheckCircle2Icon className="size-4" />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {targetSelection.options.length > 1 ? (
        <div className="grid gap-2 rounded-lg border bg-card p-3">
          <span className="text-sm font-medium text-primary">
            Explicit deploy target
          </span>
          <Select
            value={targetSelection.activeMode}
            onValueChange={(value) => targetModeField.onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose target" />
            </SelectTrigger>
            <SelectContent>
              {targetSelection.options.map((option) => (
                <SelectItem key={option.mode} value={option.mode}>
                  {option.label}
                  {option.description ? ` (${option.description})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p
            className="text-xs text-muted-foreground"
            aria-live="polite"
          >
            {targetSelection.activeMode === 'server'
              ? 'Deploy to the selected server.'
              : 'Deploy to the selected server group snapshot.'}
          </p>
        </div>
      ) : null}

      {totalPage > 1 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {t('pagination', { page, totalPage })}
          </span>
          <Pagination
            currentPage={page}
            maxPage={totalPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
});

export default function FieldWorkers() {
  const { form } = useArtifactNewGeneralModel();

  const tAll = useDevetekTranslations();
  const t = useDevetekTranslations('sidepanel.artifactNew.deploymentTarget');

  return (
    <FieldWrapper fieldTitle={t('title')}>
      <p className="-mt-1 text-xs leading-5 text-muted-foreground">
        {t('description')}
      </p>
      <WorkersList />

      <ErrorInline t={tAll} message={form.formState.errors.workerId?.message} />
    </FieldWrapper>
  );
}
