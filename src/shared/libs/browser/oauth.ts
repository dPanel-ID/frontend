function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function withLeadingSlash(path: string) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildFrontendReturnUrl(path: string, search = '') {
  const publicEndpoint = trimTrailingSlash(import.meta.env.VITE_FRONTEND ?? '');
  return `${publicEndpoint}${withLeadingSlash(path)}${search}`;
}

export function buildGithubAuthUrl(returnTo: string) {
  const backendEndpoint = trimTrailingSlash(import.meta.env.VITE_BACKEND ?? '');
  return `${backendEndpoint}/v1/auth/github?state=${encodeURIComponent(returnTo)}`;
}
