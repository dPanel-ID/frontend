import { useState } from 'react';

import dayjs from 'dayjs';
import { ExternalLinkIcon, ServerIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerCard } from '@/entities/load-balancer/rules/schema';
import { LOAD_BALANCER_STATUS_METADATA } from '@/entities/load-balancer/ui/constants/state-metadata';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';
import { LoadBalancerErrorDialog } from '@/entities/load-balancer/ui/LoadBalancerFailure';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { loadBalancerStatusBucket } from '../../-models/overview';

import { LbActions } from './LbActions';
import { routingSummary } from './routing-summary';

interface LbTableProps {
  list: LoadBalancerCard[];
}

/** The dense view: one line per load balancer, for larger estates. */
export default function LbTable(props: LbTableProps) {
  const { list } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  // The status pill of a failed row opens why it failed, as on servers.
  const [failed, setFailed] = useState<LoadBalancerCard>();

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.loadBalancers.table.loadBalancer')}
            </TableHead>
            <TableHead>{t('page.loadBalancers.table.status')}</TableHead>
            <TableHead>{t('page.loadBalancers.table.gateway')}</TableHead>
            <TableHead>{t('page.loadBalancers.table.routing')}</TableHead>
            <TableHead>{t('page.loadBalancers.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.loadBalancers.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((lb) => {
            const stateMeta = LOAD_BALANCER_STATUS_METADATA[lb.state.status];
            const engine = LOAD_BALANCER_WEBSERVER_ENGINE[lb.webserver.engine];
            const bucket = loadBalancerStatusBucket(lb.state.status);
            const href = `${lb.domain.protocol}://${lb.domain.fqdn}`;

            return (
              <TableRow key={lb.id}>
                <TableCell className="px-4">
                  <div className="flex min-w-0 flex-col">
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={t('page.loadBalancers.openDomain', {
                        domain: lb.domain.fqdn,
                      })}
                      className="inline-flex min-w-0 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="truncate">{lb.domain.fqdn}</span>
                      <ExternalLinkIcon className="size-3 shrink-0" />
                    </a>
                    <span className="truncate text-xs text-muted-foreground">
                      {t(engine.i18n.brandName)} ·{' '}
                      {lb.configuration.lbKind.toUpperCase()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPill
                    tone={
                      bucket === 'ready'
                        ? 'success'
                        : bucket === 'progress'
                          ? 'info'
                          : bucket === 'failed'
                            ? 'danger'
                            : 'neutral'
                    }
                    pulse={bucket === 'progress'}
                    label={t(stateMeta.i18n.statusLabel)}
                    title={
                      bucket === 'failed'
                        ? t('page.loadBalancers.failure.viewDetail')
                        : undefined
                    }
                    onClick={
                      bucket === 'failed' ? () => setFailed(lb) : undefined
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 flex-col">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-primary/80">
                      <ServerIcon className="size-3 shrink-0" aria-hidden />
                      <span className="truncate">
                        {lb.gateway?.server.hostname ??
                          t('page.loadBalancers.noGateway')}
                      </span>
                    </span>
                    <span className="truncate text-[0.65rem] text-muted-foreground">
                      {lb.gateway?.address || t('page.loadBalancers.noAddress')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary/80">
                    {routingSummary(lb.configuration, t)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs text-primary/80">
                      {getDistanceFromNow(lb.timestamp.updated, locale)}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {dayjs(lb.timestamp.updated).format('YYYY/MM/DD HH:mm')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <LbActions loadBalancer={lb} layout="menu" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {failed && (
        <LoadBalancerErrorDialog
          open
          onOpenChange={(open) => !open && setFailed(undefined)}
          domain={failed.domain.fqdn}
          state={failed.state}
        />
      )}
    </div>
  );
}
