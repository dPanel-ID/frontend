import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeUpstream {
  address: string;
  port: string;
}

export interface RecipeInternalDomainMetadata {
  cloudflare?: {
    proxied?: boolean;
  };
  id: string;
  subdomain: string;
  ttl?: number;
}

export interface RecipeRule {
  pathMatch: string;
  type: string;
  wildcard?: boolean;
  upstreams?: RecipeUpstream[];
  applicationId?: string;
}

export interface RecipeRuntimeItem {
  name: string;
  title?: string;
  version?: string;
  category?: string;
  roles: string[];
  installationKey?: string;
  variables: Record<string, unknown>;
  source?: string;
  moduleRef?: string;
  moduleSourceCommit?: string;
}

export interface RecipeParams {
  advanceMode?: boolean;
  name: string;
  domain: string;
  internalDomainMetadata?: RecipeInternalDomainMetadata;
  engine: string;
  defaultUpstream: string;
  serverId: string;
  lbKind: string;
  protocol: string;
  sslEnabled: boolean;
  rules?: RecipeRule[];
  runtimeItems?: RecipeRuntimeItem[];
  port?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const {
    name,
    domain,
    engine,
    defaultUpstream,
    serverId,
    internalDomainMetadata,
    lbKind,
    protocol,
    sslEnabled,
    rules,
    runtimeItems,
  } = params;

  return {
    method: 'POST',
    url: `/v2/load-balancer/create`,
    data: {
      name,
      domain,
      engine,
      type: 'proxy_pass',
      upstream: defaultUpstream,
      machine_id: serverId,
      advance_mode: params.advanceMode ?? true,
      config: {
        domain: {
          cloudflare: internalDomainMetadata?.cloudflare
            ? {
                proxied: internalDomainMetadata.cloudflare.proxied,
              }
            : undefined,
          id: internalDomainMetadata?.id,
          subdomain: internalDomainMetadata?.subdomain,
          ttl: internalDomainMetadata?.ttl,
        },
        lb_kind: lbKind,
        protocol,
        ssl_enabled: sslEnabled,
      },
      rules: rules?.map(toRulePayload),
      runtime_items: runtimeItems?.map((item) => ({
        name: item.name,
        title: item.title,
        version: item.version,
        category: item.category,
        roles: item.roles,
        installation_key: item.installationKey,
        variables: item.variables,
        source: item.source,
        module_ref: item.moduleRef,
        module_source_commit: item.moduleSourceCommit,
      })),
    },
  };
}

export function toRulePayload(rule: RecipeRule) {
  return {
    path_match: rule.pathMatch,
    type: rule.type,
    wildcard: rule.wildcard,
    target: {
      application_id: rule.applicationId,
      upstreams: rule.upstreams,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.LoadBalancerV2>({
    ...recipe(params),
  });
}
