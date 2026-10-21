import { useEffect } from 'react';

import { ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';

import { isPendingResponse, responseData } from '../../-lib/api-response';
import { sanitizePercent } from '../../-lib/percent';
import { TELEMETRY_POLL_MS } from '../../-lib/telemetry';
import type { TelemetrySample } from '../../-lib/telemetry';

/**
 * Reads one server's live utilisation. Each probe owns its own requests and
 * reports the latest reading up, including the case where nothing answered,
 * so the capacity panel can tell "idle" from "out of contact".
 */
export default function DashboardServerTelemetryProbe(props: {
  server: DTOs.MachineV1;
  onSample: (sample: TelemetrySample) => void;
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

  const isSettled = [cpuResponse, memoryResponse, diskResponse].every(
    (response) => !isPendingResponse(response),
  );

  useEffect(() => {
    if (!shouldFetch || !isSettled) return;

    onSample({
      serverId,
      serverName: server.hostname || server.address || serverId,
      cpu,
      memory,
      disk,
      unreachable: cpu == null && memory == null && disk == null,
    });
  }, [
    cpu,
    disk,
    isSettled,
    memory,
    onSample,
    server.address,
    server.hostname,
    serverId,
    shouldFetch,
  ]);

  return null;
}
