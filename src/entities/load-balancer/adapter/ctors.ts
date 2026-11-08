import type { z } from 'zod';

import { resolveExecutionErrorMessage } from '@/entities/shared/lib/resolveExecutionErrorMessage';

import type { DTOs } from '@/shared/api';
import { iife } from '@/shared/libs/browser/fn';
import type { KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import { formatLoadBalancerPathMatchForDisplay } from '../lib/path-match';
import type {
  configuration,
  feature,
  gateway,
  l7Rule,
  state,
  webserver,
} from '../rules/schema/parts';

type LoadBalancerDto = DTOs.RouterV1 | DTOs.LoadBalancerV2;

export function ctorState(raw: LoadBalancerDto) {
  return {
    errorDetail: raw.error_detail,
    message: resolveExecutionErrorMessage(raw),
    status: raw.installer_status,
  } as KeysOnlyDeep<z.input<typeof state>>;
}

export function ctorConfiguration(raw: LoadBalancerDto) {
  const lbKind = raw.config?.lb_kind ?? 'l7';

  if (lbKind === 'l4') {
    const l4Rules = (raw.rules ?? []).filter(
      (rule) => rule.path_match === '/' || (raw.rules ?? []).length === 1,
    );
    const upstreams = l4Rules.flatMap((rule) =>
      (rule.target?.upstreams ?? []).map((u) => ({
        address: u.address ?? '',
        port: parseInt(u.port ?? '0') || 0,
      })),
    );

    return {
      lbKind: 'l4',
      upstreams,
    } as KeysOnlyDeep<z.input<typeof configuration>>;
  }

  // L7 — map raw.rules if available, fall back to legacy raw.upstream
  const rulesFromApi = (raw.rules ?? []).map(
    (rule): KeysOnlyDeep<z.input<typeof l7Rule>> => {
      if (rule.target?.application_id) {
        return {
          upstream: {
            type: 'proxy-pass-app',
            matchingPath: formatLoadBalancerPathMatchForDisplay(
              rule.path_match ?? '/',
              rule.wildcard,
            ),
            target: {
              applicationId: rule.target.application_id,
              port: -1,
              addressMode: rule.target.address_mode || undefined,
              upstreams: toApplicationUpstreams(rule.target.upstreams),
              resolvedUpstreams: toApplicationUpstreams(
                rule.target.resolved_upstreams,
              ),
            },
          },
        };
      }

      return {
        upstream: {
          type: 'proxy-pass',
          matchingPath: formatLoadBalancerPathMatchForDisplay(
            rule.path_match ?? '/',
            rule.wildcard,
          ),
          backendTarget: (rule.target?.upstreams ?? []).map((u) => ({
            address: u.address ?? '',
            port: parseInt(u.port ?? '0') || 0,
          })),
        },
      };
    },
  );

  const rules = iife(() => {
    if (rulesFromApi.length > 0) return rulesFromApi;

    // Legacy fallback: build one rule from raw.upstream
    if (!Number.isNaN(Number(raw.upstream))) {
      return [
        {
          upstream: {
            type: 'proxy-pass-app',
            matchingPath: '/*',
            target: {
              applicationId: String(raw.upstream),
              port: -1,
            },
          },
        },
      ] as KeysOnlyDeep<Array<z.input<typeof l7Rule>>>;
    }

    const [backendAddress, backendPort = ''] = raw.upstream?.split(':') ?? [];

    return [
      {
        upstream: {
          type: 'proxy-pass',
          backendTarget: [
            {
              address: backendAddress,
              port: parseInt(backendPort) || 0,
            },
          ],
          matchingPath: '/*',
        },
      },
    ] as KeysOnlyDeep<Array<z.input<typeof l7Rule>>>;
  });

  return {
    lbKind: 'l7',
    rules,
  } as KeysOnlyDeep<z.input<typeof configuration>>;
}

export function ctorFeatures(_: LoadBalancerDto) {
  return new Set<z.input<typeof feature>>([
    'http',
    'http/2',
    'quic',
    'ssl/tls',
    'brotli',
  ]);
}

export function ctorWebserver(raw: LoadBalancerDto) {
  return {
    engine: raw.engine,
  } as KeysOnlyDeep<z.input<typeof webserver>>;
}

export function ctorGateway(raw: LoadBalancerDto) {
  if (raw.machine == null) return undefined;

  const machineId = raw.machine_id ?? raw.machine.id;

  return {
    address: raw.machine.address ?? '',
    server: {
      id: String(machineId ?? ''),
      hostname:
        raw.machine.hostname ??
        raw.machine.address ??
        (machineId != null ? String(machineId) : ''),
    },
  } as KeysOnlyDeep<z.input<typeof gateway>>;
}

function toApplicationUpstreams(
  upstreams:
    | Array<DTOs.LoadBalancerRuleUpstreamV2 | DTOs.RouterRuleUpstreamV1>
    | undefined,
) {
  if (!upstreams?.length) return undefined;

  return upstreams.map((upstream) => ({
    address: upstream.address ?? '',
    port: upstream.port ?? '',
    ...(upstream.scheme ? { scheme: upstream.scheme } : {}),
    ...(upstream.machine_id ? { machineId: upstream.machine_id } : {}),
  }));
}
