import { z } from 'zod';

/**
 * The cluster API contract (`/v1/clusters/**`) in one place.
 *
 * The backend is still settling, so these schemas are lenient: unknown keys
 * are dropped instead of rejected, and Go's `null` for an empty list or
 * string is read as empty. Tighten them once the contract is frozen.
 */

const nullableString = z
  .string()
  .nullish()
  .transform((value) => value ?? '');

function listOf<T extends z.ZodType>(item: T) {
  return z
    .array(item)
    .nullish()
    .transform((value) => value ?? []);
}

export const CLUSTER_ARCHITECTURES = ['amd64', 'arm64', 'armhf'] as const;
export type ClusterArchitecture = (typeof CLUSTER_ARCHITECTURES)[number];

export const CLUSTER_STATUSES = [
  'pending',
  'installing',
  'ready',
  'failed',
  'uninstalling',
  'uninstalled',
] as const;
export type ClusterStatus = (typeof CLUSTER_STATUSES)[number];

/** Known statuses keep their meaning; a new one still parses. */
const schemaClusterStatus = z.string().min(1);

export const schemaClusterRoleDto = z.object({
  name: z.string().min(1),
  title: nullableString,
  description: nullableString,
  min: z.number().int().nonnegative().default(0),
  /** 0 means unlimited. */
  max: z.number().int().nonnegative().default(0),
  /** The count must be odd when it is above one (quorum). */
  odd: z.boolean().default(false),
});

export const schemaClusterEngineOptionDto = z.object({
  name: z.string().min(1),
  title: nullableString,
  description: nullableString,
  type: z.string().default('boolean'),
  default: z.unknown().optional(),
});

export const schemaClusterEngineDto = z.object({
  name: z.string().min(1),
  title: nullableString,
  description: nullableString,
  architectures: listOf(z.string()),
  versions: listOf(z.string()),
  default_version: nullableString,
  recommended_for: nullableString,
  options: listOf(schemaClusterEngineOptionDto),
});

export const schemaClusterKindDto = z.object({
  name: z.string().min(1),
  title: nullableString,
  description: nullableString,
  status: z.string().default('planned'),
  min_servers: z.number().int().nonnegative().default(1),
  roles: listOf(schemaClusterRoleDto),
  engines: listOf(schemaClusterEngineDto),
});

export const schemaClusterKindsResponseDto = z.object({
  kinds: listOf(schemaClusterKindDto),
});

export const schemaClusterExecutionDto = z.object({
  id: z.string().min(1),
  type: nullableString,
  status: nullableString,
});

export const schemaClusterNodeDto = z.object({
  server_id: z.coerce.string().min(1),
  server_name: nullableString,
  address: nullableString,
  role: nullableString,
  status: nullableString,
  arch: nullableString,
  region: nullableString,
  /** "agent" or "ssh": how the server joined dPanel. */
  join_method: nullableString,
  /** The node's last cluster access or revoke job (member-driven clusters). */
  access: z
    .object({
      execution_id: nullableString,
      type: nullableString,
      status: nullableString,
      error: nullableString,
    })
    .nullish()
    .transform((v) => v ?? null),
});

/** One checked path of the connectivity preflight. */
export const schemaClusterPreflightPathDto = z.object({
  from: nullableString,
  from_name: nullableString,
  to: nullableString,
  to_name: nullableString,
  address: nullableString,
  port: z.coerce
    .number()
    .nullish()
    .transform((v) => v ?? 0),
  protocol: nullableString,
  title: nullableString,
  result: nullableString,
  detail: nullableString,
  cause: nullableString,
  ok: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  required: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
});

export const schemaClusterPreflightDto = z.object({
  ok: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  checked_at: nullableString,
  paths: listOf(schemaClusterPreflightPathDto),
});

export const schemaClusterDetailDto = z.object({
  id: z.coerce.string().min(1),
  host_group_id: z.coerce.string().min(1),
  name: nullableString,
  kind: z.string().min(1),
  engine: nullableString,
  version: nullableString,
  status: schemaClusterStatus,
  api_endpoint: nullableString,
  options: z
    .record(z.string(), z.unknown())
    .nullish()
    .transform((value) => value ?? {}),
  last_execution: schemaClusterExecutionDto
    .nullish()
    .transform((v) => v ?? null),
  /** "worker" (a dPanel worker over SSH) or "member" (controller_server_id). */
  transport: nullableString,
  controller_server_id: nullableString,
  failure_reason: nullableString,
  preflight: schemaClusterPreflightDto.nullish().transform((v) => v ?? null),
  nodes: listOf(schemaClusterNodeDto),
  created_at: nullableString,
  updated_at: nullableString,
});

export const schemaClusterListResponseDto = z.object({
  clusters: listOf(schemaClusterDetailDto),
});

export const schemaClusterMutationResponseDto = z.object({
  cluster: schemaClusterDetailDto,
  warnings: listOf(z.string()),
});

/** The `cluster` summary a host group carries when it is a cluster group. */
export const schemaHostGroupClusterSummaryDto = z.object({
  id: z.coerce.string().min(1),
  kind: z.string().min(1),
  engine: nullableString,
  status: schemaClusterStatus,
});

export interface ClusterCreateNodePayload {
  server_id: string;
  role: string;
}

export interface ClusterCreatePayload {
  name: string;
  description: string;
  kind: string;
  engine: string;
  version: string;
  nodes: ClusterCreateNodePayload[];
  options: { builtin_ingress: boolean };
}

export type ClusterRoleDto = z.output<typeof schemaClusterRoleDto>;
export type ClusterEngineOptionDto = z.output<
  typeof schemaClusterEngineOptionDto
>;
export type ClusterEngineDto = z.output<typeof schemaClusterEngineDto>;
export type ClusterKindDto = z.output<typeof schemaClusterKindDto>;
export type ClusterExecutionDto = z.output<typeof schemaClusterExecutionDto>;
export type ClusterNodeDto = z.output<typeof schemaClusterNodeDto>;
export type ClusterDetailDto = z.output<typeof schemaClusterDetailDto>;
export type ClusterPreflightDto = z.output<typeof schemaClusterPreflightDto>;
export type ClusterPreflightPathDto = z.output<
  typeof schemaClusterPreflightPathDto
>;
export type ClusterMutationResponseDto = z.output<
  typeof schemaClusterMutationResponseDto
>;
export type HostGroupClusterSummaryDto = z.output<
  typeof schemaHostGroupClusterSummaryDto
>;
