import type {
  ComponentType,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';

import {
  BuildingIcon,
  Clock3Icon,
  ExternalLinkIcon,
  EyeIcon,
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
import { LOAD_BALANCER_STATUS_METADATA } from '@/entities/load-balancer/ui/constants/state-metadata';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';
import { LoadBalancerFailure } from '@/entities/load-balancer/ui/LoadBalancerFailure';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

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
          <InlineInfo
            icon={UserIcon}
            value={<OwnerLink ownership={data.ownership} />}
          />
        </div>

        <LoadBalancerFailure
          domain={data.domain.fqdn}
          state={data.state}
          className="mt-4"
        />

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
        'overflow-hidden rounded-2xl border bg-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:border-sky-400/40',
        onClickDetails && 'cursor-pointer',
        data.state.status === 'failed' && 'border-red-400/40',
        data.state.status === 'progress' && 'border-sky-400/40',
        ['deleted', 'deleting', 'cancelled'].includes(data.state.status) &&
          'border-dashed border-amber-400/50',
      )}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <LoadBalancerIcon icon={webserver.icon} badge={RouteIcon} />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="min-w-0 truncate text-base font-bold text-primary">
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
              <StatusPill
                icon={stateMetadata.icon}
                label={t(stateMetadata.i18n.statusLabel)}
                color={`var(${stateMetadata.color})`}
              />
              <Badge variant="outline" className="font-mono">
                {kindLabel}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-primary/55">
              {data.description || t('page.loadBalancers.noDescription')}
            </p>
          </div>

          <div
            className="flex shrink-0 items-center gap-1"
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

        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-primary/55">
          <InlineInfo
            icon={ServerIcon}
            value={[
              data.gateway?.server.hostname ||
                t('page.loadBalancers.noGateway'),
              data.gateway?.address,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
          <InlineInfo
            icon={ShieldCheckIcon}
            value={t(webserver.i18n.brandName)}
          />
          <InlineInfo
            icon={data.ownership.team ? BuildingIcon : UserIcon}
            value={<OwnerLink ownership={data.ownership} preferTeam />}
          />
          <InlineInfo icon={Clock3Icon} value={lastUpdated} />
        </div>

        <div className="flex min-w-0 items-start gap-2 border-t border-dashed pt-3">
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary/45">
            <SignpostIcon className="size-3.5" />
            {routingSummary}
          </span>
          <RoutePreview configuration={data.configuration} />
        </div>
      </div>

      <LoadBalancerFailure
        domain={data.domain.fqdn}
        state={data.state}
        className="border-t border-dashed px-4 py-3"
      />
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
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
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
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
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
    <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border bg-background/60 px-2 py-1 font-mono text-xs">
      <span className="truncate font-semibold text-primary/60">{label}</span>
      <span aria-hidden className="text-primary/35">
        →
      </span>
      <span className="truncate font-semibold text-primary">{value}</span>
    </span>
  );
}

function MoreCount(props: { count: number }) {
  const { count } = props;
  const t = useDevetekTranslations();

  if (count <= 0) return null;

  return (
    <span className="text-xs font-semibold text-primary/45">
      {t('page.loadBalancers.moreRoutes', { count })}
    </span>
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
