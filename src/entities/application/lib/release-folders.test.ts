import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SHARED_PATHS,
  keepReleasesOf,
  normalizeSharedPath,
  parseReleaseName,
  parseSharedPathsText,
  releaseFoldersErrors,
  releaseFoldersPatch,
  sharedPathError,
  toReleaseFoldersView,
  usesReleaseFolders,
} from './release-folders';

describe('usesReleaseFolders', () => {
  it('treats a missing, empty or unknown strategy as in place', () => {
    expect(usesReleaseFolders(null)).toBe(false);
    expect(usesReleaseFolders({})).toBe(false);
    expect(usesReleaseFolders({ deploy_strategy: '' })).toBe(false);
    expect(usesReleaseFolders({ deploy_strategy: 'in_place' })).toBe(false);
    expect(usesReleaseFolders({ deploy_strategy: 'releases' })).toBe(true);
  });
});

describe('toReleaseFoldersView', () => {
  it('offers the Laravel paths to an app saved before the fields existed', () => {
    expect(toReleaseFoldersView({ run: { command: './start' } })).toEqual({
      enabled: false,
      sharedPaths: DEFAULT_SHARED_PATHS,
      keepReleases: 3,
    });
  });

  it('reads stored settings and cleans production-shaped data', () => {
    expect(
      toReleaseFoldersView({
        deploy_strategy: 'releases',
        shared_paths: ['./storage/', null, '', 'public/uploads'] as string[],
        keep_releases: 5,
      }),
    ).toEqual({
      enabled: true,
      sharedPaths: ['storage', 'public/uploads'],
      keepReleases: 5,
    });
    expect(
      toReleaseFoldersView({
        deploy_strategy: 'releases',
        shared_paths: [],
        keep_releases: 0,
      }),
    ).toEqual({ enabled: true, sharedPaths: [], keepReleases: 3 });
  });
});

describe('keepReleasesOf', () => {
  it('keeps 1-10 and falls back to 3', () => {
    expect(keepReleasesOf(1)).toBe(1);
    expect(keepReleasesOf(10)).toBe(10);
    expect(keepReleasesOf(0)).toBe(3);
    expect(keepReleasesOf(11)).toBe(3);
    expect(keepReleasesOf(null)).toBe(3);
    expect(keepReleasesOf('4')).toBe(4);
  });
});

describe('sharedPathError', () => {
  it.each([
    ['storage', ''],
    ['.env', ''],
    ['database/database.sqlite', ''],
    ['./public/uploads/', ''],
    ['', 'sharedPathInvalid'],
    ['.', 'sharedPathInvalid'],
    ['/etc/passwd', 'sharedPathAbsolute'],
    ['~/.ssh', 'sharedPathAbsolute'],
    ['../other-app', 'sharedPathParent'],
    ['storage/../../x', 'sharedPathParent'],
    ['storage\\logs', 'sharedPathInvalid'],
    ['a'.repeat(256), 'sharedPathTooLong'],
  ])('%s', (path, error) => {
    expect(sharedPathError(path)).toBe(error);
  });

  it('normalizes before checking', () => {
    expect(normalizeSharedPath('  ./storage//app/ ')).toBe('storage/app');
  });
});

describe('releaseFoldersErrors', () => {
  const valid = {
    enabled: true,
    sharedPaths: ['storage', '.env'],
    keepReleases: 3,
  };

  it('accepts valid settings and skips checks while off', () => {
    expect(releaseFoldersErrors(valid)).toEqual({});
    expect(
      releaseFoldersErrors({
        enabled: false,
        sharedPaths: ['../x'],
        keepReleases: 0,
      }),
    ).toEqual({});
  });

  it('reports each problem by field', () => {
    const errors = releaseFoldersErrors({
      enabled: true,
      sharedPaths: ['storage', './storage', '/abs'],
      keepReleases: 11,
    });
    expect(errors).toEqual({
      keepReleases: 'badKeepReleases',
      'sharedPaths.1': 'sharedPathDuplicate',
      'sharedPaths.2': 'sharedPathAbsolute',
    });
  });

  it('allows at most 20 paths', () => {
    const sharedPaths = Array.from({ length: 21 }, (_, n) => `dir${n}`);
    expect(releaseFoldersErrors({ ...valid, sharedPaths }).sharedPaths).toBe(
      'tooManySharedPaths',
    );
  });
});

describe('releaseFoldersPatch', () => {
  it('sends nothing for an app that stays in place', () => {
    expect(
      releaseFoldersPatch(toReleaseFoldersView({}), { enabled: false }),
    ).toEqual({});
  });

  it('sends the strategy, the cleaned paths and the count when on', () => {
    expect(
      releaseFoldersPatch(
        {
          enabled: true,
          sharedPaths: ['./storage/', 'storage', '.env'],
          keepReleases: 4,
        },
        { enabled: false },
      ),
    ).toEqual({
      deploy_strategy: 'releases',
      shared_paths: ['storage', '.env'],
      keep_releases: 4,
    });
  });

  it('turns it off explicitly when it was on', () => {
    expect(
      releaseFoldersPatch(
        { enabled: false, sharedPaths: [], keepReleases: 3 },
        { enabled: true },
      ),
    ).toEqual({ deploy_strategy: 'in_place' });
  });
});

describe('parseSharedPathsText', () => {
  it('reads one path per line', () => {
    expect(parseSharedPathsText('storage\n\n  .env  \n')).toEqual([
      'storage',
      '.env',
    ]);
  });
});

describe('parseReleaseName', () => {
  it('reads the date and commit', () => {
    const info = parseReleaseName('20261128101500-abc1234');
    expect(info.date?.toISOString()).toBe('2026-11-28T10:15:00.000Z');
    expect(info.commit).toBe('abc1234');
    expect(info.isBeforeReleaseFolders).toBe(false);
  });

  it('recognises the files from before release folders', () => {
    expect(parseReleaseName('00000000000000-in-place')).toEqual({
      date: null,
      commit: '',
      isBeforeReleaseFolders: true,
    });
  });

  it('keeps unknown names readable', () => {
    expect(parseReleaseName('manual')).toEqual({
      date: null,
      commit: '',
      isBeforeReleaseFolders: false,
    });
    expect(parseReleaseName('20261399999999-zz').date).toBeNull();
  });
});
