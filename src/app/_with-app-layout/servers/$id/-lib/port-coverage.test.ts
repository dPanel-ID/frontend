import { describe, expect, it } from 'vitest';

import type { FirewallRuleItem } from './firewall';
import { portCoverage, rulePortCovers } from './port-coverage';

const rule = (overrides: Partial<FirewallRuleItem>): FirewallRuleItem => ({
  id: 'r',
  action: 'allow',
  target: 'host',
  protocol: 'tcp',
  port: '',
  source: '',
  comment: '',
  origin: 'user',
  locked: false,
  ...overrides,
});

const firewall = (
  rules: FirewallRuleItem[],
  policy: { enabled?: boolean; defaultIncoming?: string } = {},
) => ({
  rules,
  policy: { enabled: true, defaultIncoming: 'deny', ...policy },
});

describe('rulePortCovers', () => {
  it.each([
    ['', 22, true],
    ['22', 22, true],
    ['22', 23, false],
    ['80,443', 443, true],
    ['8000:8100', 8050, true],
    ['8000-8100', 8101, false],
    ['abc', 22, false],
  ])('%s covers %d: %s', (rulePort, port, expected) => {
    expect(rulePortCovers(rulePort, port)).toBe(expected);
  });
});

describe('portCoverage', () => {
  const rules = [
    rule({ port: '22', origin: 'system', locked: true }),
    rule({ port: '4150', target: 'docker', source: '82.153.226.242' }),
    rule({ port: '4150', target: 'docker', source: '82.153.226.243' }),
    rule({ port: '9100', action: 'deny' }),
  ];

  it('finds system and user allow rules', () => {
    expect(portCoverage(22, firewall(rules))).toEqual({
      kind: 'anywhere',
      enforced: true,
      sources: [],
    });
    expect(portCoverage('4150', firewall(rules))).toEqual({
      kind: 'restricted',
      enforced: true,
      sources: ['82.153.226.242', '82.153.226.243'],
    });
  });

  it('reports no allow rule for denied or uncovered ports', () => {
    expect(portCoverage(9100, firewall(rules)).kind).toBe('none');
    expect(portCoverage(5432, firewall(rules)).kind).toBe('none');
  });

  it('marks coverage as not enforced while the firewall is off', () => {
    expect(portCoverage(22, firewall(rules, { enabled: false }))).toMatchObject(
      {
        kind: 'anywhere',
        enforced: false,
      },
    );
  });

  it('treats an allow default as open to anyone', () => {
    expect(
      portCoverage(5432, firewall([], { defaultIncoming: 'allow' })).kind,
    ).toBe('anywhere');
  });

  it('counts limit rules as allowing and ignores non-numeric ports', () => {
    expect(
      portCoverage(22, firewall([rule({ port: '22', action: 'limit' })])).kind,
    ).toBe('anywhere');
    expect(portCoverage('-', firewall(rules)).kind).toBe('unknown');
    expect(portCoverage(undefined, firewall(rules)).kind).toBe('unknown');
  });
});
