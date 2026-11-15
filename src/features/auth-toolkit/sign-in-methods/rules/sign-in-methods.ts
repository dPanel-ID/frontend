import { z } from 'zod';

/** The sign-in methods the profile lists, in display order. */
export const SIGN_IN_PROVIDERS = ['password', 'google', 'github'] as const;

export type SignInProvider = (typeof SIGN_IN_PROVIDERS)[number];

/**
 * One method from `GET /v1/auth/sign-in-methods`. Every field falls back to
 * a safe value, so a missing or odd field never breaks the profile.
 */
export const schemaSignInMethod = z.object({
  provider: z.string().catch(''),
  linked: z.boolean().catch(false),
  username: z.string().nullish().catch(null),
  can_unlink: z.boolean().catch(false),
});

export type SignInMethodRaw = z.output<typeof schemaSignInMethod>;

/** What a row offers: link it, unlink it, or nothing. */
export type SignInMethodAction = 'link' | 'unlink' | 'none';

export interface SignInMethodView {
  provider: SignInProvider;
  linked: boolean;
  /** GitHub login without a leading "@", when the API sends one. */
  username?: string;
  action: SignInMethodAction;
  /** Linked and the account's only way to sign in. */
  isOnlyMethod: boolean;
}

/** Why removing a sign-in method failed. */
export type UnlinkFailure = 'lastMethod' | 'other';
