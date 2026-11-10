import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ChevronRightIcon,
  ExternalLinkIcon,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import type { IconComponent, UpstreamDraft } from '../-lib/types';
import { getRouteCount, getUpstreamDrafts } from '../-lib/upstream-drafts';

type StopTone = 'sky' | 'violet' | 'emerald' | 'amber';

const TONE_CLASSES: Record<StopTone, string> = {
  sky: 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  violet:
    'border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  emerald:
    'border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  amber:
    'border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
};

const VISIBLE_TARGETS = 3;

/**
 * The request path as one rail: domain, load balancer, gateway and targets,
 * with the hop between each named on the line. Below it, every route as a
 * table row.
 */
export function GraphTab(props: { details: LoadBalancerDetails }) {
  const { details } = props;
  const t = useDevetekTranslations();
  const upstreams = getUpstreamDrafts(details);
  const routeCount = getRouteCount(details);
  const protocol = details.domain.protocol.toUpperCase();
  const kind = details.configuration.lbKind.toUpperCase();

  return (
    <div className="grid gap-4">
      <DataPanel
        icon={RouteIcon}
        title={t('page.loadBalancersDetail.graph.title')}
        description={t('page.loadBalancersDetail.graph.description')}
      >
        <ol
          aria-label={t('page.loadBalancersDetail.graph.requestPath')}
          className="grid p-4 md:grid-cols-4 md:p-5"
        >
          <Stop
            icon={Globe2Icon}
            tone="sky"
            label={t('page.loadBalancersDetail.graph.domain')}
            hop={protocol}
            meta={[protocol, t('page.loadBalancersDetail.graph.entryPoint')]}
          >
            <a
              href={`${details.domain.protocol}://${details.domain.fqdn}`}
              target="_blank"
              rel="noreferrer"
              className="group/link inline-flex max-w-full items-start gap-1 hover:underline"
            >
              <span className="break-all">{details.domain.fqdn}</span>
              <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover/link:text-foreground" />
            </a>
          </Stop>

          <Stop
            icon={NetworkIcon}
            tone="violet"
            label={t('common.terms.loadBalancer')}
            hop={kind}
            meta={[kind, t('page.loadBalancersDetail.graph.edgeRuntime')]}
          >
            <span className="break-words">
              {details.description || details.domain.fqdn}
            </span>
          </Stop>

          <Stop
            icon={ServerIcon}
            tone="emerald"
            label={t('page.loadBalancersDetail.graph.gateway')}
            hop={t('page.loadBalancersDetail.graph.routeCount', {
              count: routeCount,
            })}
            meta={[details.gateway?.address]}
          >
            {details.gateway ? (
              <Link
                to="/servers/$id"
                params={{ id: String(details.gateway.server.id) }}
                className="break-all hover:underline"
              >
                {details.gateway.server.hostname}
              </Link>
            ) : (
              <span className="text-muted-foreground">
                {t('page.loadBalancers.noGateway')}
              </span>
            )}
          </Stop>

          <Stop
            icon={Layers3Icon}
            tone="amber"
            label={t('page.loadBalancersDetail.graph.targets')}
            meta={[
              t('page.loadBalancersDetail.graph.targetCount', {
                count: upstreams.length,
              }),
            ]}
            last
          >
            {upstreams.length > 0 ? (
              <span className="grid gap-1">
                {upstreams.slice(0, VISIBLE_TARGETS).map((upstream) => (
                  <TargetLine key={upstream.id} upstream={upstream} />
                ))}
                {upstreams.length > VISIBLE_TARGETS && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('page.loadBalancers.moreRoutes', {
                      count: upstreams.length - VISIBLE_TARGETS,
                    })}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t('page.loadBalancersDetail.graph.emptyTargets')}
              </span>
            )}
          </Stop>
        </ol>
      </DataPanel>

      <DataPanel
        icon={ListTreeIcon}
        title={t('page.loadBalancersDetail.graph.routeMap')}
        description={t('page.loadBalancersDetail.graph.routeMapDesc')}
        footer={
          upstreams.length > 0 && (
            <DataPanelMeta>
              {t('page.loadBalancersDetail.graph.routeCount', {
                count: routeCount,
              })}
            </DataPanelMeta>
          )
        }
      >
        {upstreams.length > 0 ? (
          <RouteTable upstreams={upstreams} />
        ) : (
          <DataPanelState
            state="empty"
            title={t('page.loadBalancers.noRules')}
          />
        )}
      </DataPanel>
    </div>
  );
}

