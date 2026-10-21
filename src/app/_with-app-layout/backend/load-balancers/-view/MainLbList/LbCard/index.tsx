import type {
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
  ExternalLinkIcon,
  EyeIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  NetworkIcon,
  RouteIcon,
  ServerIcon,
  ShieldCheckIcon,
  SignpostIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { SchemaLoadBalancerParts } from '@/entities/load-balancer/rules/schema';
import { LOAD_BALANCER_FEATURES } from '@/entities/load-balancer/ui/constants/features';
import { LOAD_BALANCER_STATUS_METADATA } from '@/entities/load-balancer/ui/constants/state-metadata';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { excludeFalsy } from '@/shared/libs/browser/typeguards';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import IconEye from '@/shared/presentation/icons/Eye';
import IconEyeActive from '@/shared/presentation/icons/EyeActive';
import ActionPopover from '@/shared/presentation/molecules/ActionPopover';

import type { LbCardProps } from './types';

type L7RuleUpstream = SchemaLoadBalancerParts.L7RuleUpstream;
type LbConfiguration = LbCardProps['data']['configuration'];
type IconComponent = ComponentType<LucideProps>;

export default function LbCard(props: LbCardProps) {
  const {
    data,
    variant,
    onClickDetails,
    onClickDelete,
    onClickMigrateOwnership,
  } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const stateMetadata = LOAD_BALANCER_STATUS_METADATA[data.state.status];
  const webserver = LOAD_BALANCER_WEBSERVER_ENGINE[data.webserver.engine];
  const kindLabel = data.configuration.lbKind.toUpperCase();
  const routingSummary = getRoutingSummary(data.configuration, t);
  const lastUpdated = getDistanceFromNow(data.timestamp.updated, locale);
  const domainHref = `${data.domain.protocol}://${data.domain.fqdn}`;
  const detailLabel = t('page.loadBalancers.openDetails', {
    domain: data.domain.fqdn,
  });
  const isAnomalousStatus = !['ready', 'pending'].includes(data.state.status);
  const rowTone = cn({
    'border-l-red-500': data.state.status === 'failed',
    'border-l-orange-500': ['deleted', 'deleting', 'cancelled'].includes(
      data.state.status,
    ),
    'border-l-cyan-500': data.state.status === 'progress',
  });

  const actions = [
    {
      label: t('common.actions.details'),
      icon: IconEye,
      iconActive: IconEyeActive,
      onClick: onClickDetails,
    },
    !!onClickMigrateOwnership && {
      label: t('common.actions.migrateOwnership'),
      onClick: onClickMigrateOwnership,
    },
    !!onClickDelete && {
      variant: 'danger' as const,
      label: t('common.actions.delete'),
      icon: Trash2Icon,
      onClick: onClickDelete,
    },
  ].filter(excludeFalsy);

  const handleCardClick = () => {
    onClickDetails?.();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClickDetails) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClickDetails();
    }
  };

  const stopInteractivePropagation = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
  };

  if (variant === 'compact') {
    return (
      <article
        role={onClickDetails ? 'link' : undefined}
        tabIndex={onClickDetails ? 0 : undefined}
        aria-label={detailLabel}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={cn(
          'rounded-2xl border bg-card p-4 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
          onClickDetails && 'cursor-pointer',
          data.state.status === 'failed' && 'border-red-400/40',
          data.state.status === 'progress' && 'border-sky-400/40',
          isAnomalousStatus &&
            !['failed', 'progress'].includes(data.state.status) &&
            'border-dashed',
        )}
      >
        <div className="flex items-start gap-3">
          <LoadBalancerIcon icon={webserver.icon} badge={RouteIcon} />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-base font-bold text-primary">
                {data.domain.fqdn}
              </h3>
              <a
                href={domainHref}
                target="_blank"
                rel="noreferrer"
                aria-label={t('page.loadBalancers.openDomain', {
                  domain: data.domain.fqdn,
                })}
                title={t('page.loadBalancers.openDomain', {
                  domain: data.domain.fqdn,
                })}
                onClick={stopInteractivePropagation}
                onKeyDown={stopInteractivePropagation}
                className="shrink-0 text-primary/45 transition hover:text-primary"
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-primary/55">
              {data.description || t('page.loadBalancers.noDescription')}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <InlineInfo
            icon={ServerIcon}
            value={
              data.gateway?.server.hostname || t('page.loadBalancers.noGateway')
            }
          />
          <InlineInfo
            icon={NetworkIcon}
            value={`${kindLabel} - ${routingSummary}`}
          />
          <InlineInfo icon={UserIcon} value={data.ownership.owner} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <StatusPill
            icon={stateMetadata.icon}
            label={t(stateMetadata.i18n.statusLabel)}
            color={`var(${stateMetadata.color})`}
          />
          <div
            className="flex items-center gap-1"
            onClick={stopInteractivePropagation}
            onKeyDown={stopInteractivePropagation}
          >
            <ActionButton
              icon={EyeIcon}
              label={t('common.actions.details')}
              onClick={onClickDetails}
            />
            <ActionPopover actions={actions.slice(1)}>
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

  return (
    <article
      role={onClickDetails ? 'link' : undefined}
      tabIndex={onClickDetails ? 0 : undefined}
      aria-label={detailLabel}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        'border-l-2 border-l-transparent bg-card/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary hover:bg-card/50',
        onClickDetails && 'cursor-pointer',
        rowTone,
      )}
    >
      <div className="grid grid-cols-[minmax(280px,1.45fr)_minmax(220px,1fr)_minmax(220px,1fr)_minmax(180px,0.85fr)_88px] items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <LoadBalancerIcon icon={webserver.icon} badge={RouteIcon} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-bold text-primary">
                {data.domain.fqdn}
              </h3>
              <a
                href={domainHref}
                target="_blank"
                rel="noreferrer"
                aria-label={t('page.loadBalancers.openDomain', {
                  domain: data.domain.fqdn,
                })}
                title={t('page.loadBalancers.openDomain', {
                  domain: data.domain.fqdn,
                })}
                onClick={stopInteractivePropagation}
                onKeyDown={stopInteractivePropagation}
                className="shrink-0 text-primary/45 transition hover:text-primary"
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
              <InlineInfo
                icon={ShieldCheckIcon}
                value={t(webserver.i18n.brandName)}
              />
              <InlineInfo
                icon={UserIcon}
                value={data.ownership.team || data.ownership.owner}
              />
              <InlineInfo icon={Clock3Icon} value={lastUpdated} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">
            {data.gateway?.server.hostname || t('page.loadBalancers.noGateway')}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
            <InlineInfo
              icon={GlobeIcon}
              value={data.gateway?.address || t('page.loadBalancers.noAddress')}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {kindLabel}
            </Badge>
            <p className="truncate text-sm font-bold text-primary">
              {routingSummary}
            </p>
          </div>
          <p className="mt-1 truncate text-xs font-medium text-primary/50">
            {getPrimaryRouteSummary(data.configuration, t)}
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <StatusPill
            icon={stateMetadata.icon}
            label={t(stateMetadata.i18n.statusLabel)}
            color={`var(${stateMetadata.color})`}
          />
        </div>

        <div
          className="flex justify-end gap-1"
          onClick={stopInteractivePropagation}
          onKeyDown={stopInteractivePropagation}
        >
          <ActionButton
            icon={EyeIcon}
            label={t('common.actions.details')}
            onClick={onClickDetails}
          />
          <ActionPopover actions={actions.slice(1)}>
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

      <div className="grid gap-3 border-t border-dashed px-4 py-3 lg:grid-cols-[1.35fr_1fr_1fr]">
        <DetailGroup
          icon={SignpostIcon}
          title={t('page.loadBalancers.sections.routingRules')}
        >
          <RoutePreview configuration={data.configuration} />
        </DetailGroup>

        <DetailGroup icon={NetworkIcon} title={t('common.terms.configuration')}>
          <DetailItem
            icon={ShieldCheckIcon}
            label={t('common.terms.engine')}
            value={t(webserver.i18n.brandName)}
          />
          <DetailItem
            icon={RouteIcon}
            label={t('page.loadBalancers.lbKind')}
            value={kindLabel}
          />
          <FeatureStrip features={Array.from(data.features)} />
        </DetailGroup>

        <DetailGroup icon={BuildingIcon} title={t('common.terms.ownership')}>
          <DetailItem
            icon={UserIcon}
            label={t('common.terms.owner')}
            value={data.ownership.owner}
          />
          <DetailItem
            icon={BuildingIcon}
            label={t('common.terms.team')}
            value={data.ownership.team || t('page.loadBalancers.personalScope')}
          />
          <DetailItem
            icon={CalendarIcon}
            label={t('common.terms.createdAt')}
            value={formatDate(data.timestamp.created)}
          />
          <DetailItem
            icon={Clock3Icon}
            label={t('common.terms.lastUpdated')}
            value={formatDate(data.timestamp.updated)}
          />
        </DetailGroup>
      </div>

      {data.state.message && (
        <div className="border-t border-dashed px-4 py-3">
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">
              {t('page.loadBalancers.statusMessage')}:{' '}
            </span>
            <span className="break-words">{data.state.message}</span>
          </div>
        </div>
      )}
    </article>
  );
}

