import { useEffect, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiCloud } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { orphanDeletePhase, toOrphanVmRows } from '../-lib/orphan-vms';
import type { OrphanDeletePhase, OrphanVmRow } from '../-lib/orphan-vms';
import type { CloudProjectOrphansPayload as Payload } from '../-rules/usecase-types';

/** How often a running deletion is checked. */
const EXECUTION_POLL_MS = 4000;

export type OrphanScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'done'; rows: OrphanVmRow[]; region: string }
  | { status: 'failed'; message: string };

export interface OrphanDeletion {
  executionId: string;
  phase: OrphanDeletePhase;
  /** The execution's error, when it failed. */
  message?: string;
}

/**
 * Finds VMs dPanel created at the account's provider that no longer belong
 * to a server, and deletes one at a time after a typed confirmation,
 * following each deletion until it finishes. The view renders the dialog
 * from the returned state.
 */
export default function useOrphanVmsUsecase() {
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [target, setTarget] = useState<Payload | null>(null);
  const [region, setRegion] = useState('');
  const [scan, setScan] = useState<OrphanScanState>({ status: 'idle' });
  const [deleteTarget, setDeleteTarget] = useState<OrphanVmRow | null>(null);
  const [isQueuing, setIsQueuing] = useState(false);
  const [deletions, setDeletions] = useState<Record<string, OrphanDeletion>>(
    {},
  );
  const scanAbort = useRef<AbortController | null>(null);

  const open = useHandler((payload: Payload) => {
    scanAbort.current?.abort();
    setTarget(payload);
    setRegion('');
    setScan({ status: 'idle' });
    setDeleteTarget(null);
    setDeletions({});
  });

  const close = useHandler(() => {
    if (isQueuing) return;
    scanAbort.current?.abort();
    setTarget(null);
    setDeleteTarget(null);
  });

  const runScan = useHandler(async () => {
    if (!target) return;
    scanAbort.current?.abort();
    const controller = new AbortController();
    scanAbort.current = controller;
    const scannedRegion = region.trim();

    setScan({ status: 'scanning' });
    const response = await ApiCloud.Project.Orphans.$Id.doGet(
      { cloudProjectId: target.id, region: scannedRegion },
      { signal: controller.signal },
    );
    if (controller.signal.aborted) return;

    if (response.$status !== 'success') {
      setScan({
        status: 'failed',
        message: getApiErrorDetail(response.error),
      });
      return;
    }
    setScan({
      status: 'done',
      rows: toOrphanVmRows(
        response.provider || target.provider,
        response.items,
      ),
      region: scannedRegion,
    });
  });

  const askDelete = useHandler((row: OrphanVmRow) => setDeleteTarget(row));

  const cancelDelete = useHandler(() => {
    if (!isQueuing) setDeleteTarget(null);
  });

  const confirmDelete = useHandler(async (typed: string) => {
    if (!target || !deleteTarget || isQueuing) return;
    const row = deleteTarget;

    setIsQueuing(true);
    try {
      const response = await ApiCloud.Project.Orphans.$Id.Delete.doPost({
        cloudProjectId: target.id,
        instanceId: row.instanceId,
        name: row.name,
        region: row.deleteRegion,
        confirm: typed.trim(),
      });

      if (response.$status !== 'success' || !response.execution_id) {
        openToaster({
          variant: 'error',
          title: t('page.cloudProjects.orphans.toaster.queueFailed', {
            name: row.label,
          }),
          message:
            response.$status === 'success'
              ? undefined
              : getApiErrorDetail(response.error),
        });
        return;
      }

      const executionId = response.execution_id;
      setDeletions((current) => ({
        ...current,
        [row.key]: { executionId, phase: 'running' },
      }));
      setDeleteTarget(null);
    } finally {
      setIsQueuing(false);
    }
  });

  // Follow every running deletion until it succeeds or fails.
  const cloudId = target?.id;
  const runningKey = Object.entries(deletions)
    .filter(([, deletion]) => deletion.phase === 'running')
    .map(([key, deletion]) => `${key}=${deletion.executionId}`)
    .sort()
    .join('|');

  useEffect(() => {
    if (!cloudId || !runningKey) return undefined;

    const controller = new AbortController();
    let timer: number | undefined;
    const running = runningKey.split('|').map((entry) => {
      const index = entry.lastIndexOf('=');
      return {
        key: entry.slice(0, index),
        executionId: entry.slice(index + 1),
      };
    });

    const poll = async () => {
      const results = await Promise.all(
        running.map(async ({ executionId, key }) => {
          const response =
            await ApiCloud.Project.Orphans.$Id.Executions.$ExecutionId.doGet(
              { cloudProjectId: cloudId, executionId },
              { signal: controller.signal },
            );
          return { key, executionId, response };
        }),
      );
      if (controller.signal.aborted) return;

      const finished = results.flatMap(({ executionId, key, response }) => {
        if (response.$status !== 'success') return [];
        const phase = orphanDeletePhase(response.status);
        if (phase === 'running') return [];
        return [
          {
            key,
            deletion: {
              executionId,
              phase,
              message:
                response.first_error_message ||
                response.error ||
                response.last_event_message ||
                undefined,
            },
          },
        ];
      });

      if (finished.length > 0) {
        setDeletions((current) => {
          const next = { ...current };
          for (const { deletion, key } of finished) next[key] = deletion;
          return next;
        });
      }
      if (finished.length < running.length) {
        timer = window.setTimeout(poll, EXECUTION_POLL_MS);
      }
    };

    timer = window.setTimeout(poll, EXECUTION_POLL_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [cloudId, runningKey]);

  return [
    open,
    {
      target,
      region,
      setRegion,
      scan,
      runScan,
      deletions,
      deleteTarget,
      isQueuing,
      askDelete,
      cancelDelete,
      confirmDelete,
      close,
    },
  ] as const;
}
