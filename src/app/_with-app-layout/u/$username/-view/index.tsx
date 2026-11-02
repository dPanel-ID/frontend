import { CalendarIcon, UserIcon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useDevetekLocale } from '@/services/i18n';

import { initialsOf } from '@/entities/user/lib/profile';

import { ApiUser } from '@/shared/api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

interface ProfileViewProps {
  username: string;
}

/**
 * A user's public profile: who they are on dPanel, without contact details.
 * The page to grow into a profile for DevOps and developer teams.
 */
export default function ProfileView(props: ProfileViewProps) {
  const { username } = props;
  const locale = useDevetekLocale();
  const [response] = ApiUser.Username.$Username.useGet({ username });

  const profile =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const name = profile?.fullname?.trim() || profile?.username || username;
  const joined = profile?.created_at ? new Date(profile.created_at) : undefined;

  useMetaTags({ title: `${name} (@${username}) | dnocs` }, [name, username]);

  if (response.$status === 'failed') {
    return (
      <section className="rounded-2xl border bg-card p-8 text-center">
        <UserIcon className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-3 text-lg font-bold">No one goes by @{username}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the username, or the person may have changed it.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="h-24 bg-gradient-to-r from-sky-500/25 via-sky-400/10 to-transparent" />
      <div className="-mt-12 flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
        <Avatar className="size-24 shrink-0 border-4 border-card text-2xl">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={name} />
          )}
          <AvatarFallback className="bg-sky-500/15 font-bold text-sky-700 dark:text-sky-300">
            {initialsOf(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 pb-1">
          {profile ? (
            <>
              <h1 className="truncate text-2xl font-bold">{name}</h1>
              <p className="truncate text-sm text-muted-foreground">
                @{profile.username || username}
              </p>
            </>
          ) : (
            <>
              <Shimmer className="h-7 w-48" />
              <Shimmer className="mt-2 h-4 w-28" />
            </>
          )}
        </div>
      </div>

      {joined && !Number.isNaN(joined.getTime()) && (
        <div className="flex items-center gap-2 border-t px-5 py-3 text-sm text-muted-foreground sm:px-8">
          <CalendarIcon className="size-4" />
          Joined{' '}
          {joined.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      )}
    </section>
  );
}
