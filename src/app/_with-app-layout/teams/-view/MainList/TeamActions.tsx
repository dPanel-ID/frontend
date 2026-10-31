import { EyeIcon, Trash2Icon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import { useEmit } from '../../-model/events';

/** Open or delete a team, as icon buttons in the servers' style. */
export function TeamActions(props: {
  id: string;
  name: string;
  className?: string;
}) {
  const { className, id, name } = props;
  const emit = useEmit();
  const t = useDevetekTranslations();

  return (
    <div className={cn('flex items-center justify-end gap-1.5', className)}>
      <ActionIcon
        icon={EyeIcon}
        title={t('common.actions.details')}
        onClick={() =>
          emit('@teams/open--details', { orgId: id, orgName: name })
        }
      />
      <ActionIcon
        icon={Trash2Icon}
        title={t('common.actions.delete')}
        tone="danger"
        onClick={() => emit('@teams/org--delete', { id, name })}
      />
    </div>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}) {
  const { icon: Icon, onClick, title, tone = 'default' } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        tone === 'danger'
          ? 'text-red-500 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300'
          : 'text-primary/65 hover:text-primary',
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <Icon className="size-4" />
    </button>
  );
}
