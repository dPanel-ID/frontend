import type { Locale } from 'use-intl';

import type { useDevetekTranslations } from '@/services/i18n';

import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import type { Dto as UserProfileDto } from '@/shared/api/user.profile';
import { LS_ORGANIZATION_ID } from '@/shared/libs/api-client/config';
import { getDistanceFromNow } from '@/shared/libs/browser/date';


export type Workspace = NonNullable<UserProfileDto['workspaces']>[number];

export function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return initials || 'U';
}

export function getStoredWorkspaceId() {
  if (typeof window === 'undefined') return '';

  return workspaceToOrganizationId(localStorage.getItem(LS_ORGANIZATION_ID));
}

export function formatRelativeDate(value: string | undefined, locale: Locale) {
  if (!value) return '';

  try {
    const formatted = getDistanceFromNow(value, locale);

    if (formatted.toLowerCase().includes('invalid')) return '';

    return formatted;
  } catch {
    return '';
  }
}

export function formatRole(role: string) {
  const [, scopedRole = role] = role.match(/^[^:]+:(.+)$/) ?? [];

  return scopedRole.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getWorkspaceId(workspace: Workspace) {
  return workspaceToOrganizationId(workspace.id);
}

export function getWorkspaceRoleSummary(
  workspace: Workspace | undefined,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const roles = (workspace?.roles ?? []).reduce<string[]>((acc, role) => {
    const formattedRole = formatRole(role);
    const roleKey = formattedRole.toLowerCase();

    if (!formattedRole || acc.some((item) => item.toLowerCase() === roleKey)) {
      return acc;
    }

    return [...acc, formattedRole];
  }, []);

  if (roles.length > 0) {
    return {
      hiddenCount: Math.max(roles.length - 1, 0),
      primaryRole: roles[0] ?? t('page.profile.workspaces.member'),
      roles,
    };
  }

  return {
    hiddenCount: 0,
    primaryRole: t('page.profile.workspaces.member'),
    roles,
  };
}
