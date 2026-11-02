import { describe, expect, it } from 'vitest';

import { whoDeployed } from './who-deployed';

const artifact = {
  executor: { userName: 'Nicky Rolly', username: 'nickyrolly1' },
};

describe('whoDeployed', () => {
  it('names whoever started the deployment', () => {
    const deployer = { name: 'Prakasa', username: 'prakasa' };
    expect(whoDeployed({ deployer }, artifact)).toBe(deployer);
  });

  it('falls back to whoever ran the build', () => {
    expect(whoDeployed({}, artifact)).toEqual({
      name: 'Nicky Rolly',
      username: 'nickyrolly1',
      avatarUrl: undefined,
    });
  });

  it('is absent when nobody is known', () => {
    expect(whoDeployed({})).toBeUndefined();
  });
});
