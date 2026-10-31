import type { MouseEvent } from 'react';

import {
  BuildingIcon,
  EyeIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerCard } from '@/entities/load-balancer/rules/schema';

import { isMigrateOwnershipVisible } from '@/features/migrate-ownership-modal';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';

import { useEmit } from '../../-models/events';

interface LbActionsProps {
  loadBalancer: LoadBalancerCard;
  /** `icons` shows every action; `menu` shows details plus a "more" menu. */
  layout: 'icons' | 'menu';
  className?: string;
}

/** The action set of a load balancer, in the layout the view affords. */
export function LbActions(props: LbActionsProps) {
  const { className, layout, loadBalancer } = props;
  const t = useDevetekTranslations();
  const emit = useEmit();

  const stop = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  const openDetails = () => emit('@load-balancers/open--details', loadBalancer);
  const migrateOwnership = () =>
    emit('@load-balancers/open--migrate-ownership', loadBalancer);
  const remove = () => emit('@load-balancers/lb--delete', loadBalancer);

  if (layout === 'icons') {
    return (
      <div className={cn('flex items-center justify-end gap-1.5', className)}>
        <ActionIcon
          icon={EyeIcon}
          title={t('common.actions.details')}
          onClick={openDetails}
        />
        {isMigrateOwnershipVisible() && (
          <ActionIcon
            icon={BuildingIcon}
            title={t('common.actions.migrateOwnership')}
            onClick={migrateOwnership}
          />
        )}
        <ActionIcon
          icon={Trash2Icon}
          title={t('common.actions.delete')}
          tone="danger"
          onClick={remove}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-end gap-1.5', className)}>
      <ActionIcon
        icon={EyeIcon}
        title={t('common.actions.details')}
        onClick={openDetails}
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
          {isMigrateOwnershipVisible() && (
            <>
              <DropdownMenuItem onClick={migrateOwnership}>
                <BuildingIcon className="size-4" />
                {t('common.actions.migrateOwnership')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="destructive" onClick={remove}>
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
