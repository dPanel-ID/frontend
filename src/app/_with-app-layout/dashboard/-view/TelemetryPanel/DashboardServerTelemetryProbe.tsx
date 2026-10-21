import { useEffect } from 'react';

import { ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';

import { responseData } from '../../-lib/api-response';
import { sanitizePercent } from '../../-lib/percent';
import { TELEMETRY_POLL_MS } from '../../-lib/telemetry';
import type { TelemetryPoint } from '../../-lib/telemetry';

export default function DashboardServerTelemetryProbe(props: {
  server: DTOs.MachineV1;
  onSample: (sample: TelemetryPoint) => void;
}) {
  const { onSample, server } = props;
  const serverId = server.id ? String(server.id) : '';
  const shouldFetch = Boolean(serverId) && server.status === 'ready';

  const [cpuResponse] = ApiServer.Origin.$Id.Cpu.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });
  const [memoryResponse] = ApiServer.Origin.$Id.Memory.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });
  const [diskResponse] = ApiServer.Origin.$Id.Disk.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });

  const cpuData = responseData(cpuResponse);
  const memoryData = responseData(memoryResponse);
  const diskData = responseData(diskResponse);
  const cpu = sanitizePercent(cpuData?.cpu_usage);
  const memory = sanitizePercent(memoryData?.used_percent);
  const disk = sanitizePercent(
    diskData?.total ? (diskData.used / diskData.total) * 100 : undefined,
  );

  useEffect(() => {
    if (!shouldFetch) return;
    if (cpu == null && memory == null && disk == null) return;

    onSample({
      serverId,
      serverName: server.hostname || server.address || serverId,
      time: Date.now(),
      cpu,
      memory,
      disk,
    });
  }, [
    cpu,
    disk,
    memory,
    onSample,
    server.address,
    server.hostname,
    serverId,
    shouldFetch,
  ]);

  return null;
}
