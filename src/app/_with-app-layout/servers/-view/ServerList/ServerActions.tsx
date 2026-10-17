import type { MouseEvent } from 'react';

import {
  BuildingIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';

import type { ServerHandlers } from './useServerHandlers';

interface ServerActionsProps {
  handlers: ServerHandlers;
  /** `icons` shows every action; `menu` shows details plus a "more" menu. */
  layout: 'icons' | 'menu';
  className?: string;
}

/** The action set of a server, in the layout the surrounding view affords. */
export function ServerActions(props: ServerActionsProps) {
  const { className, handlers, layout } = props;
  const t = useDevetekTranslations();

  const stop = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  if (layout === 'icons') {
    return (
      <div className={cn('flex items-center justify-end gap-1.5', className)}>
        <ActionIcon
          icon={EyeIcon}
          title={t('common.actions.details')}
          onClick={handlers.openDetails}
        />
        {handlers.reinstall && (
          <ActionIcon
            icon={RotateCcwIcon}
            title={t('common.actions.reinstall')}
            onClick={handlers.reinstall}
          />
        )}
        {handlers.edit && (
          <ActionIcon
            icon={PencilIcon}
            title={t('common.actions.edit')}
            onClick={handlers.edit}
          />
        )}
        <ActionIcon
          icon={BuildingIcon}
          title={t('common.actions.migrateOwnership')}
          onClick={handlers.migrateOwnership}
        />
        <ActionIcon
          icon={Trash2Icon}
          title={t('common.actions.delete')}
          tone="danger"
          onClick={handlers.remove}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-end gap-1.5', className)}>
      <ActionIcon
        icon={EyeIcon}
        title={t('common.actions.details')}
        onClick={handlers.openDetails}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('common.actions.more')}
            title={t('common.actions.more')}
            onClick={stop}
            className="inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={stop}>
          {handlers.reinstall && (
            <DropdownMenuItem onClick={handlers.reinstall}>
              <RotateCcwIcon className="size-4" />
              {t('common.actions.reinstall')}
            </DropdownMenuItem>
          )}
          {handlers.edit && (
            <DropdownMenuItem onClick={handlers.edit}>
              <PencilIcon className="size-4" />
              {t('common.actions.edit')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handlers.migrateOwnership}>
            <BuildingIcon className="size-4" />
            {t('common.actions.migrateOwnership')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handlers.remove}>
            <Trash2Icon className="size-4" />
            {t('common.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}) {
  const { icon: Icon, title, tone = 'default', onClick } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        {
          'text-primary/65 hover:text-primary': tone === 'default',
          'text-red-500 hover:border-red-400/40 hover:bg-red-500/10 dark:text-red-300':
            tone === 'danger',
        },
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
