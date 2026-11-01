import {
  ArrowRightIcon,
  Globe2Icon,
  Layers3Icon,
  ListTreeIcon,
  NetworkIcon,
  RouteIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';

import type { IconComponent, UpstreamDraft } from '../-lib/types';
import { getRouteCount, getUpstreamDrafts } from '../-lib/upstream-drafts';

import { DetailSurface, EmptyInline } from './-presentation/surfaces';

export function GraphTab(props: { details: LoadBalancerDetails }) {
  const { details } = props;
  const t = useDevetekTranslations();
  const upstreams = getUpstreamDrafts(details);
  const gatewayLabel =
    details.gateway?.server.hostname ?? t('page.loadBalancers.noGateway');
  const routeCount = getRouteCount(details);

  return (
    <div className="grid gap-4">
      <DetailSurface
        icon={RouteIcon}
        title={t('page.loadBalancersDetail.graph.title')}
        description={t('page.loadBalancersDetail.graph.description')}
      >
        <div className="overflow-hidden rounded-lg border bg-background">
          <div
            className="p-4"
            aria-label={t('page.loadBalancersDetail.graph.requestPath')}
          >
            {/* Left to right from tablet width up, top to bottom on phones;
                never wider than the page. */}
            <div className="grid items-stretch gap-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.25fr)]">
              <GraphNode
                icon={Globe2Icon}
                label={t('page.loadBalancersDetail.graph.domain')}
                value={details.domain.fqdn}
                description={details.domain.protocol.toUpperCase()}
                href={`${details.domain.protocol}://${details.domain.fqdn}`}
                meta={t('page.loadBalancersDetail.graph.entryPoint')}
                tone="source"
              />
              <GraphConnector label={details.domain.protocol.toUpperCase()} />
              <GraphNode
                icon={NetworkIcon}
                label={t('common.terms.loadBalancer')}
                value={details.description || details.domain.fqdn}
                description={details.configuration.lbKind.toUpperCase()}
                meta={t('page.loadBalancersDetail.graph.edgeRuntime')}
                tone="edge"
              />
              <GraphConnector
                label={details.configuration.lbKind.toUpperCase()}
              />
              <GraphNode
                icon={ServerIcon}
                label={t('page.loadBalancersDetail.graph.gateway')}
                value={gatewayLabel}
                description={
                  details.gateway?.address ?? t('common.terms.unknown')
                }
                href={
                  details.gateway
                    ? `/servers/${details.gateway.server.id}`
                    : undefined
                }
                meta={
                  details.gateway
                    ? t('page.loadBalancersDetail.graph.gatewayLinked')
                    : t('common.terms.unknown')
                }
                tone="machine"
              />
              <GraphConnector
                label={t('page.loadBalancersDetail.graph.routeFanout')}
              />
              <TargetCluster routeCount={routeCount} upstreams={upstreams} />
            </div>
          </div>
        </div>
      </DetailSurface>

      <DetailSurface
        icon={ListTreeIcon}
        title={t('page.loadBalancersDetail.graph.routeMap')}
        description={t('page.loadBalancersDetail.graph.routeMapDesc')}
      >
        {upstreams.length > 0 ? (
          <div className="grid gap-3">
            {upstreams.map((upstream) => (
              <TopologyRoute key={upstream.id} upstream={upstream} />
            ))}
          </div>
        ) : (
          <EmptyInline>{t('page.loadBalancers.noRules')}</EmptyInline>
        )}
      </DetailSurface>
    </div>
  );
}

export function GraphConnector(props: { label: string }) {
  const { label } = props;

  return (
    <div
      className="flex items-center justify-center gap-2 py-1 text-muted-foreground md:px-1 md:py-0"
      aria-hidden="true"
    >
      <span className="hidden h-px w-3 border-t border-dashed md:block" />
      <span className="flex items-center gap-1.5 md:grid md:justify-items-center md:gap-1">
        <span className="flex size-7 items-center justify-center rounded-full border bg-card">
          <ArrowRightIcon className="size-3.5 rotate-90 md:rotate-0" />
        </span>
        <span className="max-w-16 truncate text-[10px] font-bold uppercase leading-none">
          {label}
        </span>
      </span>
      <span className="hidden h-px w-3 border-t border-dashed md:block" />
    </div>
  );
}

export function GraphNode(props: {
  description: string;
  href?: string;
  icon: IconComponent;
  label: string;
  meta?: string;
  tone?: 'source' | 'edge' | 'machine';
  value: string;
}) {
  const {
    description,
    href,
    icon: Icon,
    label,
    meta,
    tone = 'edge',
    value,
  } = props;
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md border',
            tone === 'source' &&
              'border-blue-500/30 bg-blue-500/10 text-blue-500',
            tone === 'edge' &&
              'border-cyan-500/30 bg-cyan-500/10 text-cyan-500',
            tone === 'machine' &&
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <span className="truncate text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </span>
      <span className="block break-words text-sm font-bold leading-snug">
        {value}
      </span>
      <span
        className="block truncate text-xs font-medium text-muted-foreground"
        title={meta}
      >
        {[description, meta].filter(Boolean).join(' · ')}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-3">
      {content}
    </div>
  );
}

