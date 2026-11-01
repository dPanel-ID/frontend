/** Query parameter other dPanel services use to come back after sign-in. */
export const RETURN_URL_PARAM = 'redirect';

function hostOf(url: string | undefined) {
  if (!url) return '';
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** The domain sibling services share, e.g. devetek.app for dnocs.devetek.app. */
function parentDomain(host: string) {
  const labels = host.split('.');
  return labels.length > 2 ? labels.slice(1).join('.') : host;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Returns the URL to go back to after sign-in, or null when it is missing or
 * not a dPanel service. Only https URLs on the frontend's own domain (or its
 * sibling subdomains, such as dbmanager.devetek.app) are accepted, so the
 * login page cannot be used to send people to another site.
 */
export function safeReturnUrl(
  raw: string | null | undefined,
  frontendUrl: string | undefined,
): string | null {
  const value = raw?.trim();
  const frontendHost = hostOf(frontendUrl);
  if (!value || !frontendHost) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (LOCAL_HOSTS.has(host) && LOCAL_HOSTS.has(frontendHost)) {
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null;

  const domain = parentDomain(frontendHost);
  const allowed =
    host === frontendHost || host === domain || host.endsWith(`.${domain}`);
  return allowed ? url.toString() : null;
}

/** Reads the return URL from the current page's query string. */
export function readReturnUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get(RETURN_URL_PARAM);
  return safeReturnUrl(raw, import.meta.env.VITE_FRONTEND);
}
