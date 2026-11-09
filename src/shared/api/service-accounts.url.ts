import { PERSONAL_WORKSPACE_ID } from '@/shared/libs/api-client/config';

/** The API names a team by query; no query means the caller's own accounts. */
export function serviceAccountsUrl(workspaceId: string, path = ''): string {
  const query =
    workspaceId === PERSONAL_WORKSPACE_ID
      ? ''
      : `?workspace_id=${encodeURIComponent(workspaceId)}`;

  return `/v1/service-accounts${path}${query}`;
}
