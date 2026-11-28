import { z } from 'zod';

/** Same rules as the API (docs/applications/definition.md). */
export const LIFECYCLE_LIMITS = {
  commands: 20,
  commandLength: 4096,
  processes: 10,
  instances: 8,
  healthPath: 512,
  healthRetries: 60,
} as const;

const PROCESS_NAME = /^[a-z]([a-z0-9-]{0,30}[a-z0-9])?$/;
const DURATION = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;

/** Seconds in a duration such as 1h30m or 45s; null when it is not one. */
export function durationSeconds(value: string): number | null {
  const match = DURATION.exec(value.trim());
  if (!match || !value.trim()) return null;
  const [, hours = '0', minutes = '0', seconds = '0'] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function durationWithin(min: number, max: number) {
  return (value: string) => {
    if (!value.trim()) return true;
    const seconds = durationSeconds(value);
    return seconds !== null && seconds >= min && seconds <= max;
  };
}

const commands = z
  .array(z.string().max(LIFECYCLE_LIMITS.commandLength, 'commandTooLong'))
  .max(LIFECYCLE_LIMITS.commands, 'tooManyCommands');

const commandTimeout = z
  .string()
  .refine(durationWithin(10, 2 * 3600), 'badCommandTimeout');

export const schemaLifecycleEdit = z
  .object({
    release: z
      .object({
        enabled: z.boolean(),
        commands,
        timeout: commandTimeout,
      })
      .nullable(),
    postDeploy: z
      .object({
        commands,
        timeout: commandTimeout,
      })
      .nullable(),
    processes: z
      .array(
        z.object({
          name: z
            .string()
            .regex(PROCESS_NAME, 'badProcessName')
            .refine((name) => name !== 'web', 'reservedProcessName'),
          type: z.enum(['service', 'schedule']),
          command: z
            .string()
            .trim()
            .min(1, 'processCommandRequired')
            .max(LIFECYCLE_LIMITS.commandLength, 'commandTooLong'),
          instances: z
            .number()
            .int('badInstances')
            .min(1, 'badInstances')
            .max(LIFECYCLE_LIMITS.instances, 'badInstances'),
        }),
      )
      .max(LIFECYCLE_LIMITS.processes, 'tooManyProcesses')
      .refine(
        (processes) =>
          new Set(processes.map((process) => process.name)).size ===
          processes.length,
        'duplicateProcessName',
      ),
    healthCheck: z
      .object({
        path: z
          .string()
          .max(LIFECYCLE_LIMITS.healthPath, 'badHealthPath')
          .refine(
            (path) => !path.trim() || /^\/\S*$/.test(path.trim()),
            'badHealthPath',
          ),
        expectedStatus: z
          .number()
          .int('badStatus')
          .min(100, 'badStatus')
          .max(599, 'badStatus'),
        timeout: z.string().refine(durationWithin(1, 60), 'badHealthTimeout'),
        retries: z
          .number()
          .int('badRetries')
          .min(1, 'badRetries')
          .max(LIFECYCLE_LIMITS.healthRetries, 'badRetries'),
      })
      .nullable(),
    /** The application has a port: a health check needs one. */
    hasPort: z.boolean(),
  })
  .refine((value) => !value.healthCheck?.path.trim() || value.hasPort, {
    message: 'healthNeedsPort',
    path: ['healthCheck', 'path'],
  });

export type SchemaLifecycleEdit = z.infer<typeof schemaLifecycleEdit>;

/** The first problem of each field, as message keys by dotted path. */
export function lifecycleErrors(value: SchemaLifecycleEdit) {
  const result = schemaLifecycleEdit.safeParse(value);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] ??= issue.message;
  }
  return errors;
}
