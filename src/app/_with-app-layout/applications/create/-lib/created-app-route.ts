/**
 * Where the wizard goes once the application is created: its own page,
 * where the first deployment shows, or the list when the API returned no
 * ID.
 */
export function createdApplicationRoute(id: number | string | undefined) {
  const appId = id === undefined ? '' : String(id).trim();
  if (!appId || appId === '0') {
    return { to: '/applications' as const, replace: true };
  }
  return {
    to: '/applications/$id' as const,
    params: { id: appId },
    replace: true,
  };
}
