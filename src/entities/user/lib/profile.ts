/** Path of a user's public profile page. */
export function userProfilePath(username: string) {
  return `/u/${encodeURIComponent(username)}`;
}

/** Up to two initials, for an avatar without a picture. */
export function initialsOf(name: string) {
  const words = name
    .trim()
    .split(/[\s._@-]+/)
    .filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)] : words;

  return letters
    .map((word) => word?.[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}
