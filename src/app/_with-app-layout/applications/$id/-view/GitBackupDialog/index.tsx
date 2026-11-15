import { useState } from 'react';

import {
  ExternalLinkIcon,
  GitBranchPlusIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { Input } from '@/shared/presentation/atoms/Input';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

import {
  GIT_BACKUP_BRANCH_MAX,
  gitBackupBranchError,
  isGitBackupDeployBranch,
} from '../../-rules/git-backup';
import type { GitBackupDialogState } from '../../-usecase/git-backup';

// Partial: a status a newer API adds falls back to neutral.
const STATUS_TONE: Partial<Record<string, StatusTone>> = {
  queued: 'neutral',
  running: 'info',
  pushed: 'success',
  unchanged: 'success',
  failed: 'danger',
};

/**
 * Backup To Git for one server: pick a branch, then follow the job. dNocs
 * commits the application's files on that server and pushes them without
 * force; secrets and generated folders stay on the server.
 */
export function GitBackupDialog(props: { state: GitBackupDialogState }) {
  const { state } = props;
  const busy = state.phase === 'submitting';

  return (
    <Dialog
      open={state.target != null}
      onOpenChange={(open) => {
        if (!open && !busy) state.close();
      }}
    >
      {state.target && (
        <GitBackupDialogBody
          key={state.target.deploymentId}
          state={state}
          serverName={state.target.serverName}
        />
      )}
    </Dialog>
  );
}

function GitBackupDialogBody(props: {
  state: GitBackupDialogState;
  serverName: string;
}) {
  const { serverName, state } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases.gitBackup');
  const tc = useDevetekTranslations('common.actions');

  return (
    <DialogContent className="max-w-lg gap-0 p-0">
      <DialogHeader className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
            <GitBranchPlusIcon className="size-5" />
          </span>
          <div className="min-w-0 text-left">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription className="mt-1">
              {t.rich('description', {
                server: serverName,
                strong: (chunks) => (
                  <strong className="text-primary">{chunks}</strong>
                ),
              })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {state.phase === 'loading' && (
        <div
          className="flex items-center gap-2 p-5 text-sm text-muted-foreground"
          role="status"
        >
          <LoaderCircleIcon className="size-4 animate-spin" />
          {t('loading')}
        </div>
      )}

      {state.phase === 'loadFailed' && (
        <>
          <p className="p-5 text-sm text-destructive" role="alert">
            {state.loadError || t('loadFailed')}
          </p>
          <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={state.close}
            >
              {tc('cancel')}
            </Button>
            <Button onClick={state.retry}>
              <RotateCcwIcon />
              {t('retry')}
            </Button>
          </DialogFooter>
        </>
      )}

      {(state.phase === 'form' || state.phase === 'submitting') &&
        state.options && (
          <GitBackupForm state={state} options={state.options} />
        )}

      {(state.phase === 'watching' || state.phase === 'finished') &&
        state.backup && (
          <GitBackupProgress backup={state.backup} onClose={state.close} />
        )}
    </DialogContent>
  );
}

function GitBackupForm(props: {
  state: GitBackupDialogState;
  options: DTOs.GitBackupOptionsV1;
}) {
  const { options, state } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases.gitBackup');
  const tc = useDevetekTranslations('common.actions');
  const [branch, setBranch] = useState(options.suggested_branch);
  const [confirmDeploy, setConfirmDeploy] = useState(false);
  const busy = state.phase === 'submitting';

  const deployBranches = options.deploy_branches ?? [];
  const error = gitBackupBranchError(branch);
  const deployBranch = isGitBackupDeployBranch(deployBranches, branch);
  const canSubmit =
    !busy && !options.running && !error && (!deployBranch || confirmDeploy);
  const submit = () => {
    if (canSubmit) state.confirm(branch, deployBranch && confirmDeploy);
  };

  return (
    <>
      <div className="grid gap-4 p-5">
        <ul className="grid gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/5 p-3 text-sm">
          <li>{t('whatIncluded')}</li>
          <li>{t('whatExcluded')}</li>
          <li>{t('whatSafe')}</li>
          <li className="text-muted-foreground">{t('whatDuration')}</li>
        </ul>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold">
            {t.rich('branchLabel', {
              repository: options.repository,
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
            maxLength={GIT_BACKUP_BRANCH_MAX}
            value={branch}
            disabled={busy}
            aria-invalid={error != null}
            aria-describedby="git-backup-branch-hint"
            onChange={(event) => {
              setBranch(event.target.value);
              setConfirmDeploy(false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            className={cn(
              'font-mono',
              error && branch !== '' && 'border-red-400/60',
            )}
          />
          <span
            id="git-backup-branch-hint"
            className={cn(
              'text-xs',
              error && branch !== ''
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {error && branch !== ''
              ? t(`branchErrors.${error}`)
              : t('branchHint')}
          </span>
        </label>

        {deployBranch && (
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/5 p-3 text-sm">
            <Checkbox
              className="mt-0.5"
              checked={confirmDeploy}
              disabled={busy}
              onCheckedChange={(checked) => setConfirmDeploy(checked === true)}
            />
            <span>{t('deployBranchConfirm', { branch: branch.trim() })}</span>
          </label>
        )}

        {options.running && (
          <p
            className="text-sm text-amber-600 dark:text-amber-300"
            role="status"
          >
            {t('alreadyRunning')}
          </p>
        )}

        {state.submitError && (
          <p className="text-sm text-destructive" role="alert">
            {state.submitError}
          </p>
        )}
      </div>

      <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          disabled={busy}
          onClick={state.close}
        >
          {tc('cancel')}
        </Button>
        <Button disabled={!canSubmit} onClick={submit}>
          {busy ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <GitBranchPlusIcon />
          )}
          {t('confirm')}
        </Button>
      </DialogFooter>
    </>
  );
}

function GitBackupProgress(props: {
  backup: DTOs.GitBackupV1;
  onClose: () => void;
}) {
  const { backup, onClose } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases.gitBackup');
  const finished = ['pushed', 'unchanged', 'failed'].includes(backup.status);
  const report = backup.report;
  const excluded = report?.excluded_count ?? 0;
  const large = report?.skipped_large_count ?? 0;

  return (
    <>
      <div className="grid gap-3 p-5 text-sm" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            tone={STATUS_TONE[backup.status] ?? 'neutral'}
            label={t(`status.${backup.status}`)}
            pulse={!finished}
          />
          <code className="rounded bg-border/50 px-1.5 py-0.5 font-mono text-xs">
            {backup.branch}
          </code>
        </div>

        {!finished && <p className="text-muted-foreground">{t('watching')}</p>}

        {backup.status === 'pushed' && (
          <p>{t('pushed', { files: backup.files })}</p>
        )}
        {backup.status === 'unchanged' && <p>{t('unchanged')}</p>}
        {backup.status === 'failed' && (
          <p className="text-destructive" role="alert">
            {backup.error || t('failedTitle')}
          </p>
        )}

        {finished &&
          backup.status !== 'failed' &&
          (excluded > 0 || large > 0) && (
            <div className="rounded-xl border p-3 text-xs text-muted-foreground">
              {excluded > 0 && (
                <p>
                  {t('leftOutProtected', { count: excluded })}{' '}
                  <span className="font-mono">
                    {(report?.excluded ?? []).slice(0, 5).join(', ')}
                  </span>
                </p>
              )}
              {large > 0 && (
                <p>
                  {t('leftOutLarge', { count: large })}{' '}
                  <span className="font-mono">
                    {(report?.skipped_large ?? [])
                      .slice(0, 5)
                      .map((file) => file.path)
                      .join(', ')}
                  </span>
                </p>
              )}
            </div>
          )}

        {(backup.commit_url || backup.branch_url) && (
          <div className="flex flex-wrap gap-3">
            {backup.branch_url && (
              <a
                href={backup.branch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300"
              >
                <ExternalLinkIcon className="size-3.5" />
                {t('openBranch')}
              </a>
            )}
            {backup.commit_url && (
              <a
                href={backup.commit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300"
              >
                <ExternalLinkIcon className="size-3.5" />
                {t('openCommit')}
              </a>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
        <Button onClick={onClose}>
          {finished ? t('done') : t('closeWhileRunning')}
        </Button>
      </DialogFooter>
    </>
  );
}
