import type { FirewallRuleItem, FirewallView } from './firewall';

/**
 * How the stored firewall treats a listening port from outside:
 * - `anywhere`: an allow (or limit) rule, or an `allow` default, admits anyone;
 * - `restricted`: only the listed sources are allowed;
 * - `none`: no allow rule covers it, so the default policy decides;
 * - `unknown`: the port is not a number we can match.
 * `enforced` is false while the firewall is off: the rules are stored but
 * the server does not apply them.
 */
export interface PortCoverage {
  kind: 'anywhere' | 'restricted' | 'none' | 'unknown';
  enforced: boolean;
  sources: string[];
}

/** Whether a rule's port field (`""`, `80`, `80,443`, `8000:8100`) covers a port. */
export function rulePortCovers(rulePort: string, port: number): boolean {
  const value = rulePort.trim();
  if (!value) return true;

  return value.split(',').some((part) => {
    const range = part.trim().split(/[:-]/);
    if (range.length === 2) {
      const from = Number(range[0]);
      const to = Number(range[1]);
      return (
        Number.isInteger(from) &&
        Number.isInteger(to) &&
        port >= from &&
        port <= to
      );
    }
    return Number(part.trim()) === port;
  });
}

function admits(rule: FirewallRuleItem) {
  return rule.action === 'allow' || rule.action === 'limit';
}

/**
 * Coverage of one listening port by the stored rules (system and user
 * alike). Protocol is not compared: the agent's port list does not say
 * whether a socket is TCP or UDP.
 */
export function portCoverage(
  port: number | string | undefined,
  firewall: Pick<FirewallView, 'rules'> & {
    policy: Pick<FirewallView['policy'], 'enabled' | 'defaultIncoming'>;
  },
): PortCoverage {
  const enforced = firewall.policy.enabled;
  const portNumber = typeof port === 'number' ? port : Number(port);
  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
    return { kind: 'unknown', enforced, sources: [] };
  }

  if (firewall.policy.defaultIncoming === 'allow') {
    return { kind: 'anywhere', enforced, sources: [] };
  }

  const matching = firewall.rules.filter(
    (rule) => admits(rule) && rulePortCovers(rule.port, portNumber),
  );
  if (matching.some((rule) => !rule.source)) {
    return { kind: 'anywhere', enforced, sources: [] };
  }

  const sources = Array.from(new Set(matching.map((rule) => rule.source)));
  if (sources.length > 0) {
    return { kind: 'restricted', enforced, sources };
  }

  return { kind: 'none', enforced, sources: [] };
}
