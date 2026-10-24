export interface BranchChoice {
  name: string;
  commitHead: string;
}

/**
 * The branch list out of a `/v1/git-branch/find` response.
 *
 * `useApiGet` assigns `$status` onto the payload itself, so a successful
 * response for this endpoint *is* the branch array. Every other status —
 * `initial` while the query is skipped or before the first fetch, `failed`,
 * `loading` with no previous data — is a plain object, and calling an array
 * method on one throws. Narrow here, once, instead of trusting the type.
 */
export function toBranchChoices(response: unknown): BranchChoice[] | null {
  const payload = settledPayload(response);

  if (!Array.isArray(payload)) return null;

  return payload.flatMap((branch) => {
    if (branch == null || typeof branch !== 'object') return [];

    const name = (branch as { name?: unknown }).name;
    const commit = (branch as { commit?: { sha?: unknown } }).commit;
    const commitHead = commit?.sha;

    if (typeof name !== 'string' || !name) return [];
    if (typeof commitHead !== 'string' || !commitHead) return [];

    return [{ name, commitHead }];
  });
}

function settledPayload(response: unknown) {
  if (response == null || typeof response !== 'object') return undefined;

  const status = (response as { $status?: unknown }).$status;

  if (status === 'success') return response;
  if (status === 'loading')
    return (response as { prevData?: unknown }).prevData;

  return undefined;
}
