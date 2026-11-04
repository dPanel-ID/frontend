import { ApiWorkers } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { toWorkersView } from '../lib/workers';
import type { WorkersCardProps } from '../rules/types';

/** The card's data: one workspace's worker configuration. */
export const [WorkersModelProvider, useWorkersModel] = buildContext(
  'WorkspaceWorkers',
  (props: WorkersCardProps) => {
    const { accent = 'sky', canManage, workspaceId } = props;

    const [response, refresh] = ApiWorkers.Find.useGet({ workspaceId });

    return {
      accent,
      canManage,
      workspaceId,
      workers: useAdapter(response, toWorkersView),
      refresh,
    };
  },
);
