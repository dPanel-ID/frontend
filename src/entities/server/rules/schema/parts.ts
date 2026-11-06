import z from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

export type Agent = z.output<typeof agent>;
export const agent = z.object({
  version: z.string().catch(''),
  domain: z.string().optional(),
  httpPort: z.number().catch(0),
  /** When the agent last reported to dPanel (ISO time). */
  lastSeenAt: z.string().optional(),
  /** True when a newer agent release than the one running exists. */
  upgradeAvailable: z.boolean().catch(false),
  /** The release dPanel installs today. */
  newVersion: z.string().optional(),
});

export type CloudProvider = z.output<typeof cloudProvider>;
export const cloudProvider = z
  .enum([
    'alibabacloud',
    'aws',
    'biznetgio',
    'digitalocean',
    'googlecloud',
    'idcloudhost',
    'tencent',
    'do',
    'other',
  ])
  .catch('other')
  .default('other');

export type Cloud = z.output<typeof cloud>;
export const cloud = z.object({
  provider: cloudProvider,
  region: z.string().optional(),
});

export type Ssh = z.output<typeof ssh>;
export const ssh = z.object({
  port: z.number().catch(0),
  defaultUser: z.string().catch(''),
});

export type State = z.output<typeof state>;
export const state = SchemaCommon.createState(
  [
    'pending',
    'ready',
    'progress',
    'failed',
    'deleted',
    'cancelled',
    'deleting',
    'unknown',
  ],
  'unknown',
).extend({
  errorDetail: SchemaCommon.executionErrorDetail.nullable().optional(),
});

export type System = z.output<typeof system>;
export const system = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
});

export type Specs = z.output<typeof specs>;
export const specs = z.object({
  cpu: z.object({
    coreCount: z.number(),
    virtualCoreCount: z.number(),
  }),
});

/**
 * The person who created the server, so a resource that breaks policy can be
 * traced back to someone. Absent when the API cannot resolve them.
 */
export type Creator = z.output<typeof creator>;
export const creator = z.object({
  name: z.string(),
  /** Links to /u/{username}; the creator's email is never shown. */
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
});
