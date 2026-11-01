import { describe, expect, it } from 'vitest';

import { parseModuleVersion } from './version';

describe('parseModuleVersion', () => {
  it.each([
    ['tags/v1.0.0', { kind: 'release', value: '1.0.0' }],
    ['refs/tags/v2.3.1-rc.1', { kind: 'release', value: '2.3.1-rc.1' }],
    ['tags/stable', { kind: 'release', value: 'stable' }],
    ['heads/main', { kind: 'latest', value: 'main' }],
    ['master', { kind: 'latest', value: 'master' }],
    ['heads/feat-x', { kind: 'branch', value: 'feat-x' }],
    ['22', { kind: 'release', value: '22' }],
    ['v3.12', { kind: 'release', value: '3.12' }],
    ['31cde20c4ddb', { kind: 'build', value: '31cde20' }],
    ['default', { kind: 'default', value: 'default' }],
    ['lts', { kind: 'other', value: 'lts' }],
  ])('reads %s', (raw, want) => {
    expect(parseModuleVersion(raw)).toEqual(want);
  });

  it('has nothing to say about an empty value', () => {
    expect(parseModuleVersion('  ')).toBeUndefined();
    expect(parseModuleVersion(undefined)).toBeUndefined();
  });
});
