import { AdapterApplicationFromDto } from '@/entities/application/adapter';

import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';
import { useFilterModel } from './filters';

export const [AppsDataModelProvider, useAppsDataModel] = buildSelector(
  'AppsDataModel',
)(() => {
  const { pagination, searchQuery } = useFilterModel();

  const [response, refresh] = ApiApplication.Find.useGet({
    page: pagination,
    limit: 8,
    name: searchQuery,
  });

  useSubscribe('@applications/application-refresh', () => refresh());

  return {
    applications: useAdapter(response, (raw) => {
      // One malformed record used to throw here and blank the whole list.
      // Production data still holds applications the schema rejects, so a
      // bad row is dropped instead.
      const parsed = (raw.applications || []).flatMap((application) => {
        const card =
          AdapterApplicationFromDto.toApplicationCard(application).okay();
        return card ? [card] : [];
      });

      return {
        list: parsed,
        pagination: raw.pagination,
      };
    }),
  };
});
