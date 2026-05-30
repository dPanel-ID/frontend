import z from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

export type Agent = z.output<typeof agent>;
export const agent = z.object({
  version: z.string().catch(''),
  domain: z.string().optional(),
  httpPort: z.number().catch(0),
});

export type CloudProvider = z.output<typeof cloudProvider>;
export const cloudProvider = z
  .enum(['googlecloud', 'idcloudhost', 'do', 'other'])
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
export const errorDetail = z
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
  errorDetail: errorDetail.nullable().optional(),
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
