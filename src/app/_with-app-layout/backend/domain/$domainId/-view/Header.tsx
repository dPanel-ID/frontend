import { ExternalLinkIcon, GlobeIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';

import { useDomainRecordsModel } from '../-model/domain-records';

/** The page opening, in the same language as the domain list's. */
export default function Header() {
  const t = useDevetekTranslations();
  const [domain, domainId, isFetching, refresh] = useDomainRecordsModel((s) => [
    s.domain,
    s.domainId,
    s.isFetchingRecords,
    s.refresh,
  ]);

  const hostname =
    domain.$status === 'success' ? domain.domain.hostname : undefined;
  const description =
    domain.$status === 'success' ? domain.description : undefined;

  return (
    <FlowHero
      accent="sky"
      icon={GlobeIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('page.domainDetail.breadcrumb'), url: '/backend/domain' },
            { text: hostname ?? `#${domainId}` },
          ]}
        />
      }
      title={hostname ?? '…'}
      description={description || t('page.domainDetail.headerFallback')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={refresh}
          >
            <RefreshCwIcon className={cn(isFetching && 'animate-spin')} />
            {t('page.domainDetail.refresh')}
          </Button>
          {hostname && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://${hostname}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLinkIcon />
                {t('page.domainDetail.openSite')}
              </a>
            </Button>
          )}
        </div>
      }
    />
  );
}
