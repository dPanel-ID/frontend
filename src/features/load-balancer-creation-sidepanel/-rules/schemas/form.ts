import { z } from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

const protocols = ['http', 'tcp', 'udp'] as const;

/** What an L4 load balancer exposes; it only picks defaults and wording. */
export const L4_SERVICES = [
  'generic',
  'postgresql',
  'mariadb',
  'mongodb',
  'redis',
] as const;

/** The usual port of each database service, a starting listen port. */
export const L4_SERVICE_PORTS: Record<(typeof L4_SERVICES)[number], number> = {
  generic: 0,
  postgresql: 5432,
  mariadb: 3306,
  mongodb: 27017,
  redis: 6379,
};

/** Ports the gateway or an engine uses itself; the backend refuses them. */
export const L4_RESERVED_PORTS = [
  22, 80, 443, 2019, 8402, 9080, 9090, 9091, 9180, 9443,
];

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

/** "any", or IPv4 addresses and CIDRs separated by commas, spaces or lines. */
export function parseAllowFrom(raw: string | undefined) {
  return (raw ?? '')
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isAllowFromEntry(entry: string) {
  if (entry.toLowerCase() === 'any') return true;
  const [address, bits, ...rest] = entry.split('/');
  if (rest.length > 0 || !IPV4.test(address ?? '')) return false;
  return bits === undefined || (/^\d+$/.test(bits) && Number(bits) <= 32);
}

const upstream = z.object({
  address: z.string().min(1, 'formErrors.required'),
  port: z.number().int().positive('formErrors.portPositive'),
});

/**
 * A custom application target: an IP, a host or an origin URL such as
 * https://origin.example.com. The port may be left out; a URL then uses its
 * scheme's port and a plain address the application's.
 *
 * Checked only while the rule's mode is custom (see l7Rule): the rows stay in
 * the form after switching to another mode, and must not block it.
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
    customTargetsIfProxyPassApp: z
      .array(z.object({ address: z.string(), port: z.number().optional() }))
      .optional(),
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

    const custom = data.customTargetsIfProxyPassApp ?? [];
    const usesCustom =
      data.type === 'proxy-pass-app' &&
      data.addressModeIfProxyPassApp === 'custom';

    if (usesCustom) {
      custom.forEach((target, index) => {
        const result = customTarget.safeParse(target);
        result.error?.issues.forEach((issue) =>
          ctx.addIssue({
            code: 'custom',
            path: ['customTargetsIfProxyPassApp', index, ...issue.path],
            message: issue.message,
          }),
        );
      });
    }

    // Each engine reaches one route's targets the same way, so they are all
    // origin URLs or all plain addresses.
    if (
      usesCustom &&
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

const l4Rule = z
  .object({
    upstreams: z.array(upstream).min(1, 'formErrors.required'),
    service: z.enum(L4_SERVICES).default('generic'),
    listenPort: z
      .number({ error: 'formErrors.required' })
      .int()
      .min(1024, 'formErrors.l4PortRange')
      .max(65_535, 'formErrors.l4PortRange'),
    listenAddress: z.string().trim().default('0.0.0.0'),
    /** "any", or addresses and CIDRs; required for database services. */
    allowFrom: z.string().default(''),
    balance: z.enum(['roundrobin', 'first']).default('roundrobin'),
    idleTimeout: z.string().trim().default('1h'),
  })
  .superRefine((data, ctx) => {
    if (L4_RESERVED_PORTS.includes(data.listenPort)) {
      ctx.addIssue({
        code: 'custom',
        path: ['listenPort'],
        message: 'formErrors.l4PortReserved',
      });
    }
    if (data.listenAddress && !IPV4.test(data.listenAddress)) {
      ctx.addIssue({
        code: 'custom',
        path: ['listenAddress'],
        message: 'formErrors.ipv4',
      });
    }
    const allowFrom = parseAllowFrom(data.allowFrom);
    if (!allowFrom.every(isAllowFromEntry)) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowFrom'],
        message: 'formErrors.allowFrom',
      });
    } else if (
      allowFrom.length > 1 &&
      allowFrom.some((entry) => entry.toLowerCase() === 'any')
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowFrom'],
        message: 'formErrors.allowFromAny',
      });
    } else if (data.service !== 'generic' && allowFrom.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowFrom'],
        message: 'formErrors.allowFromRequired',
      });
    }
    if (data.idleTimeout && !/^\d+(m|h)$/.test(data.idleTimeout)) {
      ctx.addIssue({
        code: 'custom',
        path: ['idleTimeout'],
        message: 'formErrors.idleTimeout',
      });
    }
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

      if (
        data.features.protocol !== 'tcp' &&
        data.features.protocol !== 'udp'
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['features', 'protocol'],
          message: 'formErrors.required',
        });
      }
    }
  });

export type CreationFormValues = z.input<typeof schemaCreationForm>;
