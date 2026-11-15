import { describe, expect, it } from 'vitest';

import {
  canBackUpToGit,
  gitBackupBranchError,
  isGitBackupDeployBranch,
  isGitBackupFinished,
  schemaGitBackupForm,
} from './git-backup';

describe('gitBackupBranchError', () => {
  it.each([
    'main',
    'dpanel-backup/web-01-20261115-0930',
    'feature/x.y',
    'release-1_2',
  ])('accepts %s', (name) => {
    expect(gitBackupBranchError(name)).toBeNull();
  });

  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['a'.repeat(201), 'tooLong'],
    ['a b', 'characters'],
    ['a~1', 'characters'],
    ['a:b', 'characters'],
    ['HEAD', 'reserved'],
    ['-x', 'reserved'],
    ['/a', 'slashes'],
    ['a//b', 'slashes'],
    ['a..b', 'dots'],
    ['a.', 'ending'],
    ['a.lock', 'ending'],
    ['a/.b', 'ending'],
  ] as const)('refuses %j as %s', (name, error) => {
    expect(gitBackupBranchError(name)).toBe(error);
  });
});

describe('schemaGitBackupForm', () => {
  it('reports the branch error on the branch field', () => {
    const result = schemaGitBackupForm.safeParse({
      branch: 'a..b',
      confirmDeployBranch: false,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['branch']);
    expect(result.error?.issues[0]?.message).toBe('dots');
  });
});

describe('isGitBackupDeployBranch', () => {
  it('matches exactly, as git does', () => {
    expect(isGitBackupDeployBranch(['main'], ' main ')).toBe(true);
    expect(isGitBackupDeployBranch(['main'], 'Main')).toBe(false);
    expect(isGitBackupDeployBranch([], 'main')).toBe(false);
  });
});

describe('canBackUpToGit', () => {
  it('offers a backup only for a settled release', () => {
    expect(canBackUpToGit('ready')).toBe(true);
    expect(canBackUpToGit('failed')).toBe(true);
    for (const status of [
      'progress',
      'pending',
      'deleting',
      'deleted',
    ] as const) {
      expect(canBackUpToGit(status)).toBe(false);
    }
  });
});

describe('isGitBackupFinished', () => {
  it('knows the final statuses', () => {
    expect(isGitBackupFinished('pushed')).toBe(true);
    expect(isGitBackupFinished('unchanged')).toBe(true);
    expect(isGitBackupFinished('failed')).toBe(true);
    expect(isGitBackupFinished('running')).toBe(false);
    expect(isGitBackupFinished(undefined)).toBe(false);
  });
});
