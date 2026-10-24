import type { DTOs } from '@/shared/api';

export interface AppLoadBalancer {
  id: string;
  domain?: string;
  /** Ready for an href, with a scheme. */
  href?: string;
  /** `ready`, `progress`, `failed` and so on. */
  status?: string;
}

/**
 * Which load balancers sit in front of which application.
 *
 * A router has no top-level `application_id`; the link lives in
 * `rules[].target.application_id`, and one router can route several rules
 * to the same application, so the ids are deduplicated.
 */
export function indexLoadBalancersByApplication(
  routers: DTOs.LoadBalancerV2[] | undefined | null,
): Map<string, AppLoadBalancer[]> {
  const index = new Map<string, AppLoadBalancer[]>();

  for (const router of routers ?? []) {
    const id = router.id == null ? undefined : String(router.id);
    if (!id) continue;

    const domain = router.domain || router.domain_l4 || undefined;

    const entry: AppLoadBalancer = {
      id,
      domain,
      href: domain
        ? domain.startsWith('http')
          ? domain
          : `https://${domain}`
        : undefined,
      status: router.installer_status,
    };

    const applicationIds = new Set(
      (router.rules ?? [])
        .map((rule) => rule.target?.application_id)
        .filter((one): one is string => Boolean(one)),
    );

    for (const applicationId of applicationIds) {
      const existing = index.get(applicationId);

      if (existing) {
        if (!existing.some((one) => one.id === id)) existing.push(entry);
        continue;
      }

      index.set(applicationId, [entry]);
    }
  }

  return index;
}
