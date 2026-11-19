import { useState } from 'react';

import { AdapterOsServiceFromDto } from '@/entities/os-service/adapter';
import { AdapterServerFromDto } from '@/entities/server/adapter';
import { AGENT_CHECK_INTERVAL_MS } from '@/entities/server/lib/agentHealth';
import { moduleStatusPollMs } from '@/entities/server-modules/lib/status-polling';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

import { ApiServer, ApiService } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

export interface ServerDataModelProps {
  serverId: SchemaCommon.UnitId;
}

export const [ServerDataModelProvider, useServerDataModel] = buildSelector(
  'ServerDataModel',
)((props: ServerDataModelProps) => {
  const { serverId } = props;

  // Polled quietly while the page is open (and read again when the tab
  // returns) so the agent's last report stays current: the "stopped
  // reporting" warning trusts only a fresh reading.
  const [responseServerDetail, refreshServerDetail, detailMeta] =
    ApiServer.Detail.$Id.useGet({
      serverId,
      options: {
        refreshIntervalMs: AGENT_CHECK_INTERVAL_MS,
        silentRefresh: true,
        refetchOnVisible: true,
      },
    });

  const [responseServices, refreshServices] =
    ApiService.Origin.$ServerId.useGet({
      serverId,
      pageSize: 5,
      options: {
        skip: responseServerDetail.$status !== 'success',
      },
    });

  // Read again quietly while a module installs or uninstalls, so its status
  // turns Installed (or Failed) by itself when the job ends; no polling once
  // every module has settled.
  const [modulesPollMs, setModulesPollMs] = useState(0);
  const [responseModules, refreshModules] = ApiServer.Modules.$Id.useGet({
    serverId: String(serverId),
    options: {
      skip: responseServerDetail.$status !== 'success',
      refreshIntervalMs: modulesPollMs,
      silentRefresh: true,
      refetchOnVisible: true,
    },
  });
  const nextModulesPollMs = moduleStatusPollMs(
    responseModules.$status === 'success'
      ? responseModules.modules
      : responseModules.$status === 'loading'
        ? responseModules.prevData?.modules
        : undefined,
  );
  // Remember the latest answer during render; the next render polls (or
  // stops) according to it.
  if (nextModulesPollMs !== modulesPollMs) {
    setModulesPollMs(nextModulesPollMs);
  }

  const refreshModuleInventory = async () => {
    const result = await ApiServer.Modules.$Id.Refresh.doPost({
      serverId: String(serverId),
    });
    refreshModules();
    return result;
  };

  useSubscribe('@servers::detail/server-detail-refresh', () =>
    refreshServerDetail(),
  );

  useSubscribe('@servers::detail/server-services-refresh', () =>
    refreshServices(),
  );

  useSubscribe('@servers::detail/server-modules-refresh', () =>
    refreshModules(),
  );

  return {
    serverId,
    refreshServerDetail,
    refreshServices,
    refreshModules,
    refreshModuleInventory,
    /** When the detail was last read from the API (client clock). */
    detailCheckedAt: detailMeta.receivedAt,
    detail: useAdapter(responseServerDetail, (raw) =>
      AdapterServerFromDto.toServerDetail(raw).unwrap(),
    ),
    services: useAdapter(responseServices, (raw) => {
      const { pagination, services } = raw;

      return {
        pagination,
        list: services.map((service) =>
          AdapterOsServiceFromDto.toOsService(service).unwrap(),
        ),
      };
    }),
    modules: useAdapter(responseModules, (raw) => {
      return {
        modules: raw.modules ?? [],
        refreshed: raw.refreshed,
        observedAt: raw.observed_at,
      };
    }),
  };
});