function RoutePreview(props: { configuration: LbConfiguration }) {
  const { configuration } = props;
  const t = useDevetekTranslations();

  if (configuration.lbKind === 'l4') {
    if (configuration.upstreams.length < 1) {
      return <EmptyDetail>{t('page.loadBalancers.noRules')}</EmptyDetail>;
    }

    return (
      <div className="grid gap-1.5">
        {configuration.upstreams.slice(0, 3).map((upstream, index) => (
          <RouteLine
            key={`${upstream.address}:${upstream.port}:${index}`}
            label={t('page.loadBalancers.destination')}
            value={`${upstream.address}:${upstream.port}`}
          />
        ))}
        <MoreCount count={configuration.upstreams.length - 3} />
      </div>
    );
  }

  if (configuration.rules.length < 1) {
    return <EmptyDetail>{t('page.loadBalancers.noRules')}</EmptyDetail>;
  }

  return (
    <div className="grid gap-1.5">
      {configuration.rules.slice(0, 3).map((rule, index) => (
        <RouteLine
          key={`${rule.upstream.type}:${getRulePath(rule.upstream)}:${index}`}
          label={getRulePath(rule.upstream)}
          value={formatRuleTarget(rule.upstream, t)}
        />
      ))}
      <MoreCount count={configuration.rules.length - 3} />
    </div>
  );
}

