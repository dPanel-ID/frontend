import { z } from 'zod';

import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

/** Same limit as the API (pkg/dgitbackup.MaxBranchLength). */
export const GIT_BACKUP_BRANCH_MAX = 200;

/** Why a branch name is refused; each is a key under `gitBackup.branchErrors`. */
export type GitBackupBranchError =
  | 'required'
  | 'tooLong'
  | 'characters'
  | 'reserved'
  | 'slashes'
  | 'dots'
  | 'ending';

/**
 * The branch names the API accepts: git's `check-ref-format --branch` rules
 * within letters, digits, '.', '_', '-' and '/'. The API checks again.
 */
export function gitBackupBranchError(
  value: string,
): GitBackupBranchError | null {
  const name = value.trim();
  if (name === '') return 'required';
  if (name.length > GIT_BACKUP_BRANCH_MAX) return 'tooLong';
  if (!/^[A-Za-z0-9._/-]+$/.test(name)) return 'characters';
  if (name === 'HEAD' || name.startsWith('-')) return 'reserved';
  if (name.startsWith('/') || name.endsWith('/') || name.includes('//'))
    return 'slashes';
  if (name.includes('..')) return 'dots';
  if (name.endsWith('.') || name.endsWith('.lock')) return 'ending';
  if (
    name
      .split('/')
      .some((part) => part.startsWith('.') || part.endsWith('.lock'))
  )
    return 'ending';
  return null;
}

export const schemaGitBackupForm = z
  .object({
    branch: z.string(),
    confirmDeployBranch: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const error = gitBackupBranchError(value.branch);
    if (error) {
      ctx.addIssue({ code: 'custom', path: ['branch'], message: error });
    }
  });

export type GitBackupForm = z.infer<typeof schemaGitBackupForm>;

/** Branch names are case sensitive in git. */
export function isGitBackupDeployBranch(
  deployBranches: readonly string[],
  branch: string,
): boolean {
  return deployBranches.includes(branch.trim());
}

/**
 * A backup is offered while the release is installed and settled; the API
 * refuses one during an install or removal.
 */
export function canBackUpToGit(status: CicdDeployment['state']['status']) {
  return status === 'ready' || status === 'failed';
}

export const GIT_BACKUP_FINISHED = ['pushed', 'unchanged', 'failed'] as const;

export function isGitBackupFinished(status: string | undefined): boolean {
  return (GIT_BACKUP_FINISHED as readonly string[]).includes(status ?? '');
}
