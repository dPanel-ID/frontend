import { z } from 'zod';

// Shapes of `/v2/server/{id}/firewall`. Every field is optional or nullish:
// Go omits empty values and may send null for an empty list, and a view must
// still render whatever arrives.

/** One stored rule: system and legacy rules come first and are locked. */
export const schemaFirewallRuleV2 = z.object({
  id: z.string().nullish(),
  /** allow | deny | limit | reject */
  action: z.string().nullish(),
  /** "in" for the host, "route" for a Docker-published container port. */
  direction: z.string().nullish(),
  /** tcp | udp | any */
  protocol: z.string().nullish(),
  /** A port or range; empty means any port. */
  port: z.string().nullish(),
  /** A CIDR or address; empty means anywhere. */
  source: z.string().nullish(),
  comment: z.string().nullish(),
  /** system | legacy | user | module */
  origin: z.string().nullish(),
  locked: z.boolean().nullish(),
});

export const schemaFirewallPolicyV2 = z.object({
  enabled: z.boolean().nullish(),
  default_incoming: z.string().nullish(),
  default_outgoing: z.string().nullish(),
  default_routed: z.string().nullish(),
  docker_filtering: z.boolean().nullish(),
  /** Stored policy version; send it back on every write. */
  version: z.number().nullish(),
  applied_version: z.number().nullish(),
  applied_at: z.string().nullish(),
  last_execution_id: z.string().nullish(),
  live_checked_at: z.string().nullish(),
  drift: z.boolean().nullish(),
  apply_in_progress: z.boolean().nullish(),
  last_apply_status: z.string().nullish(),
});

export const schemaFirewallV2 = z.object({
  server_id: z.string().nullish(),
  module_installed: z.boolean().nullish(),
  policy: schemaFirewallPolicyV2.nullish(),
  rules: z.array(schemaFirewallRuleV2).nullish(),
});

/** A rule as ufw reports it on the server. */
export const schemaFirewallLiveRuleV2 = z.object({
  raw: z.string().nullish(),
  parsed: z.boolean().nullish(),
  /** Set when the rule carries a dPanel comment, so dPanel owns it. */
  dpanel_id: z.string().nullish(),
  action: z.string().nullish(),
  direction: z.string().nullish(),
  route: z.boolean().nullish(),
  proto: z.string().nullish(),
  port: z.string().nullish(),
  from: z.string().nullish(),
  from_port: z.string().nullish(),
  to: z.string().nullish(),
  app: z.string().nullish(),
  interface: z.string().nullish(),
  comment: z.string().nullish(),
});

export const schemaFirewallLiveStateV2 = z.object({
  /** False, with a reason, when the module is missing or the agent is too old. */
  available: z.boolean().nullish(),
  reason: z.string().nullish(),
  enabled: z.boolean().nullish(),
  defaults: z.record(z.string(), z.string()).nullish(),
  rules: z.array(schemaFirewallLiveRuleV2).nullish(),
  docker: z
    .object({
      hooked: z.boolean().nullish(),
      filtering: z.boolean().nullish(),
    })
    .nullish(),
});

export const schemaFirewallDefaultChangeV2 = z.object({
  direction: z.string().nullish(),
  live: z.string().nullish(),
  desired: z.string().nullish(),
});

/** Desired against live: what an apply would do. `/plan` and `/live`. */
export const schemaFirewallPlanV2 = z.object({
  firewall: schemaFirewallV2.nullish(),
  live: schemaFirewallLiveStateV2.nullish(),
  to_add: z.array(schemaFirewallRuleV2).nullish(),
  to_remove: z.array(schemaFirewallLiveRuleV2).nullish(),
  foreign: z.array(schemaFirewallLiveRuleV2).nullish(),
  /** "enable" | "disable" | "" */
  enabled_change: z.string().nullish(),
  default_changes: z.array(schemaFirewallDefaultChangeV2).nullish(),
  /** "hook" | "unhook" | "" */
  docker_change: z.string().nullish(),
  ssh_open: z.boolean().nullish(),
  in_sync: z.boolean().nullish(),
});

export const schemaFirewallExecutionV2 = z.object({
  execution_id: z.string().nullish(),
  version: z.number().nullish(),
});

export const schemaFirewallImportV2 = z.object({
  created: z.array(schemaFirewallRuleV2).nullish(),
  skipped: z.array(schemaFirewallLiveRuleV2).nullish(),
});

export type FirewallRuleV2 = z.infer<typeof schemaFirewallRuleV2>;
export type FirewallPolicyV2 = z.infer<typeof schemaFirewallPolicyV2>;
export type FirewallV2 = z.infer<typeof schemaFirewallV2>;
export type FirewallLiveRuleV2 = z.infer<typeof schemaFirewallLiveRuleV2>;
export type FirewallLiveStateV2 = z.infer<typeof schemaFirewallLiveStateV2>;
export type FirewallDefaultChangeV2 = z.infer<
  typeof schemaFirewallDefaultChangeV2
>;
export type FirewallPlanV2 = z.infer<typeof schemaFirewallPlanV2>;
export type FirewallExecutionV2 = z.infer<typeof schemaFirewallExecutionV2>;
export type FirewallImportV2 = z.infer<typeof schemaFirewallImportV2>;

// =============================================================================
//   Requests
// =============================================================================

export const FIREWALL_RULE_ACTIONS = [
  'allow',
  'deny',
  'limit',
  'reject',
] as const;
export const FIREWALL_RULE_PROTOCOLS = ['tcp', 'udp', 'any'] as const;
export const FIREWALL_DEFAULT_POLICIES = ['deny', 'reject', 'allow'] as const;

export const schemaFirewallRuleRequestV2 = z.object({
  action: z.enum(FIREWALL_RULE_ACTIONS),
  direction: z.enum(['in', 'route']).optional(),
  protocol: z.enum(FIREWALL_RULE_PROTOCOLS).optional(),
  port: z.string().max(11).optional(),
  source: z.string().max(64).optional(),
  comment: z.string().max(64).optional(),
});

export const schemaFirewallPolicyRequestV2 = z.object({
  version: z.number().int().min(0),
  enabled: z.boolean().optional(),
  default_incoming: z.enum(FIREWALL_DEFAULT_POLICIES).optional(),
  default_outgoing: z.enum(FIREWALL_DEFAULT_POLICIES).optional(),
  default_routed: z.enum(FIREWALL_DEFAULT_POLICIES).optional(),
  docker_filtering: z.boolean().optional(),
});

export type FirewallRuleRequestV2 = z.infer<typeof schemaFirewallRuleRequestV2>;
export type FirewallPolicyRequestV2 = z.infer<
  typeof schemaFirewallPolicyRequestV2
>;

export interface FirewallApplyRequestV2 {
  version: number;
  enable: boolean;
}

export interface FirewallDisableRequestV2 {
  version: number;
}

export interface FirewallImportRequestV2 {
  legacy: boolean;
}
