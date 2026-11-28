import { describe, expect, it } from 'vitest';

import { toServerReleasesView } from './server-releases';

describe('toServerReleasesView', () => {
  it('reads an empty or missing answer', () => {
    expect(toServerReleasesView(null)).toEqual({
      usesReleaseFolders: false,
      keepReleases: 3,
      releases: [],
      reportedAt: null,
      rollbackAvailable: false,
      running: false,
    });
    expect(
      toServerReleasesView({ strategy: 'releases', releases: null }).releases,
    ).toEqual([]);
  });

  it('marks current and previous and who can be rolled back to', () => {
    const view = toServerReleasesView({
      strategy: 'releases',
      keep_releases: 3,
      current: '20261128101500-abc1234',
      previous: '20261127090000-def5678',
      releases: [
        { name: '20261128101500-abc1234', current: true },
        {
          name: '20261127090000-def5678',
          created_at: '2026-11-27T09:00:05Z',
          commit: 'def5678',
        },
        { name: '00000000000000-in-place' },
        { name: '' },
        { name: '20261128101500-abc1234' },
      ],
      reported_at: '2026-11-28T10:16:00Z',
      rollback_available: true,
      running: false,
    });
    expect(view.usesReleaseFolders).toBe(true);
    expect(view.reportedAt?.toISOString()).toBe('2026-11-28T10:16:00.000Z');
    expect(
      view.releases.map((release) => [
        release.name,
        release.current,
        release.previous,
        release.canRollBack,
        release.isBeforeReleaseFolders,
      ]),
    ).toEqual([
      ['20261128101500-abc1234', true, false, false, false],
      ['20261127090000-def5678', false, true, true, false],
      ['00000000000000-in-place', false, false, true, true],
    ]);
    expect(view.releases[0]?.commit).toBe('abc1234');
    expect(view.releases[0]?.date?.toISOString()).toBe(
      '2026-11-28T10:15:00.000Z',
    );
    expect(view.releases[1]?.date?.toISOString()).toBe(
      '2026-11-27T09:00:05.000Z',
    );
  });

  it('offers no rollback while a deploy is running', () => {
    const view = toServerReleasesView({
      strategy: 'releases',
      current: 'b',
      releases: [{ name: 'b' }, { name: 'a' }],
      running: true,
    });
    expect(view.running).toBe(true);
    expect(view.releases.every((release) => !release.canRollBack)).toBe(true);
  });
});
