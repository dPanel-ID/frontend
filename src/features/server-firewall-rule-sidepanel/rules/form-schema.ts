import { z } from 'zod';

import {
  FIREWALL_RULE_ACTIONS,
  FIREWALL_RULE_PROTOCOLS,
} from '@/shared/api/-dtos/firewall';
import type { FirewallRuleRequestV2 } from '@/shared/api/-dtos/firewall';

// Messages are i18n keys under `sidepanel.firewallRule.errors`.

const PORT_PART = /^(\d{1,5})(?:[:-](\d{1,5}))?$/;

function isPort(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

/** A port (`443`), a range (`8000:8100`) or a comma list of them; empty is any port. */
export function isValidPortSpec(value: string): boolean {
  const spec = value.trim();
  if (!spec) return true;

  return spec.split(',').every((part) => {
    const match = PORT_PART.exec(part.trim());
    if (!match) return false;
    const from = Number(match[1]);
    if (!isPort(from)) return false;
    if (match[2] == null) return true;
    const to = Number(match[2]);
    return isPort(to) && from < to;
  });
}

/** Whether the port field names more than one port. */
export function isMultiPort(value: string): boolean {
  return /[:,-]/.test(value.trim());
}

export const schemaFirewallRuleForm = z
  .object({
    action: z.enum(FIREWALL_RULE_ACTIONS),
    docker: z.boolean(),
    protocol: z.enum(FIREWALL_RULE_PROTOCOLS),
    port: z.string().trim().max(11, 'portLength'),
    source: z
      .string()
      .trim()
      .max(64, 'sourceLength')
      .refine((value) => !/\s/.test(value), 'source'),
    comment: z.string().trim().max(64, 'commentLength'),
  })
  .superRefine((value, ctx) => {
    if (!isValidPortSpec(value.port)) {
      ctx.addIssue({ code: 'custom', path: ['port'], message: 'port' });
    } else if (isMultiPort(value.port) && value.protocol === 'any') {
      ctx.addIssue({
        code: 'custom',
        path: ['protocol'],
        message: 'rangeProtocol',
      });
    }
    if (value.action === 'limit' && value.docker) {
      ctx.addIssue({
        code: 'custom',
        path: ['action'],
        message: 'limitDocker',
      });
    }
  });

export type SchemaFirewallRuleForm = z.infer<typeof schemaFirewallRuleForm>;

export const FIREWALL_RULE_FORM_DEFAULTS: SchemaFirewallRuleForm = {
  action: 'allow',
  docker: false,
  protocol: 'tcp',
  port: '',
  source: '',
  comment: '',
};

/** The POST body; empty optional fields are left out so the API applies its defaults. */
export function toFirewallRuleRequest(
  values: SchemaFirewallRuleForm,
): FirewallRuleRequestV2 {
  const port = values.port.trim().replace(/-/g, ':');
  const source = values.source.trim();
  const comment = values.comment.trim();

  return {
    action: values.action,
    direction: values.docker ? 'route' : 'in',
    protocol: values.protocol,
    ...(port ? { port } : {}),
    ...(source ? { source } : {}),
    ...(comment ? { comment } : {}),
  };
}
