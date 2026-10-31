import type { MouseEvent } from 'react';

import {
  BuildingIcon,
  CopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ServerIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { isMigrateOwnershipVisible } from '@/features/migrate-ownership-modal';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';

import type { SshKeyHandlers } from './useSshKeyHandlers';

interface SshKeyActionsProps {
  handlers: SshKeyHandlers;
  /** `icons` shows every action; `menu` shows details plus a "more" menu. */
  layout: 'icons' | 'menu';
  className?: string;
}

/** The action set of a key, in the layout the surrounding view affords. */
export function SshKeyActions(props: SshKeyActionsProps) {
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
        <ActionIcon
          icon={CopyIcon}
          title={t('page.sshKeys.actions.copyPublicKey')}
          onClick={handlers.copyPublicKey}
        />
        <ActionIcon
          icon={ServerIcon}
          title={t('page.sshKeys.actions.useOnServer')}
          onClick={handlers.createServer}
        />
        {isMigrateOwnershipVisible() && (
          <ActionIcon
            icon={BuildingIcon}
            title={t('common.actions.migrateOwnership')}
            onClick={handlers.migrateOwnership}
          />
        )}
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
          <DropdownMenuItem onClick={handlers.copyPublicKey}>
            <CopyIcon className="size-4" />
            {t('page.sshKeys.actions.copyPublicKey')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlers.createServer}>
            <ServerIcon className="size-4" />
            {t('page.sshKeys.actions.useOnServer')}
          </DropdownMenuItem>
          {isMigrateOwnershipVisible() && (
            <>
              <DropdownMenuItem onClick={handlers.migrateOwnership}>
                <BuildingIcon className="size-4" />
                {t('common.actions.migrateOwnership')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="destructive" onClick={handlers.remove}>
            <Trash2Icon className="size-4" />
            {t('common.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ActionIconProps {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}

function ActionIcon(props: ActionIconProps) {
  const { icon: Icon, onClick, title, tone = 'default' } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        tone === 'danger'
          ? 'text-red-500/80 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-500'
          : 'text-primary/65 hover:bg-border/40 hover:text-primary',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
