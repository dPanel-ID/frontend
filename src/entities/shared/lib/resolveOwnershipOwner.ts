import { personOf } from '@/entities/user/lib/person';
import type { PublicUserSource } from '@/entities/user/lib/person';

type OwnershipOwnerSource = {
  user?: PublicUserSource | null;
};

/**
 * The owner's display name. Never an email or a raw user ID: when the API
 * could not resolve the person, say so instead.
 */
export function resolveOwnershipOwner(source: OwnershipOwnerSource) {
  return personOf(source.user)?.name || 'Unknown owner';
}

/** What links the owner to their public profile, when the API resolved them. */
export function resolveOwnershipPerson(source: OwnershipOwnerSource) {
  const person = personOf(source.user);

  return {
    ownerUsername: person?.username,
    ownerAvatarUrl: person?.avatarUrl,
  };
}
