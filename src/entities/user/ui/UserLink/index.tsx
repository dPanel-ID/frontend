import { Link } from '@tanstack/react-router';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';

import { initialsOf } from '../../lib/profile';

export interface UserLinkProps {
  /** What to show: the display name, else username, else an ID. */
  name: string;
  /** Links to /u/{username} when known. */
  username?: string;
  avatarUrl?: string;
  className?: string;
}

/**
 * A person who did something, such as running a build: avatar and name,
 * linking to their public profile when the API resolved them.
 */
export function UserLink(props: UserLinkProps) {
  const { avatarUrl, className, name, username } = props;

  const content = (
    <>
      <Avatar className="size-4 shrink-0 text-[8px]">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-sky-500/15 font-semibold text-sky-700 dark:text-sky-300">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </>
  );

  const classes = cn(
    'inline-flex min-w-0 max-w-full items-center gap-1.5',
    className,
  );

  if (!username) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link
      to="/u/$username"
      params={{ username }}
      title={`@${username}`}
      className={cn(classes, 'hover:underline')}
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </Link>
  );
}