/**
 * One stop on the rail. From tablet width up the icons sit on a horizontal
 * line with the hop named on it; on phones the line runs down the left.
 */
function Stop(props: {
  icon: IconComponent;
  tone: StopTone;
  label: string;
  /** Names the hop to the next stop, e.g. "HTTPS". */
  hop?: string;
  meta: Array<string | undefined>;
  last?: boolean;
  children: ReactNode;
}) {
  const { children, hop, icon: Icon, label, last, meta, tone } = props;
  const metaText = meta.filter(Boolean).join(' · ');

  return (
    <li className="relative flex min-w-0 gap-3 pb-6 last:pb-0 md:flex-col md:gap-3 md:pb-0 md:pr-6">
      {!last && (
        <>
          {/* Vertical rail on phones. */}
          <span
            aria-hidden
            className="absolute bottom-0 left-5 top-11 w-px bg-border md:hidden"
          />
          {/* Horizontal rail from tablet width up, with the hop on it. */}
          <span
            aria-hidden
            className="absolute left-12 right-2 top-5 hidden -translate-y-1/2 items-center md:flex"
          >
            <span className="h-px flex-1 bg-border" />
            {hop && (
              <span className="mx-1.5 shrink-0 rounded-full border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {hop}
              </span>
            )}
            <span className="h-px flex-1 bg-border" />
            <ChevronRightIcon className="-ml-1 size-3.5 shrink-0 text-border" />
          </span>
        </>
      )}

      <span
        className={cn(
          'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border',
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 pt-0.5 md:pt-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm font-semibold leading-snug">
          {children}
        </div>
        {metaText && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {metaText}
          </p>
        )}
        {hop && !last && (
          <span className="mt-2 inline-flex rounded-full border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
            {hop}
          </span>
        )}
      </div>
    </li>
  );
}

function TargetLine(props: { upstream: UpstreamDraft }) {
  const { upstream } = props;

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <code className="shrink-0 rounded border bg-background px-1 font-mono text-[11px] text-muted-foreground">
        {upstream.match}
      </code>
      <span aria-hidden className="text-muted-foreground">
        →
      </span>
      <Destination upstream={upstream} className="truncate" />
    </span>
  );
}

function Destination(props: { upstream: UpstreamDraft; className?: string }) {
  const { className, upstream } = props;

  if (upstream.href) {
    return (
      <a
        href={upstream.href}
        className={cn('min-w-0 hover:underline', className)}
      >
        {upstream.destination}
      </a>
    );
  }

  return (
    <code className={cn('min-w-0 font-mono text-[13px]', className)}>
      {upstream.destination}
    </code>
  );
}

/** Every route in the order the gateway matches them. */
function RouteTable(props: { upstreams: UpstreamDraft[] }) {
  const { upstreams } = props;
  const t = useDevetekTranslations();

  const kindLabel = (kind: UpstreamDraft['kind']) =>
    kind === 'application'
      ? t('page.loadBalancersDetail.upstreams.kind.application')
      : kind === 'static'
        ? t('page.loadBalancersDetail.upstreams.kind.static')
        : kind === 'redirect'
          ? t('page.loadBalancersDetail.upstreams.kind.redirect')
          : t('page.loadBalancersDetail.upstreams.kind.address');

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12 px-4">#</TableHead>
          <TableHead>{t('page.loadBalancersDetail.upstreams.match')}</TableHead>
          <TableHead>
            {t('page.loadBalancersDetail.upstreams.destination')}
          </TableHead>
          <TableHead>{t('common.terms.type')}</TableHead>
          <TableHead className="px-4 text-right">
            {t('common.terms.port')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {upstreams.map((upstream) => (
          <TableRow key={upstream.id}>
            <TableCell className="px-4 font-mono text-xs text-muted-foreground">
              {String(upstream.order).padStart(2, '0')}
            </TableCell>
            <TableCell>
              <code className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                {upstream.match}
              </code>
            </TableCell>
            <TableCell className="max-w-[24rem] text-sm font-medium">
              <Destination upstream={upstream} className="block truncate" />
            </TableCell>
            <TableCell>
              <span className="rounded-md border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {kindLabel(upstream.kind)}
              </span>
            </TableCell>
            <TableCell className="px-4 text-right font-mono text-xs text-muted-foreground">
              {upstream.port || '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
