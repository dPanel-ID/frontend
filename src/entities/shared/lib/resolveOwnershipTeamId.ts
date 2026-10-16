type OwnershipWorkspaceSource = {
  workspace_type?: string | null;
  workspace_id?: string | null;
};

/**
 * Returns the Casdoor workspace group ID a resource belongs to, or undefined
 * when it lives in its owner's personal workspace.
 */
export function resolveOwnershipTeamId(source: OwnershipWorkspaceSource) {
  if (source.workspace_type !== 'group') return undefined;

  return source.workspace_id?.trim() || undefined;
}
