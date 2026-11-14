// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { LS_ORGANIZATION_ID, selectedWorkspaceOrganizationId } from '.';

afterEach(() => localStorage.clear());

describe('selectedWorkspaceOrganizationId', () => {
  it('is null in the personal workspace', () => {
    expect(selectedWorkspaceOrganizationId()).toBeNull();
  });

  // /teams read the profile instead and said "Personal" while the sidebar
  // and every request were on a team.
  it('reads the team the sidebar selected, without its prefix', () => {
    localStorage.setItem(LS_ORGANIZATION_ID, 'org-5209311491061018854');
    expect(selectedWorkspaceOrganizationId()).toBe('5209311491061018854');
  });
});
