import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CloudIcon,
  FileTextIcon,
  Globe2Icon,
  Layers3Icon,
  ListTreeIcon,
  NetworkIcon,
  PlusIcon,
  RefreshCwIcon,
  RouteIcon,
  SaveIcon,
  SearchIcon,
  ServerIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TerminalSquareIcon,
  TrashIcon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import type { ApplicationCard } from '@/entities/application/rules/schema';
import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';
import { normalizeLoadBalancerPathMatchForPayload } from '@/entities/load-balancer/lib/path-match';
import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';
import { LOAD_BALANCER_FEATURES } from '@/entities/load-balancer/ui/constants/features';
import { LOAD_BALANCER_STATUS_METADATA } from '@/entities/load-balancer/ui/constants/state-metadata';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';

import { ApiApplication, ApiLoadBalancer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import type { RecipeRule } from '@/shared/api/load-balancer.create';
import { useAdapter } from '@/shared/libs/api-client';
import type { Response } from '@/shared/libs/api-client/rules/types';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Switch } from '@/shared/presentation/atoms/Switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/presentation/atoms/Tabs';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

export const Route = createFileRoute(
  '/_with-app-layout/backend/load-balancers/$id/',
)({
  head: () => ({
    meta: [{ title: 'Load balancer | dnocs' }],
  }),
  component: LoadBalancerDetailPage,
});

type IconComponent = ComponentType<LucideProps>;
type LogContext = {
  filePath?: string;
  queryErrors?: string[];
};
type LogDateRange = {
  from: string;
  to: string;
};
type LogMode = 'all' | 'errors';
type LoadBalancerTab = 'graph' | 'upstreams' | 'logs' | 'config';
type AddBackendMode = 'application' | 'address';
type JsonRecord = Record<string, unknown>;
type RawLoadBalancerDetailsDto = DTOs.RouterV1 | DTOs.LoadBalancerV2;

const LOAD_BALANCER_LOG_LIMIT = 10;
const DEFAULT_LOG_LOOKBACK_MINUTES = 10;

interface AccessLogEntry {
  bytes?: number;
  durationMs?: number;
  host: string;
  id: string;
  method: string;
  protocol: string;
  path: string;
  remoteIp: string;
  status: number;
  timestamp?: string;
  userAgent: string;
  raw: string;
}

interface UpstreamDraft {
  applicationId?: string;
  destination: string;
  href?: string;
  id: string;
  kind: 'application' | 'address' | 'static';
  match: string;
  order: number;
  port: string;
  protocol: string;
}

interface RuntimeConfigDraft {
  cloudflareProxied: boolean;
  protocol: string;
  sslEnabled: boolean;
}

function LoadBalancerDetailPage() {
  const { id } = Route.useParams();
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [logDateRange, setLogDateRange] = useState<LogDateRange>(
    getDefaultLogDateRange,
  );

  const [responseDetails, refreshDetails] = ApiLoadBalancer.Detail.$Id.useGet({
    loadBalancerId: id,
  });

  const details = useAdapter(responseDetails, (raw) =>
    AdapterLoadBalancerFromDto.toLoadBalancerDetails(raw).unwrap(),
  );

  const [responseAccessLog, refreshAccessLog] = ApiLoadBalancer.Logs.$Id.useGet(
    {
      loadBalancerId: id,
      limit: LOAD_BALANCER_LOG_LIMIT,
      timeGte: toDateTimeQueryParam(logDateRange.from),
      timeLt: toDateTimeQueryParam(logDateRange.to),
      options: {
        skip: responseDetails.$status !== 'success',
      },
    },
  );
  const logContext = getLogContext(responseAccessLog);

  const accessLogs = useAdapter(
    responseAccessLog,
    parseLoadBalancerLogResponse,
  );
  const errorLogs = selectAccessErrors(accessLogs);

  const refreshAll = () => {
    refreshDetails();
    refreshAccessLog();
  };

  const goBack = () => {
    navigate({
      to: '/backend/load-balancers',
      search: {
        page: 1,
        viewMode: 'auto',
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.loadBalancers'),
                url: '/backend/load-balancers',
              },
            ]}
          />
        }
        title={
          details.$status === 'success'
            ? details.description || details.domain.fqdn
            : t('page.loadBalancersDetail.headerTitle')
        }
        description={
          details.$status === 'success'
            ? details.domain.fqdn
            : t('page.loadBalancersDetail.headerDesc')
        }
        rightAppend={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={goBack}
            >
              <ArrowLeftIcon />
              {t('common.actions.back')}
            </Button>
            <HeaderHelpAction
              icon={FileTextIcon}
              label={t('page.loadBalancers.docs')}
              href={LINK__DOCUMENTATION}
            />
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={refreshAll}
              aria-label={t('common.actions.refresh')}
              title={t('common.actions.refresh')}
            >
              <RefreshCwIcon />
              <span className="hidden sm:inline">
                {t('common.actions.refresh')}
              </span>
            </Button>
          </div>
        }
      />

      {details.$status === 'loading' || details.$status === 'initial' ? (
        <LoadingState />
      ) : null}

      {details.$status === 'failed' ? (
        <StateSurface
          icon={AlertTriangleIcon}
          title={t('page.loadBalancersDetail.state.failedTitle')}
          description={details.error.message}
          action={
            <Button onClick={() => refreshDetails()}>
              <RefreshCwIcon />
              {t('common.actions.retry')}
            </Button>
          }
        />
      ) : null}

      {details.$status === 'success' ? (
        <>
          <Overview details={details} />
          <DetailTabs
            details={details}
            rawDetails={
              responseDetails.$status === 'success'
                ? responseDetails
                : undefined
            }
            logContext={logContext}
            dateRange={logDateRange}
            accessLogs={accessLogs}
            errorLogs={errorLogs}
            onDateRangeChange={setLogDateRange}
            onDetailsRefresh={refreshDetails}
            onResetDateRange={() => setLogDateRange(getDefaultLogDateRange())}
            onRefreshAccess={refreshAccessLog}
          />
        </>
      ) : null}
    </div>
  );
}

function Overview(props: { details: LoadBalancerDetails }) {
  const { details } = props;
  const t = useDevetekTranslations();
  const status = LOAD_BALANCER_STATUS_METADATA[details.state.status];
  const webserver = LOAD_BALANCER_WEBSERVER_ENGINE[details.webserver.engine];
  const WebserverIcon = webserver.icon;
  const featureLabels = Array.from(details.features).map((feature) => {
    const metadata = LOAD_BALANCER_FEATURES[feature];
    return t(metadata.i18n.label);
  });

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-lg border bg-card">
              <WebserverIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-3xl font-bold tracking-normal">
                {details.domain.fqdn}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {details.description || t('page.loadBalancers.noDescription')}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill
              icon={status.icon}
              label={t(status.i18n.statusLabel)}
              color={`var(${status.color})`}
            />
            <Badge variant="outline" className="font-mono">
              {details.configuration.lbKind.toUpperCase()}
            </Badge>
            <Badge variant="secondary">{t(webserver.i18n.brandName)}</Badge>
            {featureLabels.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm lg:min-w-80">
          <InlineMetric
            icon={RouteIcon}
            label={t('page.loadBalancersDetail.metrics.routes')}
            value={getRouteCount(details)}
          />
          <InlineMetric
            icon={ServerIcon}
            label={t('page.loadBalancersDetail.metrics.gateway')}
            value={
              details.gateway?.server.hostname ||
              t('page.loadBalancers.noGateway')
            }
          />
          <InlineMetric
            icon={Clock3Icon}
            label={t('common.terms.lastUpdated')}
            value={formatDate(details.timestamp.updated)}
          />
        </div>
      </div>

      {details.state.message ? (
        <div className="border-t bg-destructive/5 px-5 py-3 text-sm text-destructive">
          <span className="font-bold">
            {t('page.loadBalancers.statusMessage')}:
          </span>{' '}
          {details.state.message}
        </div>
      ) : null}
    </Card>
  );
}

