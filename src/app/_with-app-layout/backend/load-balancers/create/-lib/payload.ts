import type { ApplicationCard } from '@/entities/application/rules/schema';
import { normalizeLoadBalancerPathMatchForPayload } from '@/entities/load-balancer/lib/path-match';

import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

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
    const targets = (upstreams?: Array<{ address: string; port: number }>) =>
      (upstreams ?? [])
        .map((upstream) => `${upstream.address}:${upstream.port}`)
        .join(', ');
    const applicationName =
      applications.find(
        (application) => application.id === rule.applicationIdIfProxyPassApp,
      )?.identity.name ??
      `Application #${rule.applicationIdIfProxyPassApp ?? '-'}`;
    const destination =
      rule.type !== 'proxy-pass-app'
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
          port: String(upstream.port),
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
    sslEnabled: values.features.sslEnabled ?? true,
    defaultUpstream,
    rules,
    runtimeItems: runtimeItem ? [runtimeItem] : undefined,
  };
}