function FeatureStrip(props: {
  features: Array<keyof typeof LOAD_BALANCER_FEATURES>;
}) {
  const { features } = props;
  const t = useDevetekTranslations();

  if (features.length < 1) {
    return <EmptyDetail>{t('page.loadBalancers.noFeatures')}</EmptyDetail>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {features.map((feature) => {
        const metadata = LOAD_BALANCER_FEATURES[feature];

        return (
          <span
            key={feature}
            title={t(metadata.i18n.label)}
            className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-semibold text-primary/70"
          >
            <img src={metadata.logoSrc} alt="" className="size-3.5" />
            {t(metadata.i18n.label)}
          </span>
        );
      })}
    </div>
  );
}

function LoadBalancerIcon(props: {
  icon: IconComponent;
  badge: IconComponent;
}) {
  const { badge: BadgeIcon, icon: Icon } = props;

  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background">
      <Icon className="size-6 text-primary/75" />
      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md border bg-card text-primary">
        <BadgeIcon className="size-3" />
      </span>
    </span>
  );
}

function StatusPill(props: {
  icon: IconComponent;
  label: string;
  color: string;
}) {
  const { color, icon: Icon, label } = props;

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{
        borderColor: color,
        color,
      }}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function ActionButton(props: {
  icon: IconComponent;
  label: string;
  onClick?: () => void;
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
  children: ReactNode;
  icon: IconComponent;
  title: string;
}) {
  const { children, icon: Icon, title } = props;

  return (
    <section className="min-w-0 rounded-lg border bg-background/65 p-3">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-primary/55">
        <Icon className="size-3.5" />
        {title}
      </h4>
      <div className="grid gap-1.5">{children}</div>
    </section>
  );
}

