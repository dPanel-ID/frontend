import { useEffect, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiDeploy } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { isGitBackupFinished } from '../-rules/git-backup';
import type { GitBackupPayload } from '../-rules/usecase-types';

/** How often the dialog asks for the running backup's status. */
const POLL_INTERVAL_MS = 4000;

export type GitBackupPhase =
  /** Reading the suggested branch and the deploy branches. */
  | 'loading'
  /** The options could not be read; the dialog offers a retry. */
  | 'loadFailed'
  /** Choosing the branch. */
  | 'form'
  /** Sending the request. */
  | 'submitting'
  /** The job is queued or running; the dialog follows it. */
  | 'watching'
  /** The backup finished (pushed, unchanged or failed). */
  | 'finished';

export interface GitBackupDialogState {
  target: GitBackupPayload | null;
  phase: GitBackupPhase;
  options: DTOs.GitBackupOptionsV1 | null;
  backup: DTOs.GitBackupV1 | null;
  /** The API's refusal, shown in the form. */
  submitError: string | null;
  loadError: string | null;
  confirm: (branch: string, confirmDeployBranch: boolean) => void;
  retry: () => void;
  close: () => void;
}

/**
 * Backup To Git for one release (an application on one server): reads the
 * options, sends the request and follows the job until it finishes. The
 * view renders the dialog from the returned state.
 */
export default function useGitBackupUsecase() {
  const t = useDevetekTranslations('page.applicationDetail.releases.gitBackup');
  const [openToaster] = useToaster();

  const [target, setTarget] = useState<GitBackupPayload | null>(null);
  const [phase, setPhase] = useState<GitBackupPhase>('loading');
  const [options, setOptions] = useState<DTOs.GitBackupOptionsV1 | null>(null);
  const [backup, setBackup] = useState<DTOs.GitBackupV1 | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useHandler(async (payload: GitBackupPayload) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('loading');
    setLoadError(null);
    const response = await ApiDeploy.BackupToGit.$Id.doGet(
      { deploymentId: String(payload.deploymentId) },
      { signal: controller.signal },
    );
    if (controller.signal.aborted) return;
    if (response.$status === 'success') {
      const { $status: _status, ...data } = response;
      setOptions(data);
      setPhase('form');
      return;
    }
    setLoadError(getApiErrorDetail(response.error));
    setPhase('loadFailed');
  });

  const handleUsecase = useHandler((payload: GitBackupPayload) => {
    setTarget(payload);
    setOptions(null);
    setBackup(null);
    setSubmitError(null);
    void load(payload);
  });

  const close = useHandler(() => {
    if (phase === 'submitting') return;
    abortRef.current?.abort();
    setTarget(null);
  });

  const retry = useHandler(() => {
    if (target) void load(target);
  });

  const confirm = useHandler(
    async (branch: string, confirmDeployBranch: boolean) => {
      if (!target || phase !== 'form') return;
      setPhase('submitting');
      setSubmitError(null);
      const response = await ApiDeploy.BackupToGit.$Id.doPost({
        deploymentId: String(target.deploymentId),
        branch: branch.trim(),
        confirmDeployBranch,
      });
      if (response.$status === 'success') {
        setBackup(response.backup);
        setPhase('watching');
        return;
      }
      setSubmitError(getApiErrorDetail(response.error));
      setPhase('form');
    },
  );

  // Follow the job until it finishes, also after the dialog is closed (a
  // toast then reports the result). Opening another backup stops it.
  const deploymentId = backup?.deployment_id;
  const backupId = backup?.id;
  useEffect(() => {
    if (phase !== 'watching' || deploymentId == null || backupId == null)
      return;
    const controller = new AbortController();
    const timer = window.setInterval(async () => {
      const response = await ApiDeploy.GitBackups.$Id.doGet(
        { deploymentId: String(deploymentId) },
        { signal: controller.signal },
      );
      if (controller.signal.aborted || response.$status !== 'success') return;
      const list = Array.isArray(response) ? response : [];
      const current = list.find((item) => String(item.id) === String(backupId));
      if (!current) return;
      setBackup(current);
      if (isGitBackupFinished(current.status)) setPhase('finished');
    }, POLL_INTERVAL_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [phase, deploymentId, backupId]);

  // Tell the owner how it ended even when the dialog was closed meanwhile.
  const lastToastRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      phase !== 'finished' ||
      !backup ||
      lastToastRef.current === String(backup.id)
    )
      return;
    lastToastRef.current = String(backup.id);
    if (target) return; // the open dialog shows the result
    openToaster(
      backup.status === 'failed'
        ? { variant: 'error', title: t('failedTitle'), message: backup.error }
        : {
            variant: 'success',
            message: t('pushedToast', { branch: backup.branch }),
          },
    );
  }, [phase, backup, target, openToaster, t]);

  const state: GitBackupDialogState = {
    target,
    phase,
    options,
    backup,
    submitError,
    loadError,
    confirm,
    retry,
    close,
  };

  return [handleUsecase, state] as const;
}
