import { z } from 'zod';

import { schemaPublicUser } from './execution';

/**
 * The queue workflow that holds an execution. Absent on the task when no
 * workflow holds it, for example after a restart lost it.
 */
export const schemaAdminTaskGatewayV2 = z.object({
  task_id: z.string().optional(),
  /** "queued" or "claimed"; read as a string so a new state cannot crash. */
  state: z.string().optional(),
  worker_id: z.string().optional(),
  queued_at: z.string().optional(),
  claimed_at: z.string().optional(),
  last_heartbeat_at: z.string().optional(),
});

/** An execution of any workspace that has not finished yet. */
export const schemaAdminTaskV2 = z.object({
  execution_id: z.string().optional(),
  type: z.string().optional(),
  /** "pending", "queued" or "running"; any other string is kept as-is. */
  status: z.string().optional(),
  workspace_id: z.string().optional(),
  machine_id: z.string().optional(),
  machine_hostname: z.string().optional(),
  module: z.string().optional(),
  module_id: z.string().optional(),
  created_at: z.string().optional(),
  started_at: z.string().optional(),
  handoff_at: z.string().optional(),
  last_event_at: z.string().optional(),
  last_event_message: z.string().optional(),
  idle_seconds: z.number().optional(),
  gateway: schemaAdminTaskGatewayV2.nullish(),
  can_reclaim: z.boolean().optional(),
  /** True when the task names a server that no longer exists. */
  server_deleted: z.boolean().optional(),
  /** Whether the task is safe to delete, and why. */
  cleanup: z
    .object({
      /** "safe_to_delete", "stale" or "active". */
      verdict: z.string().optional(),
      reasons: z.array(z.string()).nullish(),
    })
    .nullish(),
  /** Who started the task; never an email. */
  created_by: schemaPublicUser.nullish(),
});

/** What the API did when an administrator reclaimed a task. */
export const schemaAdminTaskReclaimV2 = z.object({
  execution_id: z.string().optional(),
  /** "requeued" or "restarted". */
  action: z.string().optional(),
  previous_worker_id: z.string().optional(),
});

/** What the API did when an administrator deleted (failed) a task. */
export const schemaAdminTaskDeleteV2 = z.object({
  execution_id: z.string().optional(),
  status: z.string().optional(),
  worker_stopped: z.boolean().optional(),
});

export type AdminTaskGatewayV2 = z.infer<typeof schemaAdminTaskGatewayV2>;
export type AdminTaskV2 = z.infer<typeof schemaAdminTaskV2>;
export type AdminTaskReclaimV2 = z.infer<typeof schemaAdminTaskReclaimV2>;
export type AdminTaskDeleteV2 = z.infer<typeof schemaAdminTaskDeleteV2>;

/** Where a resource lives: a team's workspace, or its owner's own. */
export const schemaAdminResourceWorkspaceV2 = z.object({
  /** "team" or "personal". */
  type: z.string().optional(),
  id: z.string().optional(),
  /** The team's name; absent for a personal workspace. */
  name: z.string().optional(),
});

/** A server, application, load balancer, domain or SSH key of anyone. */
export const schemaAdminResourceV2 = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  detail: z.string().optional(),
  kind: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  workspace: schemaAdminResourceWorkspaceV2.nullish(),
  /** Who owns it; never an email. */
  owner: schemaPublicUser.nullish(),
});

/** One page of one resource type, with how many of each type exist. */
export const schemaAdminResourceListV2 = z.object({
  type: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
  counts: z.record(z.string(), z.number()).optional(),
  items: z.array(schemaAdminResourceV2).nullish(),
});

export type AdminResourceWorkspaceV2 = z.infer<
  typeof schemaAdminResourceWorkspaceV2
>;
export type AdminResourceV2 = z.infer<typeof schemaAdminResourceV2>;
export type AdminResourceListV2 = z.infer<typeof schemaAdminResourceListV2>;
