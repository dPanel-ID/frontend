import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';
import { LoadBalancerFailure } from '@/entities/load-balancer/ui/LoadBalancerFailure';

import { ApiLoadBalancer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { LoadingState, StateSurface } from './-view/-presentation/surfaces';
import { DetailTabs } from './-view/DetailTabs';
import { Header } from './-view/Header';
import { Overview } from './-view/Overview';

export const Route = createFileRoute(
  '/_with-app-layout/backend/load-balancers/$id/',
)({
  head: () => ({
    meta: [{ title: 'Load balancer | dnocs' }],
  }),
  component: LoadBalancerDetailPage,
});

function LoadBalancerDetailPage() {
  const { id } = Route.useParams();
  const t = useDevetekTranslations();

  const [responseDetails, refreshDetails] = ApiLoadBalancer.Detail.$Id.useGet({
    loadBalancerId: id,
  });

  const details = useAdapter(responseDetails, (raw) =>
    AdapterLoadBalancerFromDto.toLoadBalancerDetails(raw).unwrap(),
  );

  const refreshAll = () => {
    refreshDetails();
  };

  return (
    <div className="flex flex-col gap-4">
      <Header
        id={id}
        details={details.$status === 'success' ? details : undefined}
        isRefreshing={responseDetails.$status === 'loading'}
        onRefresh={refreshAll}
      />

      {details.$status === 'loading' || details.$status === 'initial' ? (
        <LoadingState />
      ) : null}

      {details.$status === 'failed' ? (
        <StateSurface
          icon={AlertTriangleIcon}
          title={t('page.loadBalancersDetail.state.failedTitle')}
          description={details.error.message}
          action={
            <Button onClick={() => refreshDetails()}>
              <RefreshCwIcon />
              {t('common.actions.retry')}
            </Button>
          }
        />
      ) : null}

      {details.$status === 'success' ? (
        <>
          <Overview details={details} />
          <LoadBalancerFailure
            domain={details.domain.fqdn}
            state={details.state}
          />
          <DetailTabs
            details={details}
            rawDetails={
              responseDetails.$status === 'success'
                ? responseDetails
                : undefined
            }
            onDetailsRefresh={refreshDetails}
          />
        </>
      ) : null}
    </div>
  );
}
