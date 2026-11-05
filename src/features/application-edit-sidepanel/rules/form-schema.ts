import { z } from 'zod';

/** Build time limits offered in the panel, as Go durations (the API allows 1m to 3h). */
export const BUILD_TIMEOUT_PRESETS = [
  '15m',
  '30m',
  '60m',
  '120m',
  '180m',
] as const;

export const schemaAutoDeploy = z.object({
  isEnabled: z.boolean(),
  fromBranch: z
    .string()
    .optional()
    .transform((val) =>
      typeof val === 'string' && val.trim() === '' ? undefined : val,
    ),
});

// Work directory, port and service name are fixed once the application
// exists (servers and load balancers depend on them), so they are not part of
// the form.
export const schemaApplicationEdit = z
  .object({
    autoDeploy: schemaAutoDeploy,
    buildTimeout: z
      .string()
      .regex(/^(\d+(h|m))*$/, 'buildTimeoutInvalid')
      .default(''),
    description: z.string().max(200, 'descriptionTooLong').default(''),
  })
  .superRefine((values, ctx) => {
    if (values.autoDeploy.isEnabled && !values.autoDeploy.fromBranch) {
      ctx.addIssue({
        code: 'custom',
        path: ['autoDeploy', 'fromBranch'],
        message: 'branchRequired',
      });
    }
  });

export type SchemaApplicationEdit = z.input<typeof schemaApplicationEdit>;
