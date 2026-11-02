/** The public user the API attaches to anything someone did. */
export interface PublicUserSource {
  fullname?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

/** A person to show with UserLink: never an email or a raw ID. */
export interface Person {
  name: string;
  username?: string;
  avatarUrl?: string;
}

/**
 * The person behind a public user: display name, else username. Undefined
 * when the API could not resolve anyone, so callers can say so instead of
 * showing an ID or an email.
 */
export function personOf(user?: PublicUserSource | null): Person | undefined {
  const username = user?.username?.trim() || undefined;
  const name = user?.fullname?.trim() || username;

  if (!name) return undefined;

  return {
    name,
    username,
    avatarUrl: user?.avatar_url?.trim() || undefined,
  };
}
