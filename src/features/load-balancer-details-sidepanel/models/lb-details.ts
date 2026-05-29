import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';
import { AdapterLoggingRichCaddyLbFromJsonStr } from '@/entities/logging-rich/caddy-lb/adapter';

import { ApiLoadBalancer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { excludeFalsy } from '@/shared/libs/browser/typeguards';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import type { LoadBalancerDetailsSidepanelProps as SidepanelProps } from '../rules/types';

import { useSubscribe } from './events';

export const [LbDetailsModelProvider, useLbDetailsModel] = buildSelector(
  'LbDetailsModel',
)((props: SidepanelProps) => {
  const { loadBalancerId } = props;

  const [responseDetails, refreshDetails] = ApiLoadBalancer.Detail.$Id.useGet({
    loadBalancerId,
  });

  const [responseLog, refreshLog] = ApiLoadBalancer.Logs.$Id.useGet({
    loadBalancerId,
    limit: 10,
    options: {
      skip: responseDetails.$status !== 'success',
    },
  });

  useSubscribe(
    '#load-balancer-details-sidepanel/lb-details/refresh-details',
    () => {
      refreshDetails();
    },
  );

  useSubscribe(
    '#load-balancer-details-sidepanel/lb-details/refresh-activity-timeline',
    () => {
      refreshLog();
    },
  );

  return {
    ...props,
    details: useAdapter(responseDetails, (raw) =>
      AdapterLoadBalancerFromDto.toLoadBalancerDetails(raw).unwrap(),
    ),
    activityTimeline: useAdapter(responseLog, (raw) => {
      const entries = Array.isArray(raw.entries) ? raw.entries : [];
      const lines = Array.isArray(raw.lines) ? raw.lines : [];
      const activityLines = entries.length
        ? entries.map((entry) => entry.line)
        : lines;

      return activityLines
        .filter(excludeFalsy)
        .toReversed()
        .map((log) =>
          AdapterLoggingRichCaddyLbFromJsonStr.toLoggingRichCaddyLb(
            log,
          ).unwrap(),
        );
    }),
  };
});
