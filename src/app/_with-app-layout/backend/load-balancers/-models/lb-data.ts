import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';

import { ApiLoadBalancer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';
import { useFilterModel } from './filters';

export const [LbDataModelProvider, useLbDataModel] = buildSelector(
  'LbDataModel',
)(() => {
  const { currentPage, searchQuery } = useFilterModel();

  const [response, refresh] = ApiLoadBalancer.Find.useGet({
    page: currentPage,
    pageSize: 10,
    searchQuery,
  });

  useSubscribe('@load-balancers/data--refresh', () => {
    refresh();
  });

  return {
    loadBalancers: useAdapter(response, (raw) => {
      const parsed = (raw.routers || []).map((loadBalancer) =>
        AdapterLoadBalancerFromDto.toLoadBalancerCard(loadBalancer).unwrap(),
      );

      return {
        list: parsed,
        pagination: raw.pagination,
      };
    }),
  };
});
