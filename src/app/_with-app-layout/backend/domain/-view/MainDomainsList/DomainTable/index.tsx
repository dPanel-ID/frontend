import type {
  ComponentProps,
  ComponentType,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';

import dayjs from 'dayjs';
import {
  BuildingIcon,
  CalendarIcon,
  Clock3Icon,
  CloudIcon,
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  SignpostIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { DOMAIN_PROVIDER_BRANDS } from '@/entities/domain/ui/constants/provider';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import ActionPopover from '@/shared/presentation/molecules/ActionPopover';

import { useEmit } from '../../../-models/events';

import type { DomainTableData, DomainTableProps as Props } from './types';

type IconComponent = ComponentType<LucideProps>;

const gridColumns =
  'grid-cols-[minmax(280px,1.45fr)_minmax(190px,0.85fr)_minmax(220px,1fr)_minmax(180px,0.85fr)_88px]';

export default function DomainTable(props: Props) {
  const { data } = props;
  const t = useDevetekTranslations();

  return (
    <div className="pb-2 overflow-x-auto">
      <div className="min-w-[1040px] overflow-hidden rounded-xl border bg-card/30">
        <div
          className={cn(
            'grid items-center gap-4 border-b px-4 py-3 text-xs font-bold uppercase text-primary/60',
            gridColumns,
          )}
        >
          <p>{t('page.domain.table.headers.domain')}</p>
          <p>{t('page.domain.table.headers.provider')}</p>
          <p>{t('common.terms.ownership')}</p>
          <p>{t('page.domain.table.headers.lastModified')}</p>
          <p className="text-right">{t('common.terms.actions')}</p>
        </div>

        <div className="divide-y">
          {data.map((domain) => (
            <DomainRow key={domain.id} data={domain} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainRow(props: { data: DomainTableData }) {
  const { data } = props;

  const emit = useEmit();
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const ProviderIcon = DOMAIN_PROVIDER_BRANDS[data.provider].icon;
  const providerLabel = getProviderLabel(
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
      className="border-l-2 border-l-transparent bg-card/20 transition-colors hover:bg-card/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
    >
      <div className={cn('grid items-center gap-4 px-4 py-3', gridColumns)}>
        <div className="flex min-w-0 items-center gap-3">
          <ProviderMark icon={ProviderIcon} badge={GlobeIcon} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-primary">
              {domainName}
            </h3>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
              <InlineInfo icon={SignpostIcon} value={wildcardName} />
              <InlineInfo
                icon={FileTextIcon}
                value={data.description || t('page.domain.noDescription')}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <Badge variant="outline" className="max-w-full font-mono">
            <span className="truncate">{providerLabel}</span>
          </Badge>
          <p className="mt-1 truncate text-xs font-medium text-primary/50">
            {t('page.domain.managedDns')}
          </p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">
            {data.ownership.owner}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
            <InlineInfo
              icon={BuildingIcon}
              value={data.ownership.team || t('page.domain.personalScope')}
            />
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">
            {lastUpdated}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
            <InlineInfo
              icon={Clock3Icon}
              value={formatDate(data.timestamp.updated)}
            />
          </div>
        </div>

        <div
          className="flex justify-end gap-1"
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

      <div className="grid gap-3 border-t border-dashed px-4 py-3 lg:grid-cols-3">
        <DetailGroup
          icon={CloudIcon}
          title={t('page.domain.sections.provider')}
        >
          <DetailItem
            icon={CloudIcon}
            label={t('page.domain.table.headers.provider')}
            value={providerLabel}
          />
          <DetailItem
            icon={ShieldCheckIcon}
            label={t('page.domain.credentials')}
            value={t('page.domain.credentialsRedacted')}
          />
        </DetailGroup>

        <DetailGroup icon={GlobeIcon} title={t('page.domain.sections.dns')}>
          <DetailItem
            icon={GlobeIcon}
            label={t('page.domain.zoneApex')}
            value={domainName}
          />
          <DetailItem
            icon={SignpostIcon}
            label={t('page.domain.wildcardRecord')}
            value={wildcardName}
          />
          <DetailItem
            icon={FileTextIcon}
            label={t('common.terms.description')}
            value={data.description || t('page.domain.noDescription')}
          />
        </DetailGroup>

        <DetailGroup
          icon={BuildingIcon}
          title={t('page.domain.sections.ownership')}
        >
          <DetailItem
            icon={UserIcon}
            label={t('common.terms.owner')}
            value={data.ownership.owner}
          />
          <DetailItem
            icon={BuildingIcon}
            label={t('common.terms.team')}
            value={data.ownership.team || t('page.domain.personalScope')}
          />
          <DetailItem
            icon={CalendarIcon}
            label={t('common.terms.createdAt')}
            value={formatDate(data.timestamp.created)}
          />
        </DetailGroup>
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

function DetailGroup(props: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  const { icon: Icon, title, children } = props;

  return (
    <section className="min-w-0 rounded-lg border bg-background/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-primary/55">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function DetailItem(props: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Icon className="size-3.5 shrink-0 text-primary/45" />
      <span className="shrink-0 text-xs font-medium text-primary/45">
        {label}
      </span>
      <span className="truncate font-medium text-primary">{value || '-'}</span>
    </div>
  );
}

function InlineInfo(props: { icon: LucideIcon; value?: string }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}

function getProviderLabel(
  provider: DomainTableData['provider'],
  unknownLabel: string,
) {
  switch (provider) {
    case 'CloudFlare':
      return 'Cloudflare';

    case 'DigitalOcean':
      return 'DigitalOcean';

    default:
      return unknownLabel;
  }
}

function formatDate(date: Date) {
  return dayjs(date).format('YYYY/MM/DD HH:mm');
}