function DetailTabs(props: {
  accessLogs: Response<AccessLogEntry[]>;
  dateRange: LogDateRange;
  details: LoadBalancerDetails;
  errorLogs: Response<AccessLogEntry[]>;
  logContext?: LogContext;
  rawDetails?: RawLoadBalancerDetailsDto;
  onDateRangeChange: (dateRange: LogDateRange) => void;
  onDetailsRefresh: () => void;
  onResetDateRange: () => void;
  onRefreshAccess: () => void;
}) {
  const {
    accessLogs,
    dateRange,
    details,
    errorLogs,
    logContext,
    onDateRangeChange,
    onDetailsRefresh,
    onResetDateRange,
    onRefreshAccess,
    rawDetails,
  } = props;
  const t = useDevetekTranslations();
  const [activeTab, setActiveTab] = useState<LoadBalancerTab>('graph');
  const tabItems: Array<{
    description: string;
    icon: IconComponent;
    label: string;
    value: LoadBalancerTab;
  }> = [
    {
      value: 'graph',
      icon: RouteIcon,
      label: t('page.loadBalancersDetail.tabs.graph'),
      description: t('page.loadBalancersDetail.tabs.graphDesc'),
    },
    {
      value: 'upstreams',
      icon: ListTreeIcon,
      label: t('page.loadBalancersDetail.tabs.upstreams'),
      description: t('page.loadBalancersDetail.tabs.upstreamsDesc'),
    },
    {
      value: 'logs',
      icon: TerminalSquareIcon,
      label: t('page.loadBalancersDetail.tabs.logs'),
      description: t('page.loadBalancersDetail.tabs.logsDesc'),
    },
    {
      value: 'config',
      icon: SlidersHorizontalIcon,
      label: t('page.loadBalancersDetail.tabs.config'),
      description: t('page.loadBalancersDetail.tabs.configDesc'),
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as LoadBalancerTab)}
      className="grid gap-5"
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-card p-1 sm:grid-cols-2 xl:grid-cols-4">
        {tabItems.map((tab) => (
          <DetailTabTrigger key={tab.value} {...tab} />
        ))}
      </TabsList>

      <TabsContent value="graph" className="mt-0">
        <GraphTab details={details} />
      </TabsContent>
      <TabsContent value="upstreams" className="mt-0">
        <UpstreamsTab details={details} onSaved={onDetailsRefresh} />
      </TabsContent>
      <TabsContent value="logs" className="mt-0">
        <LogsTab
          accessLogs={accessLogs}
          dateRange={dateRange}
          errorLogs={errorLogs}
          logContext={logContext}
          onDateRangeChange={onDateRangeChange}
          onRefreshAccess={onRefreshAccess}
          onResetDateRange={onResetDateRange}
        />
      </TabsContent>
      <TabsContent value="config" className="mt-0">
        <ConfigTab
          details={details}
          rawDetails={rawDetails}
          onSaved={onDetailsRefresh}
        />
      </TabsContent>
    </Tabs>
  );
}

function DetailTabTrigger(props: {
  description: string;
  icon: IconComponent;
  label: string;
  value: LoadBalancerTab;
}) {
  const { description, icon: Icon, label, value } = props;

  return (
    <TabsTrigger
      value={value}
      className="h-auto justify-start gap-3 px-3 py-3 text-left data-[state=active]:shadow-none"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-bold">{label}</span>
        <span className="block truncate text-xs font-medium text-muted-foreground">
          {description}
        </span>
      </span>
    </TabsTrigger>
  );
}

