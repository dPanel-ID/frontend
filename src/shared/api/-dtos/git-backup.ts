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

// IDs arrive as JSON strings (the API's response filter turns IDs into
// strings); older answers may still carry numbers.
export interface GitBackupV1 {
  id: string | number;
  application_id: string | number;
  deployment_id: string | number;
  machine_id: string | number;
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
