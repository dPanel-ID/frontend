import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import type { DTOs } from '@/shared/api';

import type { RawLoadBalancerDetailsDto, RuntimeConfigDraft } from './types';

export function getRuntimeConfigDraft(
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

export function serializeRuntimeConfigDraft(draft: RuntimeConfigDraft) {
  return JSON.stringify({
    cloudflareProxied: draft.cloudflareProxied,
    protocol: draft.protocol,
    sslEnabled: draft.sslEnabled,
  });
}

export function toLoadBalancerConfigPayload(
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
