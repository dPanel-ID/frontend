import { describe, expect, it } from 'vitest';

import {
  buildModuleRetryRequirements,
  containsRedactedModuleValue,
  isPinnedModuleRef,
  parseModuleRetryPayload,
} from './retry';

describe('host-group retry helpers', () => {
  it('detects nested redacted module values', () => {
    expect(
      containsRedactedModuleValue({
        nested: {
          api_token: '[redacted]',
        },
      }),
    ).toBe(true);
  });

  it('recognizes pinned refs from expected_commit or commit refs', () => {
    expect(
      isPinnedModuleRef({
        name: 'abc123',
        type: 'commit',
      }),
    ).toBe(true);

    expect(
      isPinnedModuleRef({
        name: 'main',
        type: 'branch',
      }),
    ).toBe(false);
  });

  it('requires variables and a pinned ref when retry metadata is incomplete', () => {
    expect(
      buildModuleRetryRequirements({
        action: 'install',
        ref: {
          name: 'main',
          type: 'branch',
        },
        variables: {
          api_token: '[redacted]',
        },
      }),
    ).toMatchObject({
      requiresPinnedRef: true,
      requiresVariablesResubmission: true,
    });
  });

  it('leaves invalid retry defaults empty until the user replaces them', () => {
    expect(
      buildModuleRetryRequirements({
        action: 'install',
        ref: {
          name: 'main',
          type: 'branch',
        },
        variables: {
          api_token: '[redacted]',
        },
      }),
    ).toMatchObject({
      defaultRefText: '',
      defaultVariablesText: '',
    });
  });

  it('rejects unchanged invalid retry payloads before dispatch', () => {
    expect(() =>
      parseModuleRetryPayload(
        {
          action: 'install',
          ref: {
            name: 'main',
            type: 'branch',
          },
          variables: {
            api_token: '[redacted]',
          },
        },
        '',
        '',
      ),
    ).toThrowError('Resubmit the full variable set');

    expect(() =>
      parseModuleRetryPayload(
        {
          action: 'install',
          ref: {
            name: 'main',
            type: 'branch',
          },
        },
        '{"api_token":"fresh"}',
        '{"type":"branch","name":"main"}',
      ),
    ).toThrowError('Provide an explicit pinned ref');
  });
});
