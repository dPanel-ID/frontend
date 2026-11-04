import type { FlowAccent } from '@/shared/presentation/organisms/FlowHero';

/** Where the Workers card is shown and what the viewer may do there. */
export interface WorkersCardProps {
  /** A team's group ID, or "personal" for the signed-in person's workspace. */
  workspaceId: string;
  /** Owners and admins of a team, and a person on their own profile. */
  canManage: boolean;
  /** The page's accent: sky on the profile, violet on a team. */
  accent?: FlowAccent;
}

export type WorkersMode = 'shared' | 'private';

/** "unknown" keeps a type the API adds later readable instead of crashing. */
export type WorkerKind = 'vm' | 'github' | 'unknown';

/** A worker as the card shows it. */
export interface WorkerRow {
  id: string;
  name: string;
  kind: WorkerKind;
  /** Executor ID of a VM worker, or "owner/repo · workflow@ref". */
  target: string | null;
  tokenHint: string | null;
  createdAt: string | null;
  lastSeenAt: string | null;
}

/** The workspace's worker configuration, ready for the card. */
export interface WorkersView {
  mode: WorkersMode;
  scopeType: 'group' | 'personal';
  workspaceHeader: string;
  managerUrl: string;
  workers: WorkerRow[];
}

/** What a create or rotate returns that must be shown once. */
export interface WorkerSecretResult {
  worker: WorkerRow;
  /** VM only: the token, shown once. */
  token: string | null;
  /** VM only: KEY=value lines for the worker's environment. */
  envBlock: string | null;
  /** GitHub only: the workflow file to commit. */
  workflowYaml: string | null;
}
