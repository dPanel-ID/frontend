type OwnershipOwnerSource = {
  owner?: number | string | null;
  user_id?: number | string | null;
  user?: {
    email?: string | null;
    fullname?: string | null;
    username?: string | null;
  } | null;
};

export function resolveOwnershipOwner(source: OwnershipOwnerSource) {
  const userOwner = [
    source.user?.fullname,
    source.user?.username,
    source.user?.email,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value));

  return (
    userOwner ||
    (source.user_id != null ? String(source.user_id) : undefined) ||
    (source.owner != null ? String(source.owner) : undefined) ||
    'Unknown owner'
  );
}
