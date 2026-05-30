import { z } from 'zod';

const bootstrapPasswordSchema = z
  .string()
  .min(1, 'Bootstrap password is required for cloud VM creation.')
  .refine(
    (value) => value.length >= 8,
    'Use at least 8 characters for the bootstrap password.',
  )
  .refine(
    (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(value),
    'Include uppercase, lowercase, and a number.',
  );

export const formSchema = z.object({
  provider: z //
    .string()
    .min(1, 'Please select a provider!'),
  cloud: z.object({
    projectID: z //
      .number({ message: 'Please select a cloud project!' }),
    billingAccountID: z //
      .number()
      .optional(),
    sshKeyID: z //
      .number({ message: 'Please select a SSH key!' }),
  }),
  regionSlug: z //
    .string()
    .min(1, 'Please select a region!'),
  vpcBulk: z.object(
    {
      subnet: z //
        .string()
        .min(1),
      id: z //
        .string()
        .min(1),
    },
    {
      message: 'Please select a VPC!',
    },
  ),
  spec: z.object({
    vmName: z //
      .string()
      .min(1, 'VM name is required!')
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9_.-]{1,62}$/,
        'Use 2-63 letters, numbers, dashes, underscores, or dots.',
      ),
    osTemplate: z //
      .string({ message: 'Please select an OS template!' })
      .min(1, 'Please select an OS template!'),
    osName: z //
      .string()
      .min(1, 'Selected OS template is missing os_name.'),
    osVersion: z //
      .string()
      .min(1, 'Selected OS template is missing os_version.'),
    cpuCore: z //
      .number({ message: 'Please select a CPU core!' })
      .min(2)
      .max(8),
    ramSizeGB: z //
      .number({ message: 'Please select a RAM size!' })
      .min(2)
      .max(16),
    diskSizeGB: z //
      .number({ message: 'Please select a disk size!' })
      .min(20)
      .max(160),
  }),
  login: z.object({
    username: z //
      .string()
      .min(1, 'Username is required')
      .regex(
        /^[a-z_][a-z0-9_-]{0,31}$/,
        'Use a valid Linux username: lowercase letters, numbers, underscore, or hyphen.',
      ),
    password: bootstrapPasswordSchema,
  }),
});

export type FormSchema = z.infer<typeof formSchema>;
