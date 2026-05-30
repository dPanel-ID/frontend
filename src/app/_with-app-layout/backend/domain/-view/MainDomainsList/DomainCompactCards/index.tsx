import type {
  ComponentProps,
  ComponentType,
  KeyboardEvent,
  MouseEvent,
} from 'react';

import {
  BuildingIcon,
  Clock3Icon,
  CloudIcon,
  EyeIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  SignpostIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { DomainCard } from '@/entities/domain/rules/schema';
import {
  DOMAIN_PROVIDER_BRANDS,
  getDomainProviderLabel,
} from '@/entities/domain/ui/constants/provider';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import ActionPopover from '@/shared/presentation/molecules/ActionPopover';

import { useEmit } from '../../../-models/events';

import type { DomainCompactCardsProps as Props } from './types';

type IconComponent = ComponentType<LucideProps>;

export default function DomainCompactCards(props: Props) {
  const { list } = props;

  return (
    <LayoutAutoGridList viewMode="grid">
      {list.map((item) => (
        <DomainCompactCard key={item.id} data={item} />
      ))}
    </LayoutAutoGridList>
  );
}

function DomainCompactCard(props: { data: DomainCard }) {
  const { data } = props;

  const emit = useEmit();
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const ProviderIcon = DOMAIN_PROVIDER_BRANDS[data.provider].icon;
  const providerLabel = getDomainProviderLabel(
    data.provider,
    t('page.domain.providerUnknown'),
  );
  const domainName = data.domain.hostname;
  const wildcardName = `*.${domainName}`;
  const lastUpdated = getDistanceFromNow(data.timestamp.updated, locale);
  const detailLabel = t('page.domain.openDetails', {
    domain: domainName,
  });

  type Actions = ComponentProps<typeof ActionPopover>['actions'];
  const actions: Actions = [
    {
      label: t('common.actions.migrateOwnership'),
      icon: BuildingIcon,
      onClick: () => emit('@domain-dns/open--migrate-ownership', data),
    },
    {
      variant: 'danger',
      label: t('common.actions.delete'),
      icon: Trash2Icon,
      onClick: () => emit('@domain-dns/domain--delete', data),
    },
  ];

  const handleOpenDetails = () => {
    emit('@domain-dns/open--details', data.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    handleOpenDetails();
  };

  const stopInteractivePropagation = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={detailLabel}
      className="rounded-lg border bg-card/45 p-4 transition-colors hover:border-primary/25 hover:bg-card/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-3">
        <ProviderMark icon={ProviderIcon} badge={GlobeIcon} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-base font-bold text-primary">
              {domainName}
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-primary/55">
            {data.description || t('page.domain.noDescription')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <InlineInfo icon={SignpostIcon} value={wildcardName} />
        <InlineInfo
          icon={UserIcon}
          value={data.ownership.team || data.ownership.owner}
        />
        <InlineInfo icon={Clock3Icon} value={lastUpdated} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <div className="min-w-0 flex-1">
          <Badge
            variant="outline"
            className="max-w-full justify-start font-mono"
          >
            <CloudIcon className="size-3" />
            <span className="truncate">{providerLabel}</span>
          </Badge>
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={stopInteractivePropagation}
          onKeyDown={stopInteractivePropagation}
        >
          <ActionButton
            icon={EyeIcon}
            label={t('common.actions.details')}
            onClick={handleOpenDetails}
          />
          <ActionPopover actions={actions}>
            <Button
              size="icon-sm"
              buttonColor="secondary"
              buttonStyle="ghost"
              aria-label={t('common.actions.more')}
              title={t('common.actions.more')}
            >
              <MoreHorizontalIcon />
            </Button>
          </ActionPopover>
        </div>
      </div>
    </article>
  );
}

function ProviderMark(props: { icon: IconComponent; badge: LucideIcon }) {
  const { icon: Icon, badge: BadgeIcon } = props;

  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background/75">
      <Icon className="size-7" />
      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md border bg-card">
        <BadgeIcon className="size-3 text-primary/55" />
      </span>
    </div>
  );
}

function ActionButton(props: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  const { icon: Icon, label, onClick } = props;

  return (
    <Button
      size="icon-sm"
      buttonColor="secondary"
      buttonStyle="ghost"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Icon />
    </Button>
  );
}

function InlineInfo(props: { icon: LucideIcon; value?: string }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-primary/55">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}
