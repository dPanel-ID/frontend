import { ApiLoadBalancer } from '@/shared/api';

import { useAppDataModel } from '../-model/app-data';

export interface PublicEndpoint {
  /** Load balancer id, for its logs. */
  id: string;
  domain?: string;
  /** Ready to put in an href, with a scheme. */
  href?: string;
}

/**
 * Where the public can reach this application.
 *
 * The detail response carries no domain, which is why the overview had no
 * way out to the running site. The load balancer in front of the
 * application does carry one, and it is the address people actually use,
 * so it is the honest source for both the link and the request logs.
 */
export function usePublicEndpoint(): PublicEndpoint | undefined {
  const [applicationId] = useAppDataModel((s) => [s.applicationId]);

  const [response] = ApiLoadBalancer.Find.useGet({
    applicationId: String(applicationId),
    page: 1,
    limit: 1,
  });

  if (response.$status !== 'success') return undefined;

  const router = response.routers?.[0];
  if (!router) return undefined;

  const domain = router.domain || undefined;

  return {
    id: String(router.id),
    domain,
    href: domain
      ? domain.startsWith('http')
        ? domain
        : `https://${domain}`
      : undefined,
  };
}
