import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  ListTreeIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
  ServerIcon,
  TrashIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import type { ApplicationCard } from '@/entities/application/rules/schema';
import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import { ApiApplication, ApiLoadBalancer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import type { AddBackendMode, UpstreamDraft } from '../-lib/types';
import {
  areUpstreamDraftRowsValid,
  createDraftBackendId,
  formatApplicationBackendDestination,
  getApplicationCardRuntimePort,
  getApplicationDeploymentServers,
  getApplicationIdFromDraftRow,
  getApplicationRouteTargets,
  getUpstreamDraftDisplay,
  getUpstreamDrafts,
  normalizeDraftRowOrder,
  serializeUpstreamDraftRows,
  toLoadBalancerUpdatePayload,
} from '../-lib/upstream-drafts';

import { DetailSurface, EmptyInline } from './-presentation/surfaces';

export function UpstreamsTab(props: {
  details: LoadBalancerDetails;
  onSaved: () => void;
}) {
  const { details, onSaved } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const sourceRows = useMemo(() => getUpstreamDrafts(details), [details]);
  const [draftRows, setDraftRows] = useState(sourceRows);
  const [baselineRows, setBaselineRows] = useState(sourceRows);
  const [isAddingBackend, setIsAddingBackend] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New saved upstreams replace the draft and its baseline. Adjusted during
  // render, so the stale rows are never painted.
  const [rowsSource, setRowsSource] = useState(sourceRows);
  if (rowsSource !== sourceRows) {
    setRowsSource(sourceRows);
    setDraftRows(sourceRows);
    setBaselineRows(sourceRows);
  }

  const hasDraftChanges =
    serializeUpstreamDraftRows(draftRows) !==
    serializeUpstreamDraftRows(baselineRows);
  const canSaveDraft =
    hasDraftChanges && areUpstreamDraftRowsValid(details, draftRows);

  const removeRow = (rowId: string) => {
    setDraftRows((rows) =>
      rows
        .filter((row) => row.id !== rowId)
        .map((row, rowIndex) => ({ ...row, order: rowIndex + 1 })),
    );
  };

  const moveRow = (rowId: string, direction: -1 | 1) => {
    setDraftRows((rows) => {
      const currentIndex = rows.findIndex((row) => row.id === rowId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= rows.length) {
        return rows;
      }

      const nextRows = [...rows];
      const currentRow = nextRows[currentIndex];
      const targetRow = nextRows[nextIndex];

      if (!currentRow || !targetRow) return rows;

      nextRows[currentIndex] = targetRow;
      nextRows[nextIndex] = currentRow;

      return normalizeDraftRowOrder(nextRows);
    });
  };

  const addRow = (row: Omit<UpstreamDraft, 'id' | 'order'>) => {
    setDraftRows((rows) => [
      ...rows,
      {
        ...row,
        id: createDraftBackendId(),
        order: rows.length + 1,
      },
    ]);
    setIsAddingBackend(false);
  };

  const resetDraft = () => {
    setDraftRows(baselineRows);
  };

  const saveDraft = async () => {
    if (!canSaveDraft || isSaving) return;

    setIsSaving(true);
    const normalizedRows = normalizeDraftRowOrder(draftRows);

    try {
      const response = await ApiLoadBalancer.Update.$Id.doPost({
        loadBalancerId: details.id,
        advanceMode: true,
        ...toLoadBalancerUpdatePayload(details, normalizedRows),
      });

      if (response.$status === 'success') {
        setDraftRows(normalizedRows);
        setBaselineRows(normalizedRows);
        openToaster({
          variant: 'success',
          message: t('page.loadBalancersDetail.upstreams.saveSuccess'),
        });
        onSaved();
        return;
      }

      openToaster({
        variant: 'error',
        title: t('page.loadBalancersDetail.upstreams.saveFailed'),
        message: response.error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailSurface
      icon={ListTreeIcon}
      title={t('page.loadBalancersDetail.upstreams.title')}
      description={t('page.loadBalancersDetail.upstreams.description')}
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => setIsAddingBackend((value) => !value)}
            aria-expanded={isAddingBackend}
          >
            <PlusIcon />
            {t('page.loadBalancersDetail.upstreams.addBackend')}
          </Button>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!hasDraftChanges || isSaving}
            onClick={resetDraft}
          >
            <RefreshCwIcon />
            {t('page.loadBalancersDetail.upstreams.resetDraft')}
          </Button>
          <Button
            size="sm"
            disabled={!canSaveDraft || isSaving}
            onClick={saveDraft}
            title={t('page.loadBalancersDetail.upstreams.saveTitle')}
          >
            {isSaving ? <Spinner /> : <SaveIcon />}
            {t('common.actions.save')}
          </Button>
        </div>
      }
    >
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        {t('page.loadBalancersDetail.upstreams.backendRequired')}
      </div>

      {isAddingBackend ? (
        <AddBackendDraftPanel
          lbKind={details.configuration.lbKind}
          onAdd={addRow}
          onCancel={() => setIsAddingBackend(false)}
        />
      ) : null}

      {draftRows.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {draftRows.map((row, index) => (
            <UpstreamEditorCard
              key={row.id}
              index={index}
              row={row}
              totalRows={draftRows.length}
              onMove={moveRow}
              onRemove={removeRow}
            />
          ))}
        </div>
      ) : (
        <EmptyInline>
          {t('page.loadBalancersDetail.upstreams.empty')}
        </EmptyInline>
      )}
    </DetailSurface>
  );
}

