import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import type { DTOs } from '@/shared/api';

import type {
  HttpSettingsDraft,
  RawLoadBalancerDetailsDto,
  RuntimeConfigDraft,
} from './types';

/** Which draft field is which config.http key. */
const HTTP_SETTINGS_FIELDS: ReadonlyArray<
  [keyof HttpSettingsDraft, keyof DTOs.LoadBalancerHttpSettingsV2]
> = [
  ['requestBodyMax', 'request_body_max'],
  ['readBodyTimeout', 'read_body_timeout'],
  ['responseTimeout', 'response_timeout'],
  ['healthPath', 'health_path'],
  ['healthInterval', 'health_interval'],
  ['healthTimeout', 'health_timeout'],
];

export function getHttpSettingsDraft(
  settings: DTOs.LoadBalancerHttpSettingsV2 | undefined,
): HttpSettingsDraft {
  const draft = {} as HttpSettingsDraft;
  for (const [field, key] of HTTP_SETTINGS_FIELDS) {
    draft[field] = settings?.[key] ?? '';
  }
  return draft;
}

/** The config.http payload: only the fields with a value. */
export function toHttpSettingsPayload(
  draft: HttpSettingsDraft,
): DTOs.LoadBalancerHttpSettingsV2 {
  const payload: DTOs.LoadBalancerHttpSettingsV2 = {};
  for (const [field, key] of HTTP_SETTINGS_FIELDS) {
    const value = draft[field].trim();
    if (value) payload[key] = value;
  }
  return payload;
}

export function getRuntimeConfigDraft(
  rawDetails: RawLoadBalancerDetailsDto | undefined,
  details: LoadBalancerDetails,
): RuntimeConfigDraft {
  return {
    cloudflareProxied: Boolean(rawDetails?.config?.domain?.cloudflare?.proxied),
    http: getHttpSettingsDraft(rawDetails?.config?.http),
    protocol: rawDetails?.config?.protocol ?? details.domain.protocol,
    sslEnabled:
      rawDetails?.config?.ssl_enabled ??
      (details.features.has('ssl/tls') || details.domain.protocol === 'https'),
  };
}

export function serializeRuntimeConfigDraft(draft: RuntimeConfigDraft) {
  return JSON.stringify({
    cloudflareProxied: draft.cloudflareProxied,
    http: toHttpSettingsPayload(draft.http),
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
    http: toHttpSettingsPayload(draft.http),
    lb_kind: rawDetails?.config?.lb_kind ?? details.configuration.lbKind,
    protocol: draft.protocol,
    ssl_enabled: draft.sslEnabled,
  };
}
