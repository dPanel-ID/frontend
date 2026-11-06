import { UserIcon, UsersIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

interface WorkspaceBadgeProps {
  /** "team" or "personal". */
  type?: string;
  /** The team's name. */
  name?: string;
  id?: string;
  className?: string;
}

/** Whether a resource lives in a team's workspace or its owner's own. */
export function WorkspaceBadge(props: WorkspaceBadgeProps) {
  const { className, id, name, type } = props;
  const t = useDevetekTranslations('page.adminResources.workspace');
  const isTeam = type === 'team';
  const Icon = isTeam ? UsersIcon : UserIcon;

  return (
    <span
      title={isTeam && id ? `${t('team')} · ${id}` : undefined}
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isTeam
          ? 'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300'
          : 'border-border bg-background text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        {isTeam ? `${t('team')} · ${name || t('unnamedTeam')}` : t('personal')}
      </span>
    </span>
  );
}
