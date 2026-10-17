import { Suspense } from 'react';

import { ServerLogViewer } from '@/features/server-log-viewer-sidepanel';

import { useServerDataModel } from '../../../-model/server-data';
import { PanelFallback } from '../_PanelFallback';

export default function LogsTab() {
  const [serverId] = useServerDataModel((s) => [s.serverId]);

  return (
    <Suspense fallback={<PanelFallback />}>
      <ServerLogViewer
        serverId={String(serverId)}
        className="h-[72svh] min-h-[32rem] rounded-2xl border"
      />
    </Suspense>
  );
}
