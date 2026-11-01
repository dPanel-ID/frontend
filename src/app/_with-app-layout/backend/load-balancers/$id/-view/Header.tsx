import {
  ExternalLinkIcon,
  FileTextIcon,
  NetworkIcon,
  RefreshCwIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

/**
 * One opening for the load balancer: its domain as the title, its name and
 * last change below, and the actions you reach for first.
 */
export function Header(props: {
  id: string;
  details?: LoadBalancerDetails;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const { details, id, isRefreshing, onRefresh } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const fqdn = details?.domain.fqdn;
  const description = details
    ? [
        details.description || t('page.loadBalancers.noDescription'),
        t('page.loadBalancersDetail.hero.updated', {
          when: getDistanceFromNow(details.timestamp.updated, locale),
        }),
      ].join(' · ')
    : t('page.loadBalancersDetail.headerDesc');

  return (
    <FlowHero
      accent="sky"
      icon={NetworkIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            {
              text: t('sidebar.loadBalancers'),
              url: '/backend/load-balancers',
            },
            { text: fqdn ?? `#${id}` },
          ]}
        />
      }
      badge={details?.configuration.lbKind.toUpperCase()}
      title={fqdn ?? t('page.loadBalancersDetail.headerTitle')}
      description={description}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {details && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`${details.domain.protocol}://${details.domain.fqdn}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon />
                {t('page.loadBalancersDetail.hero.openSite')}
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCwIcon className={cn(isRefreshing && 'animate-spin')} />
            {t('common.actions.refresh')}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              target="_blank"
              rel="noreferrer"
              aria-label={t('page.loadBalancers.docs')}
              title={t('page.loadBalancers.docs')}
            >
              <FileTextIcon />
              <span className="hidden sm:inline">
                {t('page.loadBalancers.docs')}
              </span>
            </a>
          </Button>
        </div>
      }
    />
  );
}
