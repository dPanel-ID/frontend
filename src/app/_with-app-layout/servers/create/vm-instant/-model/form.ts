import { z } from 'zod';

import {
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from './provider';

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

const vmNameSchema = z
  .string()
  .min(1, 'VM name is required!')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_.-]{1,62}$/,
    'Use 2-63 letters, numbers, dashes, underscores, or dots.',
  );

const biznetGioVmNameSchema = z
  .string()
  .min(1, 'VM name is required!')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9.-]{5,15}$/,
    'Use 6-16 letters, numbers, dashes, or dots.',
  );

const linuxUsernameSchema = z
  .string()
  .min(1, 'Username is required')
  .regex(
    /^[a-z_][a-z0-9_-]{0,31}$/,
    'Use a valid Linux username: lowercase letters, numbers, underscore, or hyphen.',
  );

const biznetGioUsernameSchema = z
  .string()
  .min(1, 'Username is required')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9.-]{5,31}$/,
    'Use 6-32 letters, numbers, dashes, or dots.',
  );

export const formSchema = z
  .object({
    provider: z //
      .string()
      .min(1, 'Please select a provider!'),
    cloud: z.object({
      projectID: z //
        .string({ message: 'Please select a cloud project!' })
        .min(1, 'Please select a cloud project!'),
      billingAccountID: z.preprocess((value) => {
        if (value == null || value === '') return undefined;
        if (typeof value === 'string') return Number(value);

        return value;
      }, z.number().optional()),
      sshKeyID: z //
        .string({ message: 'Please select a SSH key!' })
        .min(1, 'Please select a SSH key!'),
      zoneSlug: z.string().optional(),
    }),
    regionSlug: z.string().optional(),
    vpcBulk: z.object({
      subnet: z.string().optional(),
      id: z.string().optional(),
    }),
    spec: z.object({
      vmName: z.string().min(1, 'VM name is required!'),
      osTemplate: z.string().optional(),
      osName: z.string().optional(),
      osVersion: z.string().optional(),
      machineType: z.string().optional(),
      cpuCore: z //
        .number({ message: 'Please select a CPU core!' }),
      ramSizeGB: z //
        .number({ message: 'Please select a RAM size!' }),
      diskSizeGB: z //
        .number({ message: 'Please select a disk size!' }),
      productID: z.number().optional(),
      billingCycle: z.string().optional(),
      keypairName: z.string().optional(),
      description: z.string().optional(),
      promocode: z.string().optional(),
      payInvoiceWithCC: z.enum(['no', 'yes']).optional(),
      reservePublicIP: z.boolean(),
    }),
    login: z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().optional(),
    }),
  })
  .superRefine((values, ctx) => {
    const usesBiznetGio = isBiznetGioProvider(values.provider);
    const usesGcp = isGcpProvider(values.provider);
    const usesDigitalOcean = isDigitalOceanProvider(values.provider);
    const usesAws = isAwsProvider(values.provider);

    const vmNameResult = (
      usesBiznetGio ? biznetGioVmNameSchema : vmNameSchema
    ).safeParse(values.spec.vmName);

    if (!vmNameResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: vmNameResult.error.issues[0]?.message ?? 'Invalid VM name.',
        path: ['spec', 'vmName'],
      });
    }

    if (!usesAws) {
      const usernameResult = (
        usesBiznetGio ? biznetGioUsernameSchema : linuxUsernameSchema
      ).safeParse(values.login.username);

      if (!usernameResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            usernameResult.error.issues[0]?.message ?? 'Invalid username.',
          path: ['login', 'username'],
        });
      }
    }

    if (usesBiznetGio) {
      const passwordResult = bootstrapPasswordSchema.safeParse(
        values.login.password,
      );

      if (!passwordResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            passwordResult.error.issues[0]?.message ??
            'Invalid console password.',
          path: ['login', 'password'],
        });
      }

      if (values.spec.productID == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a Biznet Gio NEO Lite product.',
          path: ['spec', 'productID'],
        });
      }

      if (!values.spec.billingCycle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a billing cycle.',
          path: ['spec', 'billingCycle'],
        });
      }

      if (!values.spec.osTemplate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an OS template.',
          path: ['spec', 'osTemplate'],
        });
      }

      return;
    }

    if (!values.regionSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a region!',
        path: ['regionSlug'],
      });
    }

    if (usesGcp) {
      if (!values.cloud.zoneSlug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a zone!',
          path: ['cloud', 'zoneSlug'],
        });
      }

      if (!values.spec.machineType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a machine type!',
          path: ['spec', 'machineType'],
        });
      }

      if (!values.spec.osTemplate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an OS template!',
          path: ['spec', 'osTemplate'],
        });
      }

      if (values.spec.diskSizeGB < 20 || values.spec.diskSizeGB > 160) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a disk size!',
          path: ['spec', 'diskSizeGB'],
        });
      }

      return;
    }

    if (usesDigitalOcean) {
      if (!values.spec.machineType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a droplet size!',
          path: ['spec', 'machineType'],
        });
      }

      if (!values.spec.osTemplate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide an image slug!',
          path: ['spec', 'osTemplate'],
        });
      }

      return;
    }

    if (usesAws) {
      if (!values.spec.machineType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an instance type!',
          path: ['spec', 'machineType'],
        });
      }

      if (!values.spec.osTemplate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select an AMI image!',
          path: ['spec', 'osTemplate'],
        });
      }

      if (!values.vpcBulk.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a VPC subnet!',
          path: ['vpcBulk'],
        });
      }

      return;
    }

    if (!values.vpcBulk.id || !values.vpcBulk.subnet) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a VPC!',
        path: ['vpcBulk'],
      });
    }

    const passwordResult = bootstrapPasswordSchema.safeParse(
      values.login.password,
    );

    if (!passwordResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          passwordResult.error.issues[0]?.message ??
          'Invalid bootstrap password.',
        path: ['login', 'password'],
      });
    }

    if (!values.spec.osTemplate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select an OS template!',
        path: ['spec', 'osTemplate'],
      });
    }

    if (!values.spec.osName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selected OS template is missing os_name.',
        path: ['spec', 'osName'],
      });
    }

    if (!values.spec.osVersion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selected OS template is missing os_version.',
        path: ['spec', 'osVersion'],
      });
    }

    if (values.spec.cpuCore < 2 || values.spec.cpuCore > 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a CPU core!',
        path: ['spec', 'cpuCore'],
      });
    }

    if (values.spec.ramSizeGB < 2 || values.spec.ramSizeGB > 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a RAM size!',
        path: ['spec', 'ramSizeGB'],
      });
    }

    if (values.spec.diskSizeGB < 20 || values.spec.diskSizeGB > 160) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a disk size!',
        path: ['spec', 'diskSizeGB'],
      });
    }
  });

export type FormSchema = z.infer<typeof formSchema>;
