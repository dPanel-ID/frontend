import { describe, expect, it } from 'vitest';

import {
  buildModuleRetryRequirements,
  containsRedactedModuleValue,
  isPinnedModuleRef,
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
});
