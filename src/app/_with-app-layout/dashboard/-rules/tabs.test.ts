import { describe, expect, it } from 'vitest';

import {
  DASHBOARD_TABS,
  dashboardTabsFor,
  resolveDashboardTab,
  schemaDashboardSearch,
} from './tabs';

describe('schemaDashboardSearch', () => {
  it('defaults to the overview', () => {
    expect(schemaDashboardSearch.parse({})).toEqual({ tab: 'overview' });
  });

  it('keeps a known tab', () => {
    for (const tab of DASHBOARD_TABS) {
      expect(schemaDashboardSearch.parse({ tab })).toEqual({ tab });
    }
  });

  it('falls back rather than throwing on a bad value in the URL', () => {
    // A stale bookmark or a hand-edited URL must not break the page.
    expect(schemaDashboardSearch.parse({ tab: 'nonsense' })).toEqual({
      tab: 'overview',
    });
    expect(schemaDashboardSearch.parse({ tab: 42 })).toEqual({
      tab: 'overview',
    });
  });
});

describe('dashboardTabsFor', () => {
  it('gives a team workspace every tab', () => {
    expect(dashboardTabsFor(true).map((item) => item.id)).toEqual([
      ...DASHBOARD_TABS,
    ]);
  });

  it('omits the team-only tabs from a personal workspace', () => {
    const ids = dashboardTabsFor(false).map((item) => item.id);

    // A personal workspace has no members, so the tab does not exist rather
    // than existing to explain that it is empty.
    expect(ids).not.toContain('workspace');
    expect(ids).toEqual(['overview', 'activity', 'resources']);
  });
});

describe('resolveDashboardTab', () => {
  it('keeps a tab the workspace has', () => {
    expect(resolveDashboardTab('activity', false)).toBe('activity');
    expect(resolveDashboardTab('workspace', true)).toBe('workspace');
  });

  it('falls back when a personal workspace lands on a team-only tab', () => {
    // Reachable from a bookmark, a shared link, or switching workspace with
    // the tab already open.
    expect(resolveDashboardTab('workspace', false)).toBe('overview');
  });
});
