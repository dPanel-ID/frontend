import { Suspense } from 'react';

import { ServerServicesPanel } from '@/features/server-services-sidepanel';

import { useServerDataModel } from '../../../-model/server-data';
import { PanelFallback } from '../_PanelFallback';

export default function ServicesTab() {
  const [serverId, detail] = useServerDataModel((s) => [s.serverId, s.detail]);

  return (
    <Suspense fallback={<PanelFallback />}>
      <ServerServicesPanel
        embedded
        serverId={String(serverId)}
        serverName={detail.$status === 'success' ? detail.host.name : undefined}
      />
    </Suspense>
  );
}
