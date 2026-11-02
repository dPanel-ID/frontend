import { useDevetekTranslations } from '@/services/i18n';

import { UserLink } from '@/entities/user/ui/UserLink';


import { cn } from '@/shared/libs/tailwind/cn';

import type { SchemaServerParts } from '../../rules/schema';

export interface ServerCreatorProps {
  creator?: SchemaServerParts.Creator;
  /** Drop the "Created by" prefix where a label already says it. */
  nameOnly?: boolean;
  className?: string;
}

/**
 * Who created a server, so a resource that breaks policy can be traced to a
 * person: avatar and name, linking to their public profile.
 */
export function ServerCreator(props: ServerCreatorProps) {
  const { className, creator, nameOnly } = props;
  const t = useDevetekTranslations('page.servers.creator');

  if (!creator) return null;

  const person = (
    <UserLink
      name={creator.name}
      username={creator.username}
      avatarUrl={creator.avatarUrl}
    />
  );

  if (nameOnly) {
    return (
      <span className={cn('inline-flex min-w-0', className)}>{person}</span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex min-w-0 max-w-full items-center gap-1',
        className,
      )}
      title={t('createdBy', { name: creator.name })}
    >
      <span className="shrink-0">{t('label')}</span>
      {person}
    </span>
  );
}
