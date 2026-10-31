import { cn } from '@/shared/libs/tailwind/cn';

/** A team's mark: its initials on a tile, as servers show their provider. */
export function TeamMark(props: {
  name?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { className, name, size = 'md' } = props;

  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 font-bold text-violet-700 dark:text-violet-300',
        size === 'md' ? 'size-12 text-base' : 'size-9 text-xs',
        className,
      )}
    >
      {teamInitials(name)}
    </span>
  );
}

export function teamInitials(name?: string | null) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length > 1 ? [words[0], words.at(-1)] : [words[0]];
  return letters
    .map((word) => word?.[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}
