import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';

import { ApiLoadBalancer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';
import { useFilterModel } from './filters';

export const [LbDataModelProvider, useLbDataModel] = buildSelector(
  'LbDataModel',
)(() => {
  const { currentPage, searchQuery, status } = useFilterModel();

  const [response, refresh] = ApiLoadBalancer.Find.useGet({
    page: currentPage,
    pageSize: 10,
    searchQuery,
    installerStatus: status || undefined,
  });

  useSubscribe('@load-balancers/data--refresh', () => {
    refresh();
  });

  return {
    loadBalancers: useAdapter(response, (raw) => {
      // One malformed record used to throw here and blank the whole list.
      // Production data still holds routers the schema rejects, so a bad row
      // is dropped instead.
      const parsed = (raw.routers || []).flatMap((loadBalancer) => {
        const card =
          AdapterLoadBalancerFromDto.toLoadBalancerCard(loadBalancer).okay();
        return card ? [card] : [];
      });

      return {
        list: parsed,
        pagination: raw.pagination,
      };
    }),
  };
});
