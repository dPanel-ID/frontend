import { z } from 'zod';

import { parseRepository } from '../lib/workers';

/**
 * Add-worker form rules. Messages are keys under `widget.workers.errors`, so
 * the view translates them.
 */

export const DEFAULT_WORKFLOW_FILE = 'dpanel-worker.yml';
export const DEFAULT_WORKFLOW_REF = 'main';

/** 2 to 63 lowercase letters, digits or hyphens, not starting with one. */
export const EXECUTOR_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;

/** A file name in .github/workflows, ending in .yml or .yaml. */
export const WORKFLOW_FILE_PATTERN = /^[A-Za-z0-9._-]+\.ya?ml$/;

/** A branch or tag name: no spaces, no "..", no leading "-" or "/". */
export const WORKFLOW_REF_PATTERN = /^(?![-/])(?!.*\.\.)[A-Za-z0-9._/-]+$/;

const schemaName = z
  .string()
  .trim()
  .min(1, 'nameRequired')
  .max(100, 'nameTooLong');

export const schemaVmWorkerForm = z.object({
  type: z.literal('vm'),
  name: schemaName,
  executorId: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'executorIdRequired')
    .regex(EXECUTOR_ID_PATTERN, 'executorIdInvalid'),
});

export const schemaGithubWorkerForm = z.object({
  type: z.literal('github'),
  name: schemaName,
  repository: z
    .string()
    .trim()
    .min(1, 'repositoryRequired')
    .transform((value, ctx) => {
      const parsed = parseRepository(value);
      if (!parsed) {
        ctx.addIssue({ code: 'custom', message: 'repositoryInvalid' });
        return z.NEVER;
      }
      return parsed;
    }),
  workflow: z
    .string()
    .trim()
    .min(1, 'workflowRequired')
    .regex(WORKFLOW_FILE_PATTERN, 'workflowInvalid'),
  ref: z
    .string()
    .trim()
    .min(1, 'refRequired')
    .max(200, 'refInvalid')
    .regex(WORKFLOW_REF_PATTERN, 'refInvalid'),
});

export const schemaWorkerForm = z.discriminatedUnion('type', [
  schemaVmWorkerForm,
  schemaGithubWorkerForm,
]);

export type VmWorkerFormInput = z.input<typeof schemaVmWorkerForm>;
export type GithubWorkerFormInput = z.input<typeof schemaGithubWorkerForm>;
export type WorkerFormInput = z.input<typeof schemaWorkerForm>;
export type WorkerFormValues = z.output<typeof schemaWorkerForm>;

/** Field name to error key, for the fields that failed. */
export type WorkerFormErrors = Partial<Record<string, string>>;

/** Validates the form; returns clean values or one error key per field. */
export function validateWorkerForm(
  input: WorkerFormInput,
):
  | { ok: true; values: WorkerFormValues }
  | { ok: false; errors: WorkerFormErrors } {
  const result = schemaWorkerForm.safeParse(input);
  if (result.success) return { ok: true, values: result.data };

  const errors: WorkerFormErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
