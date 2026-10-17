import { Suspense } from 'react';

import { ServerUsersPanel } from '@/features/server-users-sidepanel';

import { useServerDataModel } from '../../../-model/server-data';
import { PanelFallback } from '../_PanelFallback';

export default function UsersTab() {
  const [serverId, detail] = useServerDataModel((s) => [s.serverId, s.detail]);

  return (
    <Suspense fallback={<PanelFallback />}>
      <ServerUsersPanel
        embedded
        serverId={String(serverId)}
        serverName={detail.$status === 'success' ? detail.host.name : undefined}
      />
    </Suspense>
  );
}
