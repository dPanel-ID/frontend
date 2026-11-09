import { ApiServiceAccounts } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { toAccountRows } from '../lib/accounts';
import type { ServiceAccountsPanelProps } from '../rules/types';

/** The panel's data: one owner's service accounts. */
export const [ServiceAccountsModelProvider, useServiceAccountsModel] =
  buildContext('ServiceAccounts', (props: ServiceAccountsPanelProps) => {
    const { workspaceId } = props;
    const [response, refresh] = ApiServiceAccounts.Find.useGet({
      workspaceId,
    });

    return {
      workspaceId,
      accounts: useAdapter(response, toAccountRows),
      refresh,
    };
  });
