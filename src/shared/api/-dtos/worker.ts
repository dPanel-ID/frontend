import { z } from 'zod';

/**
 * Private workers of a workspace (`/v1/workers`). Strings are read loosely so
 * a value the API adds later cannot crash a card; the feature narrows them.
 */

/** "vm" (token-authenticated host) or "github" (Actions workflow, OIDC). */
export const schemaWorkerTypeV1 = z.enum(['vm', 'github']);

/** "shared" runs jobs on dPanel's workers; "private" only on the list. */
export const schemaWorkersModeV1 = z.enum(['shared', 'private']);

/** One private worker. Secrets never appear here, only a token hint. */
export const schemaWorkerV1 = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  executor_id: z.string().optional(),
  /** Last characters of a VM worker's token, e.g. "…a1b2". */
  token_hint: z.string().optional(),
  repository: z.string().optional(),
  workflow: z.string().optional(),
  ref: z.string().optional(),
  created_at: z.string().optional(),
  created_by: z.string().optional(),
  last_seen_at: z.string().nullish(),
});

/** The workspace a worker configuration belongs to. */
export const schemaWorkersScopeV1 = z.object({
  type: z.string().optional(),
  id: z.string().optional(),
});

/** A workspace's worker configuration (GET and PUT mode). */
export const schemaWorkersConfigV1 = z.object({
  scope: schemaWorkersScopeV1.optional(),
  mode: z.string().optional(),
  /** Value for DPANEL_EXECUTOR_WORKSPACE_ID, e.g. "group:5209…". */
  workspace_header: z.string().optional(),
  manager_url: z.string().optional(),
  workers: z.array(schemaWorkerV1).nullish(),
});

/**
 * A newly added worker, or a VM worker with a new token. `token` and `env`
 * come once, for VM workers; `workflow_yaml` for GitHub workers.
 */
export const schemaWorkerSecretV1 = z.object({
  worker: schemaWorkerV1,
  token: z.string().optional(),
  env: z.record(z.string(), z.string()).nullish(),
  workflow_yaml: z.string().optional(),
});

export type WorkerTypeV1 = z.infer<typeof schemaWorkerTypeV1>;
export type WorkersModeV1 = z.infer<typeof schemaWorkersModeV1>;
export type WorkerV1 = z.infer<typeof schemaWorkerV1>;
export type WorkersScopeV1 = z.infer<typeof schemaWorkersScopeV1>;
export type WorkersConfigV1 = z.infer<typeof schemaWorkersConfigV1>;
export type WorkerSecretV1 = z.infer<typeof schemaWorkerSecretV1>;
