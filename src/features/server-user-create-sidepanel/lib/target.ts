import type { DTOs } from '@/shared/api';

export interface ServiceAccountOption {
  id: string;
  name: string;
  username: string;
}

/** The team that owns a server, or null for a personal server. */
export function serverWorkspaceId(
  server: Pick<
    DTOs.MachineV1,
    'workspace_id' | 'workspace_type' | 'organization_id'
  >,
): string | null {
  const id =
    server.workspace_type === 'group' && server.workspace_id
      ? server.workspace_id
      : server.organization_id;

  return id && /^[1-9]\d*$/.test(id) ? id : null;
}

/** Only workspace accounts have their own identity to add to a server. */
export function toServiceAccountOptions(
  dto: DTOs.ServiceAccountListV1,
): ServiceAccountOption[] {
  return (dto.service_accounts ?? []).flatMap((account) =>
    account.owner_kind === 'workspace' && account.username
      ? [
          {
            id: account.id,
            name: account.name || account.username,
            username: account.username,
          },
        ]
      : [],
  );
}