function DetailItem(props: {
  icon: IconComponent;
  label: string;
  value?: ReactNode;
}) {
  const { icon: Icon, label, value } = props;
  const t = useDevetekTranslations();

  return (
    <div className="grid grid-cols-[1.05fr_minmax(0,1.35fr)] items-start gap-2 text-sm">
      <span className="flex min-w-0 items-center gap-1.5 font-medium text-primary/50">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="min-w-0 break-words font-semibold text-primary">
        {value || t('common.terms.unknown')}
      </span>
    </div>
  );
}

function InlineInfo(props: { icon: IconComponent; value?: ReactNode }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <span className="flex min-w-0 items-center gap-1">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}

function RouteLine(props: { label: string; value: string }) {
  const { label, value } = props;

  return (
    <div className="grid grid-cols-[minmax(92px,0.7fr)_minmax(0,1.3fr)] gap-2 rounded-md border bg-card/45 px-2 py-1.5 text-sm">
      <code className="truncate font-semibold text-primary/60">{label}</code>
      <code className="truncate font-semibold text-primary">{value}</code>
    </div>
  );
}

function MoreCount(props: { count: number }) {
  const { count } = props;
  const t = useDevetekTranslations();

  if (count <= 0) return null;

  return (
    <p className="text-xs font-semibold text-primary/45">
      {t('page.loadBalancers.moreRoutes', { count })}
    </p>
  );
}

function EmptyDetail(props: { children: ReactNode }) {
  const { children } = props;

  return <p className="text-sm italic text-primary/45">{children}</p>;
}

function getRoutingSummary(
  configuration: LbConfiguration,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (configuration.lbKind === 'l4') {
    return t('page.loadBalancers.xUpstream', {
      length: configuration.upstreams.length,
    });
  }

  return t('page.loadBalancers.xRules', {
    length: configuration.rules.length,
  });
}

function getPrimaryRouteSummary(
  configuration: LbConfiguration,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (configuration.lbKind === 'l4') {
    const first = configuration.upstreams[0];
    if (!first) return t('page.loadBalancers.noRules');
    return `${first.address}:${first.port}`;
  }

  const first = configuration.rules[0]?.upstream;
  if (!first) return t('page.loadBalancers.noRules');
  return `${getRulePath(first)} -> ${formatRuleTarget(first, t)}`;
}

function getRulePath(rule: L7RuleUpstream) {
  return rule.matchingPath || '/';
}

function formatRuleTarget(
  rule: L7RuleUpstream,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (rule.type === 'proxy-pass-app') {
    return t('page.loadBalancers.targetApplication', {
      id: rule.target.applicationId,
    });
  }

  if (rule.type === 'static-file') {
    return rule.filePath.join(', ') || t('page.loadBalancers.staticFiles');
  }

  const target = rule.backendTarget[0];
  if (!target) return t('page.loadBalancers.noRules');

  const protocol = target.address.protocol
    ? `${target.address.protocol}://`
    : '';
  const port = target.port > 0 ? `:${target.port}` : '';

  return `${protocol}${target.address.hostname}${port}`;
}

function formatDate(value?: Date | string) {
  if (!value) return '';
  return dayjs(value).format('YYYY/MM/DD HH:mm');
}
