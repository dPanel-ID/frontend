import type { Ownership } from '@/entities/shared/rules/schema/common';

import { UserLink } from '../UserLink';

export interface OwnerLinkProps {
  ownership: Pick<
    Ownership,
    'owner' | 'ownerAvatarUrl' | 'ownerUsername' | 'team'
  >;
  /** Name the workspace instead when the resource belongs to one. */
  preferTeam?: boolean;
  className?: string;
}

/**
 * Who owns a resource: the person, linking to their profile, or with
 * `preferTeam` the workspace when there is one.
 */
export function OwnerLink(props: OwnerLinkProps) {
  const { className, ownership, preferTeam } = props;

  if (preferTeam && ownership.team) {
    return <span className={className}>{ownership.team}</span>;
  }

  return (
    <UserLink
      name={ownership.owner}
      username={ownership.ownerUsername}
      avatarUrl={ownership.ownerAvatarUrl}
      className={className}
    />
  );
}
