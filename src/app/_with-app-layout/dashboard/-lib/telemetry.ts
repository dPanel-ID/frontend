import { clampPercent } from './percent';

export const TELEMETRY_LIMIT = 8;
export const TELEMETRY_POLL_MS = 15_000;
export const MAX_HISTORY_POINTS = 24;

export interface TelemetryPoint {
  serverId: string;
  serverName: string;
  time: number;
  cpu?: number;
  memory?: number;
  disk?: number;
}

export interface AggregatedTelemetryPoint {
  time: number;
  cpu?: number;
  memory?: number;
  disk?: number;
}

export function buildAggregatedTelemetry(
  history: Record<string, TelemetryPoint[]>,
): AggregatedTelemetryPoint[] {
  const buckets = new Map<
    number,
    {
      cpu: number[];
      memory: number[];
      disk: number[];
    }
  >();

  for (const points of Object.values(history)) {
    for (const point of points) {
      const bucketKey = Math.floor(point.time / TELEMETRY_POLL_MS);
      const bucketTime = bucketKey * TELEMETRY_POLL_MS;
      const bucket = buckets.get(bucketTime) ?? {
        cpu: [],
        memory: [],
        disk: [],
      };

      if (point.cpu != null) bucket.cpu.push(point.cpu);
      if (point.memory != null) bucket.memory.push(point.memory);
      if (point.disk != null) bucket.disk.push(point.disk);
      buckets.set(bucketTime, bucket);
    }
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0] - right[0])
    .slice(-MAX_HISTORY_POINTS)
    .map(([time, bucket]) => ({
      time,
      cpu: average(bucket.cpu),
      memory: average(bucket.memory),
      disk: average(bucket.disk),
    }));
}

export function buildLatestTelemetry(
  history: Record<string, TelemetryPoint[]>,
) {
  return Object.fromEntries(
    Object.entries(history).flatMap(([serverId, points]) => {
      const latest = points.at(-1);
      return latest ? [[serverId, latest]] : [];
    }),
  );
}

export function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function chartPoints(
  points: AggregatedTelemetryPoint[],
  width: number,
  height: number,
  key: 'cpu' | 'memory' | 'disk',
) {
  const usableWidth = width - 46;
  const lastIndex = Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = 34 + (index / lastIndex) * usableWidth;
      const y = chartY(point[key] ?? 0, height);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function chartY(value: number, height: number) {
  const paddingTop = 14;
  const paddingBottom = 24;
  const usableHeight = height - paddingTop - paddingBottom;
  return paddingTop + (1 - clampPercent(value) / 100) * usableHeight;
}
