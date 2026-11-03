import dayjs from 'dayjs';
import z from 'zod';

// =============================================================================
//   Unit
// =============================================================================

export type UnitId = z.output<typeof unitId>;
export const unitId = z.string();

// =============================================================================
//   Common
// =============================================================================

export type Ownership = z.output<typeof ownership>;
export const ownership = z.object({
  team: z.string().optional(),
  /** Casdoor workspace group ID; absent for personal resources. */
  teamId: z.string().optional(),
  owner: z.string(),
  /** Links the owner to /u/{username} when the API resolved them. */
  ownerUsername: z.string().optional(),
  ownerAvatarUrl: z.string().optional(),
});

export type Timestamp = z.output<typeof timestamp>;
export const timestamp = z
  .object({
    created: z.string(),
    updated: z.string(),
  })
  .transform((orig) => {
    const created = dayjs(orig.created).toDate();
    const updated = dayjs(orig.updated).toDate();

    return {
      created,
      updated,
    };
  });

export function createState<
  const T extends readonly [string, ...string[]],
  K extends T[number],
>(status: T, defaultValue: K) {
  return z.object({
    status: z.enum(status).default(defaultValue),
    message: z.string().optional(),
  });
}

/**
 * The structured reason an execution failed, as the API stores it on a
 * server, load balancer or other resource (`error_detail`).
 */
export type ExecutionErrorDetail = z.output<typeof executionErrorDetail>;
export const executionErrorDetail = z
  .object({
    action: z.string().optional(),
    command: z.string().optional(),
    detail: z.string().optional(),
    event_type: z.string().optional(),
    execution_id: z.string().optional(),
    exit_code: z.number().nullable().optional(),
    host: z.string().optional(),
    machine_id: z.string().optional(),
    message: z.string().optional(),
    module: z.string().optional(),
    module_id: z.string().optional(),
    organization_id: z.string().optional(),
    play: z.string().optional(),
    playbook: z.string().optional(),
    role: z.string().optional(),
    stderr: z.string().optional(),
    stdout: z.string().optional(),
    summary: z.string().optional(),
    task: z.string().optional(),
    task_path: z.string().optional(),
    traceparent: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough();
