import type { FormEvent } from 'react';
import { useState } from 'react';

import {
  CheckCircle2Icon,
  CloudOffIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  ScanSearchIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ConsequenceList } from '@/features/server-lifecycle-dialogs';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { Input } from '@/shared/presentation/atoms/Input';
import { CloudProviderLogo } from '@/shared/presentation/molecules/CloudProviderLogo';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import type { OrphanVmRow } from '../../-lib/orphan-vms';
import type { CloudProjectOrphansPayload } from '../../-rules/usecase-types';
import type {
  OrphanDeletion,
  OrphanScanState,
} from '../../-usecase/use-orphan-vms';

interface OrphanVmsDialogProps {
  target: CloudProjectOrphansPayload | null;
  region: string;
  setRegion: (region: string) => void;
  scan: OrphanScanState;
  runScan: () => void;
  deletions: Record<string, OrphanDeletion>;
  deleteTarget: OrphanVmRow | null;
  isQueuing: boolean;
  askDelete: (row: OrphanVmRow) => void;
  cancelDelete: () => void;
  confirmDelete: (typed: string) => void;
  close: () => void;
}

/**
 * "Leftover VMs" of a cloud account: VMs dPanel created that lost their
 * server (a failed launch, a server removed from dPanel only). They still
 * cost money at the provider, so the owner can find and delete them here.
 */
