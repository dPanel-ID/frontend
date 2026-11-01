import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/presentation/atoms/Avatar';

import type { SchemaServerParts } from '../../rules/schema';

export interface ServerCreatorProps {
  creator?: SchemaServerParts.Creator;
  /** Show the email beside the name, not only in the tooltip. */
  showEmail?: boolean;
  /** Drop the "Created by" prefix where a label already says it. */
  nameOnly?: boolean;
  className?: string;
}

/**
 * Who created a server, so a resource that breaks policy can be traced to a
 * person. The email is always in the tooltip, as display names can repeat.
 */
export function ServerCreator(props: ServerCreatorProps) {
  const { className, creator, nameOnly, showEmail } = props;
  const t = useDevetekTranslations('page.servers.creator');

  if (!creator) return null;

  const showEmailText =
    showEmail && creator.email && creator.email !== creator.name;

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-full items-center gap-1.5',
        className,
      )}
      title={
        creator.email && creator.email !== creator.name
          ? t('tooltip', { name: creator.name, email: creator.email })
          : t('createdBy', { name: creator.name })
      }
    >
      <Avatar className="size-4 shrink-0 text-[8px]">
        {creator.avatarUrl && (
          <AvatarImage src={creator.avatarUrl} alt={creator.name} />
        )}
        <AvatarFallback className="bg-sky-500/15 font-semibold text-sky-700 dark:text-sky-300">
          {initialsOf(creator.name)}
        </AvatarFallback>
      </Avatar>
      {/* On narrow screens the email moves under the name, so neither one
          runs off the screen. */}
      <span className="min-w-0 sm:truncate">
        <span className="block truncate sm:inline">
          {nameOnly ? creator.name : t('createdBy', { name: creator.name })}
        </span>
        {showEmailText && (
          <span className="block truncate text-muted-foreground sm:inline">
            <span className="hidden sm:inline"> · </span>
            {creator.email}
          </span>
        )}
      </span>
    </span>
  );
}

function initialsOf(name: string) {
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