export function AddBackendDraftPanel(props: {
  lbKind: LoadBalancerDetails['configuration']['lbKind'];
  onAdd: (row: Omit<UpstreamDraft, 'id' | 'order'>) => void;
  onCancel: () => void;
}) {
  const { lbKind, onAdd, onCancel } = props;
  const t = useDevetekTranslations();
  const [mode, setMode] = useState<AddBackendMode>('application');
  const [match, setMatch] = useState(lbKind === 'l4' ? 'TCP' : '/*');
  const [address, setAddress] = useState('localhost');
  const [port, setPort] = useState('80');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationCard>();
  const [responseApplications] = ApiApplication.Find.useGet({
    page: 1,
    limit: 12,
    name: applicationSearch,
  });
  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));
  const normalizedPort = Number(port);
  const canAddAddress =
    address.trim().length > 0 &&
    Number.isInteger(normalizedPort) &&
    normalizedPort >= 1 &&
    normalizedPort <= 65_535;
  const canAdd =
    mode === 'application' ? Boolean(selectedApplication) : canAddAddress;

  const addBackend = () => {
    if (mode === 'application') {
      if (!selectedApplication) return;

      onAdd({
        applicationId: selectedApplication.id,
        destination: formatApplicationBackendDestination(
          selectedApplication.identity.name,
          selectedApplication.id,
        ),
        href: `/applications/${selectedApplication.id}`,
        kind: 'application',
        match,
        port: getApplicationCardRuntimePort(selectedApplication),
        protocol: 'http',
      });
      return;
    }

    if (!canAddAddress) return;

    onAdd({
      destination: address.trim(),
      kind: 'address',
      match,
      port: String(normalizedPort),
      protocol: lbKind === 'l4' ? 'tcp' : 'http',
    });
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border bg-background">
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h4 className="text-base font-bold">
              {t('page.loadBalancersDetail.upstreams.addBackendTitle')}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t('page.loadBalancersDetail.upstreams.addBackendDesc')}
            </p>
          </div>
          <div
            className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1"
            aria-label={t('page.loadBalancersDetail.upstreams.backendType')}
          >
            <BackendModeButton
              active={mode === 'application'}
              label={t('page.loadBalancersDetail.upstreams.kind.application')}
              onClick={() => setMode('application')}
            />
            <BackendModeButton
              active={mode === 'address'}
              label={t('page.loadBalancersDetail.upstreams.kind.address')}
              onClick={() => setMode('address')}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <label className="grid gap-1.5 text-sm font-semibold">
          <span>{t('page.loadBalancersDetail.upstreams.match')}</span>
          <Input
            inputSize="sm"
            className="font-mono"
            value={match}
            placeholder={t(
              'page.loadBalancersDetail.upstreams.matchPlaceholder',
            )}
            onChange={(event) => setMatch(event.currentTarget.value)}
          />
        </label>

        {mode === 'application' ? (
          <div className="grid gap-2">
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.application')}</span>
              <span className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  inputSize="sm"
                  className="pl-9"
                  value={applicationSearch}
                  placeholder={t(
                    'page.loadBalancersDetail.upstreams.searchApplications',
                  )}
                  onChange={(event) =>
                    setApplicationSearch(event.currentTarget.value)
                  }
                />
              </span>
            </label>

            {applications.$status === 'loading' ? (
              <BackendPickerState>
                <Spinner />
                <span>{t('page.loadBalancersCreate.loading')}</span>
              </BackendPickerState>
            ) : null}

            {applications.$status === 'failed' ? (
              <BackendPickerState>
                {t('page.loadBalancersDetail.upstreams.applicationLoadFailed')}
              </BackendPickerState>
            ) : null}

            {applications.$status === 'success' ? (
              applications.list.length > 0 ? (
                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                  {applications.list.map((application) => (
                    <ApplicationBackendOption
                      key={application.id}
                      application={application}
                      selected={selectedApplication?.id === application.id}
                      onSelect={() => setSelectedApplication(application)}
                    />
                  ))}
                </div>
              ) : (
                <BackendPickerState>
                  {t('page.loadBalancersDetail.upstreams.noApplications')}
                </BackendPickerState>
              )
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.address')}</span>
              <Input
                inputSize="sm"
                className="font-mono"
                value={address}
                placeholder={t(
                  'page.loadBalancersDetail.upstreams.addressPlaceholder',
                )}
                onChange={(event) => setAddress(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.port')}</span>
              <Input
                inputSize="sm"
                type="number"
                min={1}
                max={65_535}
                className="font-mono"
                value={port}
                placeholder={t(
                  'page.loadBalancersDetail.upstreams.portPlaceholder',
                )}
                onChange={(event) => setPort(event.currentTarget.value)}
              />
            </label>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onCancel}
          >
            {t('common.actions.cancel')}
          </Button>
          <Button disabled={!canAdd} onClick={addBackend}>
            <PlusIcon />
            {t('page.loadBalancersDetail.upstreams.addToDraft')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BackendModeButton(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const { active, label, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-bold transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-background text-primary shadow-xs'
          : 'text-muted-foreground hover:bg-background/70 hover:text-primary',
      )}
    >
      {label}
    </button>
  );
}

export function ApplicationBackendOption(props: {
  application: ApplicationCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { application, onSelect, selected } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">
          {application.identity.name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {application.additionalInfo.repoUrl ?? application.id}
        </span>
      </span>
      {selected ? <CheckCircle2Icon className="size-5 text-primary" /> : null}
    </button>
  );
}

export function BackendPickerState(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-4 text-sm font-semibold text-muted-foreground">
      {props.children}
    </div>
  );
}

export function UpstreamEditorCard(props: {
  index: number;
  onMove: (rowId: string, direction: -1 | 1) => void;
  onRemove: (rowId: string) => void;
  row: UpstreamDraft;
  totalRows: number;
}) {
  const { index, onMove, onRemove, row, totalRows } = props;
  const t = useDevetekTranslations();
  const applicationId =
    row.kind === 'application' ? getApplicationIdFromDraftRow(row) : '';
  const [responseApplication] = ApiApplication.Detail.$Id.useGet({
    applicationId,
    options: {
      skip: row.kind !== 'application' || applicationId.length === 0,
    },
  });
  const display = getUpstreamDraftDisplay(row, responseApplication);
  const kindLabel =
    row.kind === 'application'
      ? t('page.loadBalancersDetail.upstreams.kind.application')
      : row.kind === 'static'
        ? t('page.loadBalancersDetail.upstreams.kind.static')
        : row.kind === 'redirect'
          ? t('page.loadBalancersDetail.upstreams.kind.redirect')
          : t('page.loadBalancersDetail.upstreams.kind.address');

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {t('common.terms.order')} #{String(index + 1).padStart(2, '0')}
              </Badge>
              <Badge variant="secondary">{kindLabel}</Badge>
              {row.kind === 'application' && row.applicationId ? (
                <Badge
                  variant="outline"
                  title={t(
                    'page.loadBalancersDetail.upstreams.addressMode.label',
                  )}
                >
                  {t(
                    `page.loadBalancersDetail.upstreams.addressMode.${row.addressMode ?? 'legacy'}`,
                  )}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 truncate text-sm font-semibold">
              {display.destination}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={index === 0}
            onClick={() => onMove(row.id, -1)}
            aria-label={t('page.loadBalancersDetail.upstreams.moveUp')}
            title={t('page.loadBalancersDetail.upstreams.moveUp')}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={index === totalRows - 1}
            onClick={() => onMove(row.id, 1)}
            aria-label={t('page.loadBalancersDetail.upstreams.moveDown')}
            title={t('page.loadBalancersDetail.upstreams.moveDown')}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            danger
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => onRemove(row.id)}
            aria-label={t('page.loadBalancersDetail.upstreams.removeBackend')}
            title={t('page.loadBalancersDetail.upstreams.removeBackend')}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(140px,0.35fr)_minmax(0,1fr)_140px]">
        <ReadOnlyRouteValue
          label={t('page.loadBalancersDetail.upstreams.match')}
          value={row.match}
          mono
        />
        <ReadOnlyRouteValue
          label={t('page.loadBalancersDetail.upstreams.destination')}
          value={display.destination}
          href={row.href}
          mono={row.kind !== 'application'}
        />
        <ReadOnlyRouteValue
          label={
            row.kind === 'redirect'
              ? t('page.loadBalancersDetail.upstreams.redirectCode')
              : t('common.terms.port')
          }
          value={
            display.port ||
            (responseApplication.$status === 'loading'
              ? t('page.loadBalancersCreate.loading')
              : t('common.terms.unavailable'))
          }
          mono
        />
      </div>

      {row.kind === 'application' && row.applicationId ? (
        <ApplicationRouteTargets
          row={row}
          application={
            responseApplication.$status === 'success'
              ? responseApplication
              : undefined
          }
        />
      ) : null}
    </div>
  );
}

/** Where an application route really sends traffic, per server. */
export function ApplicationRouteTargets(props: {
  application?: DTOs.ApplicationV1;
  row: UpstreamDraft;
}) {
  const { application, row } = props;
  const t = useDevetekTranslations();
  const targets = getApplicationRouteTargets(
    row,
    getApplicationDeploymentServers(application),
  );

  return (
    <div className="mt-3 grid gap-1.5 text-sm font-semibold">
      <span>{t('page.loadBalancersDetail.upstreams.targets')}</span>
      {targets.length > 0 ? (
        <ul className="grid gap-1.5">
          {targets.map((target) => (
            <li
              key={`${target.address}-${target.machineId ?? ''}`}
              className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-card px-3 py-2"
            >
              <span className="font-mono text-primary">{target.address}</span>
              {target.machineId ? (
                <a
                  href={`/servers/${target.machineId}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:opacity-70"
                >
                  <ServerIcon className="size-3.5" />
                  {target.serverName
                    ? `${target.serverName} (#${target.machineId})`
                    : `${t('page.loadBalancersDetail.upstreams.server')} #${target.machineId}`}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <span className="rounded-lg border border-dashed bg-card px-3 py-2 text-xs font-normal text-muted-foreground">
          {t('page.loadBalancersDetail.upstreams.targetsPending')}
        </span>
      )}
    </div>
  );
}

export function ReadOnlyRouteValue(props: {
  href?: string;
  label: string;
  mono?: boolean;
  value: string;
}) {
  const { href, label, mono, value } = props;

  const valueClassName = cn(
    'flex min-h-10 w-full items-center rounded-lg border bg-card px-3 py-2 text-sm font-semibold text-primary',
    mono && 'font-mono',
  );

  return (
    <div className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      {href ? (
        <a
          href={href}
          aria-label={`${label}: ${value}`}
          title={value}
          className={cn(
            valueClassName,
            'underline underline-offset-2 hover:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className="truncate">{value}</span>
        </a>
      ) : (
        <span
          aria-label={`${label}: ${value}`}
          title={value}
          className={valueClassName}
        >
          <span className="truncate">{value}</span>
        </span>
      )}
    </div>
  );
}
