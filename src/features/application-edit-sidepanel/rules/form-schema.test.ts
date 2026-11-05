import { describe, expect, it } from 'vitest';

import { schemaApplicationEdit } from './form-schema';

const base = { buildTimeout: '', description: '' };

describe('schemaApplicationEdit', () => {
  it('saves auto deployment with a branch', () => {
    const parsed = schemaApplicationEdit.safeParse({
      ...base,
      autoDeploy: { isEnabled: true, fromBranch: 'main' },
    });
    expect(parsed.success).toBe(true);
  });

  it('asks for a branch when auto deployment is on', () => {
    const parsed = schemaApplicationEdit.safeParse({
      ...base,
      autoDeploy: { isEnabled: true, fromBranch: '' },
    });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(['autoDeploy', 'fromBranch']);
  });

  it('accepts durations the API understands and refuses others', () => {
    const off = { isEnabled: false };
    expect(
      schemaApplicationEdit.safeParse({
        ...base,
        autoDeploy: off,
        buildTimeout: '90m',
      }).success,
    ).toBe(true);
    expect(
      schemaApplicationEdit.safeParse({
        ...base,
        autoDeploy: off,
        buildTimeout: '2h',
      }).success,
    ).toBe(true);
    expect(
      schemaApplicationEdit.safeParse({
        ...base,
        autoDeploy: off,
        buildTimeout: 'soon',
      }).success,
    ).toBe(false);
  });

  it('has no work directory or port to change', () => {
    const parsed = schemaApplicationEdit.safeParse({
      ...base,
      autoDeploy: { isEnabled: false },
      workdir: '/srv/other',
      port: 8080,
    });
    expect(parsed.data).not.toHaveProperty('workdir');
    expect(parsed.data).not.toHaveProperty('port');
  });
});
