import { describe, expect, it } from 'vitest';

import {
  FIREWALL_RULE_FORM_DEFAULTS,
  isValidPortSpec,
  schemaFirewallRuleForm,
  toFirewallRuleRequest,
} from './form-schema';

const form = (overrides: Partial<typeof FIREWALL_RULE_FORM_DEFAULTS>) => ({
  ...FIREWALL_RULE_FORM_DEFAULTS,
  ...overrides,
});

const issues = (value: unknown) => {
  const result = schemaFirewallRuleForm.safeParse(value);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
};

describe('isValidPortSpec', () => {
  it.each(['', '22', '8000:8100', '8000-8100'])(
    'accepts %s',
    (spec) => {
      expect(isValidPortSpec(spec)).toBe(true);
    },
  );

  it.each(['0', '65536', 'http', '9000:8000', '22:', '1,,2', '80,443'])(
    'rejects %s',
    (spec) => {
      expect(isValidPortSpec(spec)).toBe(false);
    },
  );
});

describe('schemaFirewallRuleForm', () => {
  it('accepts a plain allow rule', () => {
    expect(issues(form({ port: '443' }))).toEqual([]);
  });

  it('needs TCP or UDP for a range and refuses limit on Docker ports', () => {
    expect(issues(form({ port: '8000:8100', protocol: 'any' }))).toEqual([
      'rangeProtocol',
    ]);
    expect(issues(form({ action: 'limit', docker: true }))).toEqual([
      'limitDocker',
    ]);
  });

  it('flags bad ports and sources', () => {
    expect(issues(form({ port: 'abc' }))).toEqual(['port']);
    expect(issues(form({ source: '10.0.0.1 10.0.0.2' }))).toEqual(['source']);
  });
});

describe('toFirewallRuleRequest', () => {
  it('maps the Docker toggle to route and drops empty fields', () => {
    expect(
      toFirewallRuleRequest(form({ docker: true, port: '8000-8100' })),
    ).toEqual({
      action: 'allow',
      direction: 'route',
      protocol: 'tcp',
      port: '8000:8100',
    });
    expect(
      toFirewallRuleRequest(
        form({ source: ' 10.0.0.0/8 ', comment: ' office ' }),
      ),
    ).toEqual({
      action: 'allow',
      direction: 'in',
      protocol: 'tcp',
      source: '10.0.0.0/8',
      comment: 'office',
    });
  });
});
