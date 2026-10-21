import type { useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerCard } from '@/entities/load-balancer/rules/schema';

type Configuration = LoadBalancerCard['configuration'];
type Translate = ReturnType<typeof useDevetekTranslations>;

/**
 * One line describing where a load balancer sends traffic: how many L7 rules
 * it routes, or how many L4 upstreams it balances across.
 */
export function routingSummary(configuration: Configuration, t: Translate) {
  if (configuration.lbKind === 'l7') {
    return t('page.loadBalancers.xRules', {
      length: configuration.rules.length,
    });
  }

  return t('page.loadBalancers.xUpstream', {
    length: configuration.upstreams.length,
  });
}