export function TargetCluster(props: {
  routeCount: number;
  upstreams: UpstreamDraft[];
}) {
  const { routeCount, upstreams } = props;
  const t = useDevetekTranslations();
  const visibleUpstreams = upstreams.slice(0, 4);

  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-3">
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-500">
          <Layers3Icon className="size-3.5" />
        </span>
        <span className="truncate text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {t('page.loadBalancersDetail.graph.targets')}
        </span>
      </span>
      <span className="text-sm font-bold">
        {t('page.loadBalancersDetail.graph.targetCount', {
          count: upstreams.length,
        })}
        <span className="font-medium text-muted-foreground">
          {' · '}
          {t('page.loadBalancersDetail.graph.routeCount', {
            count: routeCount,
          })}
        </span>
      </span>

      <div className="mt-1 grid gap-1.5">
        {visibleUpstreams.length > 0 ? (
          visibleUpstreams.map((upstream) => (
            <TargetPreview key={upstream.id} upstream={upstream} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-3 text-sm font-semibold text-muted-foreground">
            {t('page.loadBalancersDetail.graph.emptyTargets')}
          </div>
        )}
        {upstreams.length > visibleUpstreams.length ? (
          <Badge variant="secondary" className="w-fit">
            {t('page.loadBalancers.moreRoutes', {
              count: upstreams.length - visibleUpstreams.length,
            })}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function TargetPreview(props: { upstream: UpstreamDraft }) {
  const { upstream } = props;
  const t = useDevetekTranslations();
  const kindLabel =
    upstream.kind === 'application'
      ? t('page.loadBalancersDetail.upstreams.kind.application')
      : upstream.kind === 'static'
        ? t('page.loadBalancersDetail.upstreams.kind.static')
        : t('page.loadBalancersDetail.upstreams.kind.address');

  return (
    <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Badge variant="outline">{kindLabel}</Badge>
        <span className="truncate text-xs font-bold text-muted-foreground">
          {upstream.match}
        </span>
      </div>
      {upstream.href ? (
        <a
          href={upstream.href}
          className="truncate font-semibold underline underline-offset-2 hover:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {upstream.destination}
        </a>
      ) : (
        <code className="truncate text-sm font-semibold">
          {upstream.destination}
        </code>
      )}
    </div>
  );
}

export function TopologyRoute(props: { upstream: UpstreamDraft }) {
  const { upstream } = props;
  const t = useDevetekTranslations();
  const kindLabel =
    upstream.kind === 'application'
      ? t('page.loadBalancersDetail.upstreams.kind.application')
      : upstream.kind === 'static'
        ? t('page.loadBalancersDetail.upstreams.kind.static')
        : t('page.loadBalancersDetail.upstreams.kind.address');

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="grid gap-3 lg:grid-cols-[112px_minmax(140px,0.35fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full border bg-card text-sm font-bold">
            {String(upstream.order).padStart(2, '0')}
          </span>
          <Badge variant="secondary">{kindLabel}</Badge>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
            {t('page.loadBalancersDetail.upstreams.match')}
          </p>
          <code className="break-all text-sm font-semibold">
            {upstream.match}
          </code>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
              {t('page.loadBalancersDetail.upstreams.destination')}
            </p>
            {upstream.href ? (
              <a
                href={upstream.href}
                className="break-all text-sm font-semibold underline underline-offset-2 hover:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                {upstream.destination}
              </a>
            ) : (
              <code className="break-all text-sm font-semibold">
                {upstream.destination}
              </code>
            )}
          </div>
          {upstream.port ? (
            <Badge variant="outline">
              {t('common.terms.port')} {upstream.port}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
