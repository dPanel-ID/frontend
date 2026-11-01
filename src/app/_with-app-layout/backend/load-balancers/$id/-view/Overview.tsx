import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  RouteIcon,
  ServerIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';
import { LOAD_BALANCER_FEATURES } from '@/entities/load-balancer/ui/constants/features';
import { LOAD_BALANCER_STATUS_METADATA } from '@/entities/load-balancer/ui/constants/state-metadata';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { getRouteCount } from '../-lib/upstream-drafts';

import { StatusPill } from './-presentation/surfaces';

/** Four facts about the load balancer, each said once on the page. */
export function Overview(props: { details: LoadBalancerDetails }) {
  const { details } = props;
  const t = useDevetekTranslations();

  const status = LOAD_BALANCER_STATUS_METADATA[details.state.status];
  const engine = LOAD_BALANCER_WEBSERVER_ENGINE[details.webserver.engine];
  const features = Array.from(details.features)
    .map((feature) => t(LOAD_BALANCER_FEATURES[feature].i18n.label))
    .join(' · ');
  const routes = getRouteCount(details);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={ActivityIcon}
        tone={details.state.status === 'failed' ? 'red' : 'emerald'}
        label={t('page.loadBalancersDetail.tiles.status')}
        value={
          <StatusPill
            icon={status.icon}
            label={t(status.i18n.statusLabel)}
            color={`var(${status.color})`}
          />
        }
        hint={details.state.message || undefined}
      />
      <StatTile
        icon={RouteIcon}
        tone="sky"
        label={t('page.loadBalancersDetail.tiles.routes')}
        value={routes}
        hint={t('page.loadBalancersDetail.tiles.routesHint', {
          kind: details.configuration.lbKind.toUpperCase(),
        })}
      />
      <StatTile
        icon={ServerIcon}
        label={t('page.loadBalancersDetail.tiles.gateway')}
        value={
          details.gateway ? (
            <Link
              to="/servers/$id"
              params={{ id: String(details.gateway.server.id) }}
              className="block truncate hover:underline"
            >
              {details.gateway.server.hostname}
            </Link>
          ) : (
            t('page.loadBalancers.noGateway')
          )
        }
        hint={details.gateway?.address}
      />
      <StatTile
        icon={ShieldCheckIcon}
        label={t('page.loadBalancersDetail.tiles.engine')}
        value={t(engine.i18n.brandName)}
        hint={features || undefined}
      />
    </div>
  );
}
