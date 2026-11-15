// The GitHub sign-in flows are browser navigations, not API calls: the API
// sends the browser on to GitHub and back to `state` when it is done (with
// `?auth_error=<code>` on failure). Only dPanel API URLs are built here; the
// identity provider behind the API is never linked from the web app.

function backendEndpoint() {
  return (import.meta.env.VITE_BACKEND ?? '').replace(/\/+$/, '');
}

/** Signs in, or signs up, with GitHub and comes back to `returnUrl`. */
export function buildSignInUrl(returnUrl: string) {
  return `${backendEndpoint()}/v1/auth/github-login?state=${encodeURIComponent(returnUrl)}`;
}

/**
 * Links a GitHub account to the signed-in dPanel account (session cookie)
 * and comes back to `returnUrl`.
 */
export function buildLinkUrl(returnUrl: string) {
  return `${backendEndpoint()}/v1/auth/github-login/link?state=${encodeURIComponent(returnUrl)}`;
}
