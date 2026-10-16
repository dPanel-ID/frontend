import { ApiUser } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

export const [ResourcesModelProvider, useResourcesModel] = buildSelector(
  'MigrateOwnershipResourcesModel',
)(() => {
  const [responseProfile, refreshProfile] = ApiUser.Profile.useGet();

  useSubscribe(
    '#migrate-ownership-modal/resources/teams-refresh',
    refreshProfile,
  );

  return {
    // Casdoor workspace groups the user belongs to; transfers target these
    // by group ID.
    teams: useAdapter(responseProfile, (raw) => {
      return (raw.workspaces ?? [])
        .filter((workspace) => workspace.type === 'group' && workspace.id)
        .map((workspace) => ({
          name: workspace.name || workspace.id,
          id: workspace.id,
        }));
    }),
  };
});