export default function OrphanVmsDialog(props: OrphanVmsDialogProps) {
  const { cancelDelete, close, deleteTarget, isQueuing, target } = props;

  return (
    <Dialog
      open={target != null}
      onOpenChange={(open) => {
        if (open || isQueuing) return;
        // Escape on the confirmation goes back to the list.
        if (deleteTarget) cancelDelete();
        else close();
      }}
    >
      {target && (
        <DialogContent className="flex max-h-[90svh] max-w-2xl flex-col gap-0 p-0">
          {deleteTarget ? (
            <ConfirmDeleteBody
              key={deleteTarget.key}
              {...props}
              target={target}
              row={deleteTarget}
            />
          ) : (
            <OrphanVmsBody {...props} target={target} />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

function OrphanVmsBody(
  props: OrphanVmsDialogProps & { target: CloudProjectOrphansPayload },
) {
  const { close, region, runScan, scan, setRegion, target } = props;
  const t = useDevetekTranslations('page.cloudProjects.orphans');

  const handleScan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runScan();
  };

  return (
    <>
      <DialogHeader className="border-b p-5">
        <div className="flex items-start gap-3">
          <CloudProviderLogo
            provider={target.provider}
            fallbackLabel={target.provider}
          />
          <div className="min-w-0 text-left">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription className="mt-1">
              {t.rich('description', {
                name: target.name,
                strong: (chunks) => (
                  <strong className="text-primary">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid min-h-0 gap-4 overflow-y-auto p-5">
        <form
          onSubmit={handleScan}
          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">{t('regionLabel')}</span>
            <Input
              autoComplete="off"
              spellCheck={false}
              placeholder={t('regionPlaceholder')}
              value={region}
              disabled={scan.status === 'scanning'}
              onChange={(event) => setRegion(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className={flowCtaClassName('sky')}
            disabled={scan.status === 'scanning'}
          >
            {scan.status === 'scanning' ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : scan.status === 'idle' ? (
              <ScanSearchIcon className="size-4" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            {scan.status === 'scanning'
              ? t('scanning')
              : scan.status === 'idle'
                ? t('scan')
                : t('scanAgain')}
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
            {t('regionHint')}
          </p>
        </form>

        <ScanResult {...props} />
      </div>

      <DialogFooter className="gap-2 border-t p-5 sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('footnote')}
        </p>
        <Button buttonStyle="outline" buttonColor="secondary" onClick={close}>
          {t('close')}
        </Button>
      </DialogFooter>
    </>
  );
}

function ScanResult(props: OrphanVmsDialogProps) {
  const { askDelete, deletions, runScan, scan } = props;
  const t = useDevetekTranslations('page.cloudProjects.orphans');

  if (scan.status === 'idle') {
    return (
      <p className="rounded-xl border border-dashed p-4 text-sm leading-relaxed text-muted-foreground">
        {t('idle')}
      </p>
    );
  }

  if (scan.status === 'scanning') {
    return (
      <div className="grid gap-2" aria-busy="true">
        <p className="text-sm text-muted-foreground">{t('scanningHint')}</p>
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-xl border bg-background/40"
          />
        ))}
      </div>
    );
  }

  if (scan.status === 'failed') {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-red-400/30 bg-red-500/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="min-w-0">
          <span className="block font-semibold">{t('failed')}</span>
          <span className="mt-0.5 block break-words text-muted-foreground">
            {scan.message}
          </span>
        </span>
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={runScan}
        >
          <RefreshCwIcon className="size-3.5" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (scan.rows.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
        <span className="leading-relaxed">
          {scan.region ? t('emptyRegion', { region: scan.region }) : t('empty')}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">
        {t('found', { count: scan.rows.length })}
      </p>
      <ul className="grid gap-2">
        {scan.rows.map((row) => (
          <OrphanVmItem
            key={row.key}
            row={row}
            deletion={deletions[row.key]}
            onDelete={() => askDelete(row)}
          />
        ))}
      </ul>
    </div>
  );
}

function OrphanVmItem(props: {
  row: OrphanVmRow;
  deletion?: OrphanDeletion;
  onDelete: () => void;
}) {
  const { deletion, onDelete, row } = props;
  const t = useDevetekTranslations('page.cloudProjects.orphans');
  const locale = useDevetekLocale();

  const createdAt = row.createdAt ? new Date(row.createdAt) : null;
  const facts = [
    row.location,
    row.instanceType,
    row.state,
    row.publicIp && t('publicIp', { ip: row.publicIp }),
    row.privateIp && t('privateIp', { ip: row.privateIp }),
    createdAt &&
      !Number.isNaN(createdAt.getTime()) &&
      t('created', { time: createdAt.toLocaleString(locale) }),
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold" title={row.label}>
          {row.label}
        </p>
        {row.name && (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.instanceId}
          </p>
        )}
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {facts.join(' · ')}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t(`evidence.${evidenceKey(row.evidence)}`)}
          {row.serverId && <> {t('formerServer', { id: row.serverId })}</>}
        </p>
        {deletion?.phase === 'failed' && deletion.message && (
          <p className="mt-1 break-words text-xs text-red-600 dark:text-red-300">
            {deletion.message}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {!deletion || deletion.phase === 'failed' ? (
          <div className="flex items-center gap-2">
            {deletion?.phase === 'failed' && (
              <StatusPill
                tone="danger"
                icon={XCircleIcon}
                label={t('phase.failed')}
              />
            )}
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              className="text-red-600 hover:bg-red-500/10 dark:text-red-300"
              onClick={onDelete}
            >
              <Trash2Icon className="size-3.5" />
              {deletion ? t('deleteAgain') : t('delete')}
            </Button>
          </div>
        ) : deletion.phase === 'running' ? (
          <StatusPill tone="info" pulse label={t('phase.running')} />
        ) : (
          <StatusPill
            tone="success"
            icon={CheckCircle2Icon}
            label={t('phase.succeeded')}
          />
        )}
      </div>
    </li>
  );
}

const EVIDENCE_KEYS = [
  'tagged',
  'legacy_security_group',
  'legacy_network_tag',
  'legacy_name',
] as const;

function evidenceKey(evidence: string) {
  return (EVIDENCE_KEYS as readonly string[]).includes(evidence)
    ? (evidence as (typeof EVIDENCE_KEYS)[number])
    : 'other';
}

/** Deleting a VM cannot be undone, so its name is typed back first. */
function ConfirmDeleteBody(
  props: OrphanVmsDialogProps & {
    row: OrphanVmRow;
    target: CloudProjectOrphansPayload;
  },
) {
  const { cancelDelete, confirmDelete, isQueuing, row, target } = props;
  const t = useDevetekTranslations('page.cloudProjects.orphans.confirm');
  const [typed, setTyped] = useState('');
  const matches = typed.trim() === row.confirmText;

  return (
    <>
      <DialogHeader className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300">
            <CloudOffIcon className="size-5" />
          </span>
          <div className="min-w-0 text-left">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription className="mt-1">
              {t.rich('description', {
                name: row.label,
                account: target.name,
                strong: (chunks) => (
                  <strong className="text-primary">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid min-h-0 gap-4 overflow-y-auto p-5">
        <ConsequenceList
          tone="danger"
          title={t('happens')}
          items={[t('vmDeleted'), t('disksGone'), t('noServer')]}
        />

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">
            {t.rich('label', {
              name: row.confirmText,
              code: (chunks) => (
                <code className="rounded bg-border/50 px-1 py-0.5 font-mono text-xs">
                  {chunks}
                </code>
              ),
            })}
          </span>
          <Input
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={typed}
            disabled={isQueuing}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches && !isQueuing) {
                confirmDelete(typed);
              }
            }}
            className={cn(matches && 'border-red-400/60')}
          />
        </label>
      </div>

      <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          disabled={isQueuing}
          onClick={cancelDelete}
        >
          {t('cancel')}
        </Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          disabled={!matches || isQueuing}
          onClick={() => confirmDelete(typed)}
        >
          {isQueuing ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <Trash2Icon />
          )}
          {t('submit')}
        </Button>
      </DialogFooter>
    </>
  );
}
