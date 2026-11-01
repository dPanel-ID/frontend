import { z } from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

const protocols = [
  'http',
  'tcp',
  'udp',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
] as const;

const upstream = z.object({
  address: z.string().min(1, 'formErrors.required'),
  port: z.number().int().positive('formErrors.portPositive'),
});

/**
 * A custom application target: an IP, a host or an origin URL such as
 * https://origin.example.com. The port may be left out; a URL then uses its
 * scheme's port and a plain address the application's.
 */
const customTarget = z.object({
  address: z.string().trim().min(1, 'formErrors.required'),
  port: z
    .number()
    .int()
    .min(1, 'formErrors.portPositive')
    .max(65_535, 'formErrors.portPositive')
    .optional(),
});

export function isOriginUrl(address: string) {
  return /^https?:\/\//i.test(address.trim());
}

const l7Rule = z
  .object({
    pathMatch: z.string().min(1, 'formErrors.required'),
    type: z.enum(['proxy_pass', 'proxy-pass', 'proxy-pass-app']),
    upstreamsIfProxyPass: z.array(upstream).optional(),
    applicationIdIfProxyPassApp: SchemaCommon.unitId.optional(),
    /**
     * How an application on another server is reached: its address
     * registered in dPanel, its private network IP, or targets typed here.
     */
    addressModeIfProxyPassApp: z
      .enum(['registered', 'private', 'custom'])
      .optional(),
    customTargetsIfProxyPassApp: z.array(customTarget).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.type === 'proxy-pass' || data.type === 'proxy_pass') &&
      (!data.upstreamsIfProxyPass || data.upstreamsIfProxyPass.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['upstreamsIfProxyPass'],
        message: 'formErrors.required',
      });
    }

    if (
      data.type === 'proxy-pass-app' &&
      data.addressModeIfProxyPassApp === 'custom' &&
      (!data.customTargetsIfProxyPassApp ||
        data.customTargetsIfProxyPassApp.length === 0)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['customTargetsIfProxyPassApp'],
        message: 'formErrors.required',
      });
    }

    // Each engine reaches one route's targets the same way, so they are all
    // origin URLs or all plain addresses.
    const custom = data.customTargetsIfProxyPassApp ?? [];
    if (
      data.type === 'proxy-pass-app' &&
      data.addressModeIfProxyPassApp === 'custom' &&
      new Set(custom.map((target) => isOriginUrl(target.address))).size > 1
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['customTargetsIfProxyPassApp'],
        message: 'formErrors.mixedTargetForms',
      });
    }

    if (data.type === 'proxy-pass-app' && !data.applicationIdIfProxyPassApp) {
      ctx.addIssue({
        code: 'custom',
        path: ['applicationIdIfProxyPassApp'],
        message: 'formErrors.required',
      });
    }
  });

const l4Rule = z.object({
  upstreams: z.array(upstream).min(1, 'formErrors.required'),
});

export const schemaCreationForm = z
  .object({
    domain: z.string().min(1, 'formErrors.required'),
    internalDomainMetadata: z
      .object({
        cloudflare: z
          .object({
            proxied: z.boolean().default(true).optional(),
          })
          .optional(),
        id: SchemaCommon.unitId,
        subdomain: z.string(),
        ttl: z.number().int().positive().optional(),
      })
      .optional(),
    description: z.string(),
    serverId: SchemaCommon.unitId.min(1, 'formErrors.required'),
    lbKind: z.enum(['l7', 'l4']),
    engine: z.string().min(1, 'formErrors.required'),
    features: z.object({
      protocol: z.enum(protocols).optional(),
      sslEnabled: z.boolean().default(true),
    }),
    l7rules: z.array(l7Rule).optional(),
    l4rule: l4Rule.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.lbKind === 'l7') {
      if (!data.l7rules || data.l7rules.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['l7rules'],
          message: 'formErrors.required',
        });
      }
    }

    if (data.lbKind === 'l4') {
      if (!data.l4rule) {
        ctx.addIssue({
          code: 'custom',
          path: ['l4rule'],
          message: 'formErrors.required',
        });
      }

      if (data.features.protocol == null) {
        ctx.addIssue({
          code: 'custom',
          path: ['features', 'protocol'],
          message: 'formErrors.required',
        });
      }
    }
  });

export type CreationFormValues = z.input<typeof schemaCreationForm>;
