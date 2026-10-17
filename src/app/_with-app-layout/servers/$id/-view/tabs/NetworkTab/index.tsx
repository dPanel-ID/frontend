import { Suspense } from 'react';

import { ServerNetworksPanel } from '@/features/server-networks-sidepanel';

import { useServerDataModel } from '../../../-model/server-data';
import { PanelFallback } from '../_PanelFallback';

export default function NetworkTab() {
  const [serverId, detail] = useServerDataModel((s) => [s.serverId, s.detail]);

  return (
    <Suspense fallback={<PanelFallback />}>
      <ServerNetworksPanel
        embedded
        serverId={String(serverId)}
        serverName={detail.$status === 'success' ? detail.host.name : undefined}
      />
    </Suspense>
  );
}
