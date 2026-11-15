// Backup To Git (backend docs/applications/backup-to-git.md).

export type GitBackupStatusV1 =
  'queued' | 'running' | 'pushed' | 'unchanged' | 'failed';

export interface GitBackupOptionsV1 {
  /** A new dpanel-backup/<server>-<UTC date> branch. */
  suggested_branch: string;
  /** Branches the application deploys from; they need confirmation. */
  deploy_branches: string[] | null;
  /** owner/name of the application's repository. */
  repository: string;
  running: boolean;
}

export interface GitBackupSkippedFileV1 {
  path: string;
  bytes: number;
}

export interface GitBackupReportV1 {
  status?: GitBackupStatusV1;
  excluded_count?: number;
  excluded?: string[] | null;
  skipped_large?: GitBackupSkippedFileV1[] | null;
  skipped_large_count?: number;
  skipped_nested?: string[] | null;
}

export interface GitBackupV1 {
  id: number;
  application_id: number;
  deployment_id: number;
  machine_id: number;
  execution_id: string;
  branch: string;
  status: GitBackupStatusV1;
  commit?: string;
  deployed_commit?: string;
  files: number;
  bytes: number;
  error_code?: string;
  /** Public failure message; never upstream text. */
  error?: string;
  report?: GitBackupReportV1 | null;
  branch_url?: string;
  commit_url?: string;
  created_at: string;
  finished_at?: string | null;
}

export interface GitBackupStartV1 {
  execution_id: string;
  backup: GitBackupV1;
}