function GraphTab(props: { details: LoadBalancerDetails }) {
  const { details } = props;
  const t = useDevetekTranslations();
  const upstreams = getUpstreamDrafts(details);
  const gatewayLabel =
    details.gateway?.server.hostname ?? t('page.loadBalancers.noGateway');
  const routeCount = getRouteCount(details);

  return (
    <div className="grid gap-5">
      <DetailSurface
        icon={RouteIcon}
        title={t('page.loadBalancersDetail.graph.title')}
        description={t('page.loadBalancersDetail.graph.description')}
      >
        <div className="overflow-hidden rounded-lg border bg-background">
          <div
            className="overflow-x-auto p-4"
            aria-label={t('page.loadBalancersDetail.graph.requestPath')}
          >
            <div className="grid min-w-[1040px] grid-cols-[220px_72px_220px_72px_220px_72px_minmax(260px,1fr)] items-stretch">
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

          <div className="grid gap-3 border-t bg-card/40 p-4 md:grid-cols-3">
            <GraphMetric
              icon={RouteIcon}
              label={t('page.loadBalancersDetail.graph.activeRoutes')}
              value={routeCount}
              description={details.configuration.lbKind.toUpperCase()}
            />
            <GraphMetric
              icon={Layers3Icon}
              label={t('page.loadBalancersDetail.graph.targets')}
              value={upstreams.length}
              description={t('page.loadBalancersDetail.graph.targetSummary')}
            />
            <GraphMetric
              icon={ServerIcon}
              label={t('page.loadBalancersDetail.graph.gateway')}
              value={gatewayLabel}
              description={
                details.gateway?.address ?? t('common.terms.unknown')
              }
            />
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

function GraphConnector(props: { label: string }) {
  const { label } = props;

  return (
    <div
      className="flex items-center justify-center px-2 text-muted-foreground"
      aria-hidden="true"
    >
      <span className="h-px flex-1 border-t border-dashed" />
      <span className="mx-1 grid min-w-10 justify-items-center gap-1">
        <span className="flex size-8 items-center justify-center rounded-full border bg-card">
          <ArrowRightIcon className="size-4" />
        </span>
        <span className="max-w-16 truncate text-[10px] font-bold uppercase leading-none">
          {label}
        </span>
      </span>
      <span className="h-px flex-1 border-t border-dashed" />
    </div>
  );
}

function GraphNode(props: {
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
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-lg border',
          tone === 'source' &&
            'border-blue-500/30 bg-blue-500/10 text-blue-500',
          tone === 'edge' && 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500',
          tone === 'machine' &&
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-normal text-muted-foreground">
          {label}
        </span>
        <span className="mt-1 block truncate text-xl font-bold">{value}</span>
        <span className="mt-1 block truncate text-sm font-semibold text-muted-foreground">
          {description}
        </span>
        {meta ? (
          <span className="mt-3 inline-flex max-w-full rounded-full border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground">
            <span className="truncate">{meta}</span>
          </span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex min-w-0 gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 gap-3 rounded-lg border bg-card p-4">
      {content}
    </div>
  );
}

function TargetCluster(props: {
  routeCount: number;
  upstreams: UpstreamDraft[];
}) {
  const { routeCount, upstreams } = props;
  const t = useDevetekTranslations();
  const visibleUpstreams = upstreams.slice(0, 4);

  return (
    <div className="flex min-w-0 flex-col rounded-lg border bg-card p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-500">
          <Layers3Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
            {t('page.loadBalancersDetail.graph.targets')}
          </p>
          <p className="mt-1 truncate text-xl font-bold">
            {t('page.loadBalancersDetail.graph.targetCount', {
              count: upstreams.length,
            })}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {t('page.loadBalancersDetail.graph.routeCount', {
              count: routeCount,
            })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
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

function TargetPreview(props: { upstream: UpstreamDraft }) {
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

function GraphMetric(props: {
  description: string;
  icon: IconComponent;
  label: string;
  value: ReactNode;
}) {
  const { description, icon: Icon, label, value } = props;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-normal text-muted-foreground">
          {label}
        </span>
        <span className="mt-1 block truncate text-lg font-bold">{value}</span>
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {description}
        </span>
      </span>
    </div>
  );
}

function TopologyRoute(props: { upstream: UpstreamDraft }) {
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

function UpstreamsTab(props: {
  details: LoadBalancerDetails;
  onSaved: () => void;
}) {
  const { details, onSaved } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const sourceRows = useMemo(() => getUpstreamDrafts(details), [details]);
  const [draftRows, setDraftRows] = useState(sourceRows);
  const [baselineRows, setBaselineRows] = useState(sourceRows);
  const [isAddingBackend, setIsAddingBackend] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftRows(sourceRows);
    setBaselineRows(sourceRows);
  }, [sourceRows]);

  const hasDraftChanges =
    serializeUpstreamDraftRows(draftRows) !==
    serializeUpstreamDraftRows(baselineRows);
  const canSaveDraft =
    hasDraftChanges && areUpstreamDraftRowsValid(details, draftRows);

  const removeRow = (rowId: string) => {
    setDraftRows((rows) =>
      rows
        .filter((row) => row.id !== rowId)
        .map((row, rowIndex) => ({ ...row, order: rowIndex + 1 })),
    );
  };

  const moveRow = (rowId: string, direction: -1 | 1) => {
    setDraftRows((rows) => {
      const currentIndex = rows.findIndex((row) => row.id === rowId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= rows.length) {
        return rows;
      }

      const nextRows = [...rows];
      const currentRow = nextRows[currentIndex];
      const targetRow = nextRows[nextIndex];

      if (!currentRow || !targetRow) return rows;

      nextRows[currentIndex] = targetRow;
      nextRows[nextIndex] = currentRow;

      return normalizeDraftRowOrder(nextRows);
    });
  };

  const addRow = (row: Omit<UpstreamDraft, 'id' | 'order'>) => {
    setDraftRows((rows) => [
      ...rows,
      {
        ...row,
        id: createDraftBackendId(),
        order: rows.length + 1,
      },
    ]);
    setIsAddingBackend(false);
  };

  const resetDraft = () => {
    setDraftRows(baselineRows);
  };

  const saveDraft = async () => {
    if (!canSaveDraft || isSaving) return;

    setIsSaving(true);
    const normalizedRows = normalizeDraftRowOrder(draftRows);

    try {
      const response = await ApiLoadBalancer.Update.$Id.doPost({
        loadBalancerId: details.id,
        advanceMode: true,
        ...toLoadBalancerUpdatePayload(details, normalizedRows),
      });

      if (response.$status === 'success') {
        setDraftRows(normalizedRows);
        setBaselineRows(normalizedRows);
        openToaster({
          variant: 'success',
          message: t('page.loadBalancersDetail.upstreams.saveSuccess'),
        });
        onSaved();
        return;
      }

      openToaster({
        variant: 'error',
        title: t('page.loadBalancersDetail.upstreams.saveFailed'),
        message: response.error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailSurface
      icon={ListTreeIcon}
      title={t('page.loadBalancersDetail.upstreams.title')}
      description={t('page.loadBalancersDetail.upstreams.description')}
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => setIsAddingBackend((value) => !value)}
            aria-expanded={isAddingBackend}
          >
            <PlusIcon />
            {t('page.loadBalancersDetail.upstreams.addBackend')}
          </Button>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!hasDraftChanges || isSaving}
            onClick={resetDraft}
          >
            <RefreshCwIcon />
            {t('page.loadBalancersDetail.upstreams.resetDraft')}
          </Button>
          <Button
            size="sm"
            disabled={!canSaveDraft || isSaving}
            onClick={saveDraft}
            title={t('page.loadBalancersDetail.upstreams.saveTitle')}
          >
            {isSaving ? <Spinner /> : <SaveIcon />}
            {t('common.actions.save')}
          </Button>
        </div>
      }
    >
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        {t('page.loadBalancersDetail.upstreams.backendRequired')}
      </div>

      {isAddingBackend ? (
        <AddBackendDraftPanel
          lbKind={details.configuration.lbKind}
          onAdd={addRow}
          onCancel={() => setIsAddingBackend(false)}
        />
      ) : null}

      {draftRows.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {draftRows.map((row, index) => (
            <UpstreamEditorCard
              key={row.id}
              index={index}
              row={row}
              totalRows={draftRows.length}
              onMove={moveRow}
              onRemove={removeRow}
            />
          ))}
        </div>
      ) : (
        <EmptyInline>
          {t('page.loadBalancersDetail.upstreams.empty')}
        </EmptyInline>
      )}
    </DetailSurface>
  );
}

function AddBackendDraftPanel(props: {
  lbKind: LoadBalancerDetails['configuration']['lbKind'];
  onAdd: (row: Omit<UpstreamDraft, 'id' | 'order'>) => void;
  onCancel: () => void;
}) {
  const { lbKind, onAdd, onCancel } = props;
  const t = useDevetekTranslations();
  const [mode, setMode] = useState<AddBackendMode>('application');
  const [match, setMatch] = useState(lbKind === 'l4' ? 'TCP' : '/*');
  const [address, setAddress] = useState('localhost');
  const [port, setPort] = useState('80');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationCard>();
  const [responseApplications] = ApiApplication.Find.useGet({
    page: 1,
    limit: 12,
    name: applicationSearch,
  });
  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));
  const normalizedPort = Number(port);
  const canAddAddress =
    address.trim().length > 0 &&
    Number.isInteger(normalizedPort) &&
    normalizedPort >= 1 &&
    normalizedPort <= 65_535;
  const canAdd =
    mode === 'application' ? Boolean(selectedApplication) : canAddAddress;

  const addBackend = () => {
    if (mode === 'application') {
      if (!selectedApplication) return;

      onAdd({
        applicationId: selectedApplication.id,
        destination: formatApplicationBackendDestination(
          selectedApplication.identity.name,
          selectedApplication.id,
        ),
        href: `/applications/${selectedApplication.id}`,
        kind: 'application',
        match,
        port: getApplicationCardRuntimePort(selectedApplication),
        protocol: 'http',
      });
      return;
    }

    if (!canAddAddress) return;

    onAdd({
      destination: address.trim(),
      kind: 'address',
      match,
      port: String(normalizedPort),
      protocol: lbKind === 'l4' ? 'tcp' : 'http',
    });
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border bg-background">
      <div className="border-b p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h4 className="text-base font-bold">
              {t('page.loadBalancersDetail.upstreams.addBackendTitle')}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t('page.loadBalancersDetail.upstreams.addBackendDesc')}
            </p>
          </div>
          <div
            className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1"
            aria-label={t('page.loadBalancersDetail.upstreams.backendType')}
          >
            <BackendModeButton
              active={mode === 'application'}
              label={t('page.loadBalancersDetail.upstreams.kind.application')}
              onClick={() => setMode('application')}
            />
            <BackendModeButton
              active={mode === 'address'}
              label={t('page.loadBalancersDetail.upstreams.kind.address')}
              onClick={() => setMode('address')}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <label className="grid gap-1.5 text-sm font-semibold">
          <span>{t('page.loadBalancersDetail.upstreams.match')}</span>
          <Input
            inputSize="sm"
            className="font-mono"
            value={match}
            placeholder={t(
              'page.loadBalancersDetail.upstreams.matchPlaceholder',
            )}
            onChange={(event) => setMatch(event.currentTarget.value)}
          />
        </label>

        {mode === 'application' ? (
          <div className="grid gap-2">
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.application')}</span>
              <span className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  inputSize="sm"
                  className="pl-9"
                  value={applicationSearch}
                  placeholder={t(
                    'page.loadBalancersDetail.upstreams.searchApplications',
                  )}
                  onChange={(event) =>
                    setApplicationSearch(event.currentTarget.value)
                  }
                />
              </span>
            </label>

            {applications.$status === 'loading' ? (
              <BackendPickerState>
                <Spinner />
                <span>{t('page.loadBalancersCreate.loading')}</span>
              </BackendPickerState>
            ) : null}

            {applications.$status === 'failed' ? (
              <BackendPickerState>
                {t('page.loadBalancersDetail.upstreams.applicationLoadFailed')}
              </BackendPickerState>
            ) : null}

            {applications.$status === 'success' ? (
              applications.list.length > 0 ? (
                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                  {applications.list.map((application) => (
                    <ApplicationBackendOption
                      key={application.id}
                      application={application}
                      selected={selectedApplication?.id === application.id}
                      onSelect={() => setSelectedApplication(application)}
                    />
                  ))}
                </div>
              ) : (
                <BackendPickerState>
                  {t('page.loadBalancersDetail.upstreams.noApplications')}
                </BackendPickerState>
              )
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.address')}</span>
              <Input
                inputSize="sm"
                className="font-mono"
                value={address}
                placeholder={t(
                  'page.loadBalancersDetail.upstreams.addressPlaceholder',
                )}
                onChange={(event) => setAddress(event.currentTarget.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              <span>{t('common.terms.port')}</span>
              <Input
                inputSize="sm"
                type="number"
                min={1}
                max={65_535}
                className="font-mono"
                value={port}
                placeholder={t(
                  'page.loadBalancersDetail.upstreams.portPlaceholder',
                )}
                onChange={(event) => setPort(event.currentTarget.value)}
              />
            </label>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onCancel}
          >
            {t('common.actions.cancel')}
          </Button>
          <Button disabled={!canAdd} onClick={addBackend}>
            <PlusIcon />
            {t('page.loadBalancersDetail.upstreams.addToDraft')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BackendModeButton(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const { active, label, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-bold transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-background text-primary shadow-xs'
          : 'text-muted-foreground hover:bg-background/70 hover:text-primary',
      )}
    >
      {label}
    </button>
  );
}

function ApplicationBackendOption(props: {
  application: ApplicationCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { application, onSelect, selected } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-left transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">
          {application.identity.name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {application.additionalInfo.repoUrl ?? application.id}
        </span>
      </span>
      {selected ? <CheckCircle2Icon className="size-5 text-primary" /> : null}
    </button>
  );
}

function BackendPickerState(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed bg-card p-4 text-sm font-semibold text-muted-foreground">
      {props.children}
    </div>
  );
}

function UpstreamEditorCard(props: {
  index: number;
  onMove: (rowId: string, direction: -1 | 1) => void;
  onRemove: (rowId: string) => void;
  row: UpstreamDraft;
  totalRows: number;
}) {
  const { index, onMove, onRemove, row, totalRows } = props;
  const t = useDevetekTranslations();
  const applicationId =
    row.kind === 'application' ? getApplicationIdFromDraftRow(row) : '';
  const [responseApplication] = ApiApplication.Detail.$Id.useGet({
    applicationId,
    options: {
      skip: row.kind !== 'application' || applicationId.length === 0,
    },
  });
  const display = getUpstreamDraftDisplay(row, responseApplication);
  const kindLabel =
    row.kind === 'application'
      ? t('page.loadBalancersDetail.upstreams.kind.application')
      : row.kind === 'static'
        ? t('page.loadBalancersDetail.upstreams.kind.static')
        : t('page.loadBalancersDetail.upstreams.kind.address');

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {t('common.terms.order')} #{String(index + 1).padStart(2, '0')}
              </Badge>
              <Badge variant="secondary">{kindLabel}</Badge>
            </div>
            <p className="mt-2 truncate text-sm font-semibold">
              {display.destination}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={index === 0}
            onClick={() => onMove(row.id, -1)}
            aria-label={t('page.loadBalancersDetail.upstreams.moveUp')}
            title={t('page.loadBalancersDetail.upstreams.moveUp')}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={index === totalRows - 1}
            onClick={() => onMove(row.id, 1)}
            aria-label={t('page.loadBalancersDetail.upstreams.moveDown')}
            title={t('page.loadBalancersDetail.upstreams.moveDown')}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            danger
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => onRemove(row.id)}
            aria-label={t('page.loadBalancersDetail.upstreams.removeBackend')}
            title={t('page.loadBalancersDetail.upstreams.removeBackend')}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(140px,0.35fr)_minmax(0,1fr)_140px]">
        <ReadOnlyRouteValue
          label={t('page.loadBalancersDetail.upstreams.match')}
          value={row.match}
          mono
        />
        <ReadOnlyRouteValue
          label={t('page.loadBalancersDetail.upstreams.destination')}
          value={display.destination}
          href={row.href}
          mono={row.kind !== 'application'}
        />
        <ReadOnlyRouteValue
          label={t('common.terms.port')}
          value={
            display.port ||
            (responseApplication.$status === 'loading'
              ? t('page.loadBalancersCreate.loading')
              : t('common.terms.unavailable'))
          }
          mono
        />
      </div>
    </div>
  );
}

function ReadOnlyRouteValue(props: {
  href?: string;
  label: string;
  mono?: boolean;
  value: string;
}) {
  const { href, label, mono, value } = props;

  const valueClassName = cn(
    'flex min-h-10 w-full items-center rounded-lg border bg-card px-3 py-2 text-sm font-semibold text-primary',
    mono && 'font-mono',
  );

  return (
    <div className="grid gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      {href ? (
        <a
          href={href}
          aria-label={`${label}: ${value}`}
          title={value}
          className={cn(
            valueClassName,
            'underline underline-offset-2 hover:opacity-70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className="truncate">{value}</span>
        </a>
      ) : (
        <span
          aria-label={`${label}: ${value}`}
          title={value}
          className={valueClassName}
        >
          <span className="truncate">{value}</span>
        </span>
      )}
    </div>
  );
}

function LogsTab(props: {
  accessLogs: Response<AccessLogEntry[]>;
  dateRange: LogDateRange;
  errorLogs: Response<AccessLogEntry[]>;
  logContext?: LogContext;
  onDateRangeChange: (dateRange: LogDateRange) => void;
  onRefreshAccess: () => void;
  onResetDateRange: () => void;
}) {
  const {
    accessLogs,
    dateRange,
    errorLogs,
    logContext,
    onDateRangeChange,
    onRefreshAccess,
    onResetDateRange,
  } = props;
  const t = useDevetekTranslations();
  const [mode, setMode] = useState<LogMode>('all');
  const visibleLogs =
    mode === 'errors' && errorLogs.$status === 'success'
      ? errorLogs
      : accessLogs;
  const totalCount = getResponseRows(accessLogs).length;
  const errorCount = getResponseRows(errorLogs).length;

  return (
    <DetailSurface
      icon={TerminalSquareIcon}
      title={t('page.loadBalancersDetail.sections.logs')}
      description={t('page.loadBalancersDetail.sections.logsDesc')}
    >
      <LogDateRangeFilter
        dateRange={dateRange}
        limit={LOAD_BALANCER_LOG_LIMIT}
        onChange={onDateRangeChange}
        onRefresh={onRefreshAccess}
        onReset={onResetDateRange}
      />
      <RequestLogPanel
        activeMode={mode}
        errorCount={errorCount}
        filePath={logContext?.filePath}
        logs={visibleLogs}
        onModeChange={setMode}
        onRefresh={onRefreshAccess}
        totalCount={totalCount}
      />
    </DetailSurface>
  );
}

function LogDateRangeFilter(props: {
  dateRange: LogDateRange;
  limit: number;
  onChange: (dateRange: LogDateRange) => void;
  onRefresh: () => void;
  onReset: () => void;
}) {
  const { dateRange, limit, onChange, onRefresh, onReset } = props;
  const t = useDevetekTranslations();

  return (
    <div className="mb-4 rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h4 className="font-bold">
            {t('page.loadBalancersDetail.logs.filterTitle')}
          </h4>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t('page.loadBalancersDetail.logs.filterDesc')}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit shrink-0">
          {t('page.loadBalancersDetail.logs.limitLabel', { count: limit })}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(210px,1fr)_minmax(210px,1fr)_auto_auto] xl:items-end">
        <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
          <span>{t('page.loadBalancersDetail.logs.fromLabel')}</span>
          <Input
            type="datetime-local"
            inputSize="sm"
            value={dateRange.from}
            max={dateRange.to || undefined}
            aria-label={t('page.loadBalancersDetail.logs.fromLabel')}
            onChange={(event) =>
              onChange({ ...dateRange, from: event.target.value })
            }
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
          <span>{t('page.loadBalancersDetail.logs.toLabel')}</span>
          <Input
            type="datetime-local"
            inputSize="sm"
            value={dateRange.to}
            min={dateRange.from || undefined}
            aria-label={t('page.loadBalancersDetail.logs.toLabel')}
            onChange={(event) =>
              onChange({ ...dateRange, to: event.target.value })
            }
          />
        </label>
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={onRefresh}
          aria-label={t('common.actions.refresh')}
          title={t('common.actions.refresh')}
          className="w-full justify-center whitespace-nowrap xl:w-auto"
        >
          <RefreshCwIcon />
          {t('common.actions.refresh')}
        </Button>
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={onReset}
          className="w-full justify-center whitespace-nowrap xl:w-auto"
        >
          {t('page.loadBalancersDetail.logs.resetRange')}
        </Button>
      </div>
    </div>
  );
}

function RequestLogPanel(props: {
  activeMode: LogMode;
  errorCount: number;
  logs: Response<AccessLogEntry[]>;
  filePath?: string;
  onModeChange: (mode: LogMode) => void;
  onRefresh: () => void;
  totalCount: number;
}) {
  const {
    activeMode,
    errorCount,
    filePath,
    logs,
    onModeChange,
    onRefresh,
    totalCount,
  } = props;
  const t = useDevetekTranslations();
  const logStatus = logs.$status;
  const rows = getResponseRows(logs);
  const emptyMessage =
    activeMode === 'errors'
      ? t('page.loadBalancersDetail.logs.emptyError')
      : t('page.loadBalancersDetail.logs.emptyAccess');

  return (
    <LogPanelFrame
      description={
        filePath ?? t('page.loadBalancersDetail.logs.telemetrySource')
      }
      errorCount={errorCount}
      mode={activeMode}
      onModeChange={onModeChange}
      onRefresh={onRefresh}
      totalCount={totalCount}
    >
      {logStatus === 'loading' || logStatus === 'initial' ? (
        <LogLoading />
      ) : null}
      {logStatus === 'failed' ? (
        <LogFailed message={logs.error.message} />
      ) : null}
      {logStatus === 'success' && rows.length < 1 ? (
        <EmptyInline>{emptyMessage}</EmptyInline>
      ) : null}
      {logStatus === 'success' && rows.length > 0 ? (
        <LogTable logs={rows} />
      ) : null}
    </LogPanelFrame>
  );
}

function LogTable(props: { logs: AccessLogEntry[] }) {
  const { logs } = props;
  const t = useDevetekTranslations();

  return (
    <div className="max-h-[640px] overflow-auto">
      <div className="min-w-[920px]">
        <div className="grid grid-cols-[148px_80px_84px_minmax(220px,1fr)_150px_96px_86px] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-bold uppercase text-muted-foreground">
          <span>{t('page.loadBalancersDetail.logs.table.time')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.method')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.status')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.request')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.remote')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.duration')}</span>
          <span>{t('page.loadBalancersDetail.logs.table.size')}</span>
        </div>
        <div className="divide-y">
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[148px_80px_84px_minmax(220px,1fr)_150px_96px_86px] gap-3 px-3 py-2.5 text-sm"
            >
              <span className="whitespace-nowrap text-muted-foreground">
                {formatTime(log.timestamp)}
              </span>
              <span className="font-mono font-bold">{log.method}</span>
              <StatusCode status={log.status} />
              <span className="min-w-0">
                <span className="block truncate font-mono font-semibold">
                  {log.path}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {log.host}
                  {log.protocol && log.protocol !== '-'
                    ? ` · ${log.protocol}`
                    : ''}
                </span>
              </span>
              <span className="truncate font-mono text-muted-foreground">
                {log.remoteIp}
              </span>
              <span className="font-mono text-muted-foreground">
                {formatDuration(log.durationMs)}
              </span>
              <span className="font-mono text-muted-foreground">
                {formatBytes(log.bytes)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigTab(props: {
  details: LoadBalancerDetails;
  onSaved: () => void;
  rawDetails?: RawLoadBalancerDetailsDto;
}) {
  const { details, onSaved, rawDetails } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const sourceConfig = useMemo(
    () => getRuntimeConfigDraft(rawDetails, details),
    [details, rawDetails],
  );
  const [draft, setDraft] = useState(sourceConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(sourceConfig);
  }, [sourceConfig]);

  const webserver = LOAD_BALANCER_WEBSERVER_ENGINE[details.webserver.engine];
  const hasDraftChanges =
    serializeRuntimeConfigDraft(draft) !==
    serializeRuntimeConfigDraft(sourceConfig);

  const saveConfig = async () => {
    if (!hasDraftChanges || isSaving) return;

    setIsSaving(true);

    try {
      const response = await ApiLoadBalancer.Update.$Id.doPost({
        loadBalancerId: details.id,
        advanceMode: true,
        name: details.description,
        config: toLoadBalancerConfigPayload(rawDetails, details, draft),
      });

      if (response.$status === 'success') {
        openToaster({
          variant: 'success',
          message: t('page.loadBalancersDetail.config.saveSuccess'),
        });
        onSaved();
        return;
      }

      openToaster({
        variant: 'error',
        title: t('page.loadBalancersDetail.config.saveFailed'),
        message: response.error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailSurface
      icon={Settings2Icon}
      title={t('page.loadBalancersDetail.sections.configuration')}
      description={t('page.loadBalancersDetail.sections.configurationDesc')}
      action={
        <Button
          disabled={!hasDraftChanges || isSaving}
          onClick={saveConfig}
          title={t('page.loadBalancersDetail.config.saveTitle')}
        >
          {isSaving ? <Spinner /> : <SaveIcon />}
          {t('common.actions.save')}
        </Button>
      }
    >
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        {t('page.loadBalancersDetail.config.backendRequired')}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <div className="grid gap-3">
          <ConfigToggle
            checked={draft.sslEnabled}
            description={t('page.loadBalancersDetail.config.sslDesc')}
            icon={ShieldCheckIcon}
            label={t('page.loadBalancersDetail.config.ssl')}
            onCheckedChange={(sslEnabled) =>
              setDraft((current) => ({ ...current, sslEnabled }))
            }
          />
          <ConfigToggle
            checked={draft.cloudflareProxied}
            description={t('page.loadBalancersDetail.config.cloudflareDesc')}
            icon={CloudIcon}
            label={t('page.loadBalancersDetail.config.cloudflare')}
            onCheckedChange={(cloudflareProxied) =>
              setDraft((current) => ({ ...current, cloudflareProxied }))
            }
          />
        </div>

        <div className="grid gap-3 rounded-lg border bg-background p-4">
          <ConfigInfoRow
            icon={ShieldCheckIcon}
            label={t('common.terms.engine')}
            value={t(webserver.i18n.brandName)}
          />
          <ConfigInfoRow
            icon={RouteIcon}
            label={t('page.loadBalancers.lbKind')}
            value={details.configuration.lbKind.toUpperCase()}
          />
          <ConfigInfoRow
            icon={Globe2Icon}
            label={t('page.loadBalancersDetail.config.protocol')}
            value={draft.protocol.toUpperCase()}
          />
          <ConfigInfoRow
            icon={ServerIcon}
            label={t('page.loadBalancers.gatewayServer')}
            value={
              details.gateway?.server.hostname ||
              t('page.loadBalancers.noGateway')
            }
          />
        </div>
      </div>
    </DetailSurface>
  );
}

function ConfigToggle(props: {
  checked: boolean;
  description: string;
  icon: IconComponent;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { checked, description, icon: Icon, label, onCheckedChange } = props;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">{label}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}

function ConfigInfoRow(props: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="grid grid-cols-[24px_minmax(0,0.75fr)_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-semibold">{value}</span>
    </div>
  );
}

function DetailSurface(props: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  icon: IconComponent;
  title: string;
}) {
  const { action, children, description, icon: Icon, title } = props;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-normal">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function InlineMetric(props: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-2">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase text-muted-foreground">
          {label}
        </span>
        <span className="block truncate font-semibold">{value}</span>
      </span>
    </div>
  );
}

function LogPanelFrame(props: {
  description: string;
  errorCount: number;
  mode: LogMode;
  onModeChange: (mode: LogMode) => void;
  onRefresh: () => void;
  totalCount: number;
  children: ReactNode;
}) {
  const {
    children,
    description,
    errorCount,
    mode,
    onModeChange,
    onRefresh,
    totalCount,
  } = props;
  const t = useDevetekTranslations();

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-col gap-4 border-b p-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold">
              {t('page.loadBalancersDetail.logs.requestsTitle')}
            </h4>
            <Badge variant="secondary">
              {t('page.loadBalancersDetail.logs.requestsCount', {
                count: totalCount,
              })}
            </Badge>
            <Badge variant="outline">
              {t('page.loadBalancersDetail.logs.errorCount', {
                count: errorCount,
              })}
            </Badge>
          </div>
          <code className="mt-1 block truncate text-xs text-muted-foreground">
            {description}
          </code>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-lg border bg-card p-1"
            role="group"
            aria-label={t('page.loadBalancersDetail.logs.modeLabel')}
          >
            <LogModeButton
              active={mode === 'all'}
              label={t('page.loadBalancersDetail.logs.allRequests')}
              onClick={() => onModeChange('all')}
            />
            <LogModeButton
              active={mode === 'errors'}
              label={t('page.loadBalancersDetail.logs.errorsOnly')}
              onClick={() => onModeChange('errors')}
            />
          </div>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onRefresh}
            aria-label={t('common.actions.refresh')}
            title={t('common.actions.refresh')}
          >
            <RefreshCwIcon />
            {t('common.actions.refresh')}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

function LogModeButton(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const { active, label, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={onClick}
    >
      {label}
    </button>
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
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold"
      style={{ borderColor: color, color }}
    >
      <Icon className="size-4" />
      {label}
    </span>
  );
}

function StatusCode(props: { status: number }) {
  const { status } = props;

  return (
    <span
      className={cn(
        'w-fit rounded-md border px-2 py-0.5 font-mono text-xs font-bold',
        status > 0 && status < 300 && 'border-emerald-500/40 text-emerald-600',
        status >= 300 && status < 400 && 'border-blue-500/40 text-blue-600',
        status >= 400 && status < 500 && 'border-amber-500/40 text-amber-600',
        status >= 500 && 'border-destructive text-destructive',
      )}
    >
      {Number.isFinite(status) && status > 0 ? status : '-'}
    </span>
  );
}

function StateSurface(props: {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { action, description, icon: Icon, title } = props;

  return (
    <Card className="rounded-lg p-6 text-center shadow-none">
      <span className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

function LoadingState() {
  const t = useDevetekTranslations();

  return (
    <Card className="flex min-h-80 items-center justify-center rounded-lg shadow-none">
      <span className="flex items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        {t('page.loadBalancersDetail.state.loading')}
      </span>
    </Card>
  );
}

function LogLoading() {
  const t = useDevetekTranslations();

  return (
    <div className="flex min-h-56 items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
      <Spinner />
      {t('page.loadBalancersDetail.logs.loading')}
    </div>
  );
}

function LogFailed(props: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center p-4 text-center text-sm text-destructive">
      {props.message}
    </div>
  );
}

function EmptyInline(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function HeaderHelpAction(props: {
  icon: IconComponent;
  label: string;
  href: string;
}) {
  const { href, icon: Icon, label } = props;

  return (
    <Button buttonStyle="outline" buttonColor="secondary" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noreferrer"
      >
        <Icon />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </Button>
  );
}

function getRouteCount(details: LoadBalancerDetails) {
  if (details.configuration.lbKind === 'l4') {
    return details.configuration.upstreams.length;
  }

  return details.configuration.rules.length;
}

function getUpstreamDrafts(details: LoadBalancerDetails): UpstreamDraft[] {
  if (details.configuration.lbKind === 'l4') {
    return details.configuration.upstreams.map((upstream, index) => ({
      destination: upstream.address,
      id: `l4-${index}-${upstream.address}-${upstream.port}`,
      kind: 'address',
      match: 'TCP',
      order: index + 1,
      port: String(upstream.port || ''),
      protocol: 'tcp',
    }));
  }

  const rows: UpstreamDraft[] = [];

  details.configuration.rules.forEach((rule, ruleIndex) => {
    const upstream = rule.upstream;
    const baseOrder = ruleIndex + 1;

    if (upstream.type === 'proxy-pass-app') {
      const applicationId = upstream.target.applicationId;

      rows.push({
        applicationId,
        destination: formatApplicationBackendDestination(
          `Application ${applicationId}`,
          applicationId,
        ),
        href: `/applications/${applicationId}`,
        id: `app-${ruleIndex}-${applicationId}`,
        kind: 'application',
        match: upstream.matchingPath,
        order: baseOrder,
        port: String(upstream.target.port > -1 ? upstream.target.port : ''),
        protocol: 'http',
      });
      return;
    }

    if (upstream.type === 'static-file') {
      rows.push({
        destination: upstream.filePath.join(', '),
        id: `static-${ruleIndex}-${upstream.filePath.join('-')}`,
        kind: 'static',
        match: upstream.matchingPath,
        order: baseOrder,
        port: '',
        protocol: 'file',
      });
      return;
    }

    upstream.backendTarget.forEach((target, targetIndex) => {
      rows.push({
        destination: target.address.hostname,
        id: `address-${ruleIndex}-${targetIndex}-${target.address.hostname}-${target.port}`,
        kind: 'address',
        match: upstream.matchingPath,
        order: baseOrder + targetIndex,
        port: String(target.port || ''),
        protocol: target.address.protocol,
      });
    });
  });

  return rows.map((row, index) => ({
    ...row,
    order: index + 1,
  }));
}

function normalizeDraftRowOrder(rows: UpstreamDraft[]) {
  return rows.map((row, index) => ({
    ...row,
    order: index + 1,
  }));
}

function getUpstreamDraftDisplay(
  row: UpstreamDraft,
  responseApplication: Response<DTOs.ApplicationV1>,
) {
  if (row.kind !== 'application' || responseApplication.$status !== 'success') {
    return {
      destination: row.destination,
      port: row.port,
    };
  }

  const applicationId = String(
    responseApplication.id ??
      row.applicationId ??
      getApplicationIdFromDraftRow(row),
  );
  const applicationName =
    responseApplication.name ||
    row.destination ||
    `Application ${applicationId}`;

  return {
    destination: formatApplicationBackendDestination(
      applicationName,
      applicationId,
    ),
    port: getApplicationDtoRuntimePort(responseApplication) || row.port,
  };
}

function formatApplicationBackendDestination(
  name: string,
  applicationId: string,
) {
  return `${name} (#${applicationId})`;
}

function getApplicationCardRuntimePort(application: ApplicationCard) {
  const port = application.configDefs.lifecycle?.run.port;

  return port ? String(port) : '';
}

function getApplicationDtoRuntimePort(application: DTOs.ApplicationV1) {
  const port = application.app_definition?.run?.port;

  return port ? String(port) : '';
}

function serializeUpstreamDraftRows(rows: UpstreamDraft[]) {
  return JSON.stringify(
    rows.map((row) => ({
      applicationId: row.applicationId ?? '',
      destination: row.destination.trim(),
      href: row.href ?? '',
      kind: row.kind,
      match: row.match.trim(),
      port: row.port.trim(),
      protocol: row.protocol,
    })),
  );
}

function areUpstreamDraftRowsValid(
  details: LoadBalancerDetails,
  rows: UpstreamDraft[],
) {
  if (rows.length === 0) return false;

  return rows.every((row) => {
    const hasMatch =
      details.configuration.lbKind === 'l4' || row.match.trim().length > 0;

    if (!hasMatch) return false;

    if (row.kind === 'application') {
      return getApplicationIdFromDraftRow(row).length > 0;
    }

    if (row.kind === 'static') {
      return row.destination.trim().length > 0;
    }

    const port = Number(row.port);

    return (
      row.destination.trim().length > 0 &&
      Number.isInteger(port) &&
      port >= 1 &&
      port <= 65_535
    );
  });
}

function toLoadBalancerUpdatePayload(
  details: LoadBalancerDetails,
  rows: UpstreamDraft[],
): { defaultUpstream?: string; rules: RecipeRule[] } {
  const rules = rows.map((row) =>
    toLoadBalancerUpdateRule(details.configuration.lbKind, row),
  );

  return {
    defaultUpstream: getDefaultUpstreamFromDraftRows(rows),
    rules,
  };
}

function toLoadBalancerUpdateRule(
  lbKind: LoadBalancerDetails['configuration']['lbKind'],
  row: UpstreamDraft,
): RecipeRule {
  const route = normalizeLoadBalancerPathMatchForPayload(
    lbKind === 'l4' ? '/' : row.match,
  );

  if (row.kind === 'application') {
    return {
      applicationId: getApplicationIdFromDraftRow(row),
      pathMatch: route.pathMatch,
      type: 'proxy_pass',
      wildcard: route.wildcard,
    };
  }

  if (row.kind === 'static') {
    return {
      pathMatch: route.pathMatch,
      type: 'static',
      wildcard: route.wildcard,
    };
  }

  return {
    pathMatch: route.pathMatch,
    type: 'proxy_pass',
    upstreams: [
      {
        address: row.destination.trim(),
        port: row.port.trim(),
      },
    ],
    wildcard: route.wildcard,
  };
}

function getApplicationIdFromDraftRow(row: UpstreamDraft) {
  if (row.applicationId) return row.applicationId;

  const hrefMatch = row.href?.match(/\/applications\/([^/?#]+)/);
  const hrefId = hrefMatch?.[1];

  if (hrefId) return decodeURIComponent(hrefId);

  const destinationMatch = row.destination.match(/Application\s*#([^\s]+)/i);

  return destinationMatch?.[1]?.trim() ?? '';
}

function getDefaultUpstreamFromDraftRows(rows: UpstreamDraft[]) {
  const firstAddressRow = rows[0]?.kind === 'address' ? rows[0] : undefined;

  if (!firstAddressRow) return undefined;

  return `${firstAddressRow.destination.trim()}:${firstAddressRow.port.trim()}`;
}

function createDraftBackendId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getRuntimeConfigDraft(
  rawDetails: RawLoadBalancerDetailsDto | undefined,
  details: LoadBalancerDetails,
): RuntimeConfigDraft {
  return {
    cloudflareProxied: Boolean(rawDetails?.config?.domain?.cloudflare?.proxied),
    protocol: rawDetails?.config?.protocol ?? details.domain.protocol,
    sslEnabled:
      rawDetails?.config?.ssl_enabled ??
      (details.features.has('ssl/tls') || details.domain.protocol === 'https'),
  };
}

function serializeRuntimeConfigDraft(draft: RuntimeConfigDraft) {
  return JSON.stringify({
    cloudflareProxied: draft.cloudflareProxied,
    protocol: draft.protocol,
    sslEnabled: draft.sslEnabled,
  });
}

function toLoadBalancerConfigPayload(
  rawDetails: RawLoadBalancerDetailsDto | undefined,
  details: LoadBalancerDetails,
  draft: RuntimeConfigDraft,
): DTOs.LoadBalancerConfigV2 {
  return {
    ...rawDetails?.config,
    domain: {
      ...rawDetails?.config?.domain,
      cloudflare: {
        ...rawDetails?.config?.domain?.cloudflare,
        proxied: draft.cloudflareProxied,
      },
    },
    lb_kind: rawDetails?.config?.lb_kind ?? details.configuration.lbKind,
    protocol: draft.protocol,
    ssl_enabled: draft.sslEnabled,
  };
}

function getLogContext(
  responseLog: Response<DTOs.LoadBalancerLogsV2>,
): LogContext | undefined {
  if (responseLog.$status !== 'success') {
    return undefined;
  }

  return {
    filePath: responseLog.file_path,
    queryErrors: responseLog.query_errors ?? undefined,
  };
}

function parseLoadBalancerLogResponse(response: DTOs.LoadBalancerLogsV2) {
  const responseEntries = Array.isArray(response.entries)
    ? response.entries
    : [];
  const responseLines = Array.isArray(response.lines) ? response.lines : [];
  const entries =
    responseEntries.length > 0
      ? responseEntries
      : responseLines
          .filter((line): line is string => typeof line === 'string')
          .map((line) => ({ line }));

  return entries
    .map((entry, index) => parseAccessLogEntry(entry, index))
    .filter((entry): entry is AccessLogEntry => Boolean(entry))
    .reverse();
}

function parseAccessLogEntry(
  entry: DTOs.LoadBalancerLogEntryV2,
  index: number,
): AccessLogEntry | null {
  try {
    const line = typeof entry.line === 'string' ? entry.line : '';
    const attributes = asRecord(entry.attributes);
    const parsed = parseJsonRecord(line);
    const record = parsed ?? attributes;

    if (!record) return null;

    const request = asRecord(record.request);
    const headers = asRecord(request?.headers);
    const timestamp =
      normalizeLogTime(record.ts) ??
      normalizeLogTime(entry.time) ??
      normalizeLogTime(record.time);
    const status =
      asNumber(record.status) ??
      asNumber(record.http_response_status_code) ??
      asNumber(record.status_code) ??
      0;

    return {
      bytes:
        asNumber(record.size) ??
        asNumber(record.bytes_written) ??
        asNumber(record.response_size),
      durationMs: normalizeDurationMs(record.duration),
      host: asString(request?.host, asString(record.host_name, '-')),
      id: `${index}-${String(record.ts ?? entry.time ?? line.slice(0, 24))}`,
      method: asString(
        request?.method,
        asString(record.method, 'UNKNOWN'),
      ).toUpperCase(),
      path: asString(
        request?.uri,
        asString(record.uri, asString(record.path, '-')),
      ),
      protocol: asString(request?.proto, asString(record.proto, '-')),
      remoteIp: asString(
        request?.remote_ip,
        asString(record.remote_ip, asString(record.client_ip, '-')),
      ),
      status,
      timestamp,
      userAgent:
        firstString(headers?.['User-Agent']) ??
        firstString(headers?.['user-agent']) ??
        asString(record.user_agent),
      raw: line,
    };
  } catch {
    return null;
  }
}

function parseJsonRecord(value: string): JsonRecord | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const json =
    start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
  try {
    const parsed: unknown = JSON.parse(json);
    return asRecord(parsed);
  } catch {
    return null;
  }
}

function normalizeLogTime(value?: unknown) {
  if (value == null || value === '') return undefined;

  const numericValue = asNumber(value);
  if (numericValue != null) {
    const milliseconds =
      numericValue > 1_000_000_000_000 ? numericValue : numericValue * 1000;
    const numericDate = new Date(milliseconds);
    if (!Number.isNaN(numericDate.getTime())) {
      return numericDate.toISOString();
    }
  }

  if (typeof value !== 'string') return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

function normalizeDurationMs(value: unknown) {
  const duration = asNumber(value);
  if (duration == null) return undefined;

  return duration < 60 ? duration * 1000 : duration;
}

function getDefaultLogDateRange(): LogDateRange {
  const to = new Date();
  const from = new Date(to.getTime() - DEFAULT_LOG_LOOKBACK_MINUTES * 60_000);

  return {
    from: toDateTimeLocalValue(from),
    to: toDateTimeLocalValue(to),
  };
}

function toDateTimeLocalValue(value: Date) {
  const localDate = new Date(
    value.getTime() - value.getTimezoneOffset() * 60000,
  );
  return localDate.toISOString().slice(0, 16);
}

function toDateTimeQueryParam(value: string) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

function asRecord(value: unknown): JsonRecord | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown) {
  if (typeof value === 'number') return value;

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function firstString(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const [first] = value;
  return typeof first === 'string' ? first : undefined;
}

function selectAccessErrors(
  response: Response<AccessLogEntry[]>,
): Response<AccessLogEntry[]> {
  if (response.$status !== 'success') return response;

  const errors = getResponseRows(response).filter((log) => log.status >= 400);
  return Object.assign(errors, { $status: 'success' as const });
}

function getResponseRows(response: Response<AccessLogEntry[]>) {
  return response.$status === 'success' && Array.isArray(response)
    ? response
    : [];
}

function formatDate(value?: Date | string) {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDuration(value?: number) {
  if (value == null || !Number.isFinite(value)) return '-';

  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  return `${(value / 1000).toFixed(2)}s`;
}

function formatBytes(value?: number) {
  if (value == null || !Number.isFinite(value)) return '-';

  if (value < 1024) return `${Math.round(value)}B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;

  return `${(value / (1024 * 1024)).toFixed(1)}MB`;
}
