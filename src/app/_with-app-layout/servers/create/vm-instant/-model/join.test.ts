import { describe, expect, it } from 'vitest';

import { readJoinContract } from './join';

describe('readJoinContract', () => {
  it('offers the agent and a public IP choice when the contract has both', () => {
    expect(
      readJoinContract([
        {
          key: 'join_method',
          default: 'agent',
          options: [{ value: 'agent' }, { value: 'ssh' }],
        },
        { key: 'reserve_public_ip', default: true },
      ]),
    ).toEqual({
      agentJoin: true,
      defaultJoinMethod: 'agent',
      publicIPChoice: true,
    });
  });

  it('falls back to SSH without a join_method field', () => {
    expect(readJoinContract([{ key: 'reserve_public_ip' }])).toEqual({
      agentJoin: false,
      defaultJoinMethod: 'ssh',
      publicIPChoice: true,
    });
  });

  it('handles a missing contract', () => {
    expect(readJoinContract(undefined)).toEqual({
      agentJoin: false,
      defaultJoinMethod: 'ssh',
      publicIPChoice: false,
    });
  });
});
