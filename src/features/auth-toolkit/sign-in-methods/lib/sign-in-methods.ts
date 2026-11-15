import { AxiosError } from 'axios';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import {
  SIGN_IN_PROVIDERS,
  schemaSignInMethod,
} from '../rules/sign-in-methods';
import type {
  SignInMethodRaw,
  SignInMethodView,
  SignInProvider,
  UnlinkFailure,
} from '../rules/sign-in-methods';

/**
 * Providers the web app can link from the profile. The API offers a link
 * flow for GitHub only; Google is added here once it has one.
 */
export const LINKABLE_PROVIDERS: ReadonlySet<SignInProvider> = new Set([
  'github',
]);

function isSignInProvider(value: string): value is SignInProvider {
  return (SIGN_IN_PROVIDERS as readonly string[]).includes(value);
}

function parseMethods(methods: unknown): Map<SignInProvider, SignInMethodRaw> {
  const byProvider = new Map<SignInProvider, SignInMethodRaw>();
  if (!Array.isArray(methods)) return byProvider;

  for (const item of methods) {
    const parsed = schemaSignInMethod.safeParse(item);
    if (!parsed.success) continue;
    const provider = parsed.data.provider.trim().toLowerCase();
    if (!isSignInProvider(provider) || byProvider.has(provider)) continue;
    byProvider.set(provider, parsed.data);
  }

  return byProvider;
}

/**
 * Maps the API's sign-in methods to the rows the profile shows: always
 * password, Google and GitHub in that order, unknown providers left out.
 * Password is never linked or unlinked here; Google and GitHub are unlinked
 * only when the API says so, and linked only when a link flow exists.
 */
export function toSignInMethodViews(
  methods: unknown,
  linkable: ReadonlySet<SignInProvider> = LINKABLE_PROVIDERS,
): SignInMethodView[] {
  const byProvider = parseMethods(methods);
  const linkedCount = [...byProvider.values()].filter((m) => m.linked).length;

  return SIGN_IN_PROVIDERS.map((provider): SignInMethodView => {
    const raw = byProvider.get(provider);
    const linked = raw?.linked ?? false;
    const username = raw?.username?.trim().replace(/^@+/, '') || undefined;

    let action: SignInMethodView['action'] = 'none';
    if (provider !== 'password') {
      if (linked && raw?.can_unlink) action = 'unlink';
      if (!linked && linkable.has(provider)) action = 'link';
    }

    return {
      provider,
      linked,
      username: provider === 'github' && linked ? username : undefined,
      action,
      isOnlyMethod: linked && linkedCount === 1,
    };
  });
}

function statusCodeOf(error: unknown): number | undefined {
  if (error instanceof BaseResponseError) return error.code;
  if (error instanceof AxiosError) return error.response?.status;
  return undefined;
}

/** A 409 means it was the last way to sign in; anything else is generic. */
export function classifyUnlinkFailure(error: unknown): UnlinkFailure {
  return statusCodeOf(error) === 409 ? 'lastMethod' : 'other';
}
