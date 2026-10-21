import { ApiCloud } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from '../events';
import { useFilterModel } from '../filters';

export const [CloudDataModelProvider, useCloudDataModel] = buildSelector(
  'CloudDataModel',
)(() => {
  const { searchQuery, currentPage, status } = useFilterModel();

  const [response, refresh] = ApiCloud.Project.Find.useGet({
    page: currentPage,
    pageSize: 8,
    searchQuery,
    installerStatus: status || undefined,
  });

  useSubscribe('@cloud-projects/data--refresh', () => {
    refresh();
  });

  return {
    // The Find DTO declares `clouds` as always present, so no fallback is
    // allowed here. Two other call sites do guard it; see the PR notes.
    clouds: useAdapter(response, (raw) => ({
      list: raw.clouds,
      pagination: raw.pagination,
    })),
    refresh,
  };
});
