import { describe, expect, it } from 'vitest';

import { artifactNewDefaults } from './general';

describe('artifactNewDefaults', () => {
  // "Redeploy" opened the panel with no branch picked (2026-11-28).
  it('starts on the branch the application follows', () => {
    expect(
      artifactNewDefaults({ currentServerId: '378', defaultBranch: 'main' }),
    ).toMatchObject({ fromBranch: 'main', workerId: '378' });
  });

  it('leaves the branch empty when none is known', () => {
    expect(artifactNewDefaults({})).toMatchObject({
      fromBranch: '',
      workerId: '',
    });
    expect(artifactNewDefaults({ defaultBranch: '  ' }).fromBranch).toBe('');
  });
});
