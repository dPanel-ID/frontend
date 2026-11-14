import type { ApplicationCard } from '@/entities/application/rules/schema';
import { normalizeLoadBalancerPathMatchForPayload } from '@/entities/load-balancer/lib/path-match';

import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';
import { LoadBalancerCreationRules } from '@/features/load-balancer-creation-sidepanel';

import type { LoadBalancerRuntimeItem } from '../-model/form';

export function getRoutePreviewItems(
  formValues: Partial<LoadBalancerCreationFormValues>,
  applications: ApplicationCard[],
) {
  if (formValues.lbKind === 'l4') {
    return (formValues.l4rule?.upstreams ?? []).map((upstream, index) => ({
      key: `l4-${index}`,
      match: '/',
      destination: `${upstream.address}:${upstream.port}`,
    }));
  }

  return (formValues.l7rules ?? []).map((rule, index) => {
    const targets = (upstreams?: Array<{ address: string; port?: number }>) =>
      (upstreams ?? [])
        .map((upstream) =>
          upstream.port
            ? `${upstream.address}:${upstream.port}`
            : upstream.address,
        )
        .join(', ');
    const applicationName =
      applications.find(
        (application) => application.id === rule.applicationIdIfProxyPassApp,
      )?.identity.name ??
      `Application #${rule.applicationIdIfProxyPassApp ?? '-'}`;
    const destination =
      rule.type === 'redirect'
        ? `${rule.redirectCodeIfRedirect ?? 302} → ${rule.redirectUrlIfRedirect ?? '-'}`
        : rule.type !== 'proxy-pass-app'
          ? targets(rule.upstreamsIfProxyPass)
          : rule.addressModeIfProxyPassApp === 'custom'
            ? `${applicationName} · ${targets(rule.customTargetsIfProxyPassApp)}`
            : applicationName;

    return {
      key: `l7-${index}`,
      match: rule.pathMatch || '/',
      destination: destination || '-',
    };
  });
}

export function toCreateLoadBalancerPayload(
  values: LoadBalancerCreationFormValues,
  runtimeItem?: LoadBalancerRuntimeItem,
) {
  let defaultUpstream = '';

  const rules = (() => {
    if (values.lbKind === 'l7' && values.l7rules) {
      return values.l7rules.map((rule) => {
        const isApplicationTarget = rule.type === 'proxy-pass-app';
        const route = normalizeLoadBalancerPathMatchForPayload(rule.pathMatch);
        if (rule.type === 'redirect') {
          return {
            wildcard: route.wildcard,
            pathMatch: route.pathMatch,
            type: 'redirect',
            redirect: {
              url: (rule.redirectUrlIfRedirect ?? '').trim(),
              code: rule.redirectCodeIfRedirect ?? 302,
              dropPath: rule.redirectDropPathIfRedirect ?? false,
            },
          };
        }
        const addressMode = isApplicationTarget
          ? (rule.addressModeIfProxyPassApp ?? 'registered')
          : undefined;
        const targets = isApplicationTarget
          ? addressMode === 'custom'
            ? rule.customTargetsIfProxyPassApp
            : undefined
          : rule.upstreamsIfProxyPass;
        const upstreams = targets?.map((upstream) => ({
          address: upstream.address.trim(),
          port: upstream.port ? String(upstream.port) : '',
        }));

        if (route.pathMatch === '/' && !isApplicationTarget && upstreams?.[0]) {
          defaultUpstream = `${upstreams[0].address}:${upstreams[0].port}`;
        }

        return {
          wildcard: route.wildcard,
          pathMatch: route.pathMatch,
          type: 'proxy_pass',
          applicationId: isApplicationTarget
            ? rule.applicationIdIfProxyPassApp
            : undefined,
          addressMode,
          upstreams,
        };
      });
    }

    if (values.lbKind === 'l4' && values.l4rule) {
      const first = values.l4rule.upstreams[0];
      if (first) defaultUpstream = `${first.address}:${first.port}`;

      return [
        {
          type: 'proxy_pass',
          pathMatch: '/',
          upstreams: values.l4rule.upstreams.map((upstream) => ({
            address: upstream.address,
            port: String(upstream.port),
          })),
        },
      ];
    }

    return undefined;
  })();

  const l4 =
    values.lbKind === 'l4' && values.l4rule
      ? {
          listenAddress: values.l4rule.listenAddress || undefined,
          listenPort: values.l4rule.listenPort,
          service: values.l4rule.service,
          balance: values.l4rule.balance,
          allowFrom: LoadBalancerCreationRules.parseAllowFrom(
            values.l4rule.allowFrom,
          ),
          idleTimeout: values.l4rule.idleTimeout || undefined,
        }
      : undefined;

  return {
    domain: values.domain,
    name: values.description,
    engine: values.engine,
    serverId: values.serverId,
    internalDomainMetadata: values.internalDomainMetadata?.id
      ? values.internalDomainMetadata
      : undefined,
    lbKind: values.lbKind,
    protocol: values.features.protocol ?? 'http',
    // L4 traffic passes through untouched; TLS stays the database's own.
    sslEnabled: isHttpsRequested(values),
    l4,
    defaultUpstream,
    rules,
    runtimeItems: runtimeItem ? [runtimeItem] : undefined,
  };
}

/**
 * Whether the load balancer gets a certificate. L4 passes traffic through
 * untouched, so it never does, whatever the switch held before L4 was picked.
 */
export function isHttpsRequested(values: {
  lbKind?: string;
  features?: { sslEnabled?: boolean };
}) {
  return values.lbKind !== 'l4' && (values.features?.sslEnabled ?? true);
}
