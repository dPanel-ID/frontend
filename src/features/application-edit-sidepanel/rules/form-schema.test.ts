import { describe, expect, it } from 'vitest';

import { schemaApplicationEdit } from './form-schema';

const autoDeploy = { isEnabled: true, fromBranch: 'main' };

describe('schemaApplicationEdit', () => {
  it('accepts an empty port so auto deployment can be saved alone', () => {
    const parsed = schemaApplicationEdit.safeParse({
      autoDeploy,
      workdir: '',
      port: '',
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.port).toBeUndefined();
  });

  it('still checks a port that is filled in', () => {
    expect(
      schemaApplicationEdit.safeParse({ autoDeploy, port: '3000' }).data?.port,
    ).toBe(3000);
    expect(
      schemaApplicationEdit.safeParse({ autoDeploy, port: '70000' }).success,
    ).toBe(false);
  });
});
