import type { DTOs } from '@/shared/api';

/** The three resources the fleet charts plot, in display order. */
export const FLEET_RESOURCES = ['cpu', 'memory', 'disk'] as const;

export type FleetResource = (typeof FLEET_RESOURCES)[number];

/** One plotted bucket of a single resource. */
export interface FleetPoint {
  /** Epoch milliseconds, for ordering and axis labels. */
  time: number;
  /** Mean across the machines reporting in this bucket, or null if none did. */
  avg: number | null;
  /**
   * The busiest server's own reading in this bucket, or null when that server
   * did not report. Never another server's reading: the line is one server.
   */
  busiest: number | null;
}

/**
 * The one server drawn next to the fleet average: the server with the highest
 * average for this resource over the selected range. The line, the name and
 * the numbers under the chart all describe this same server.
 */
export interface FleetBusiestServer {
  machineId: string;
  hostname?: string;
  /** Its average over the range. */
  average: number;
  /** The highest point on its line. */
  peak: number;
}

export interface FleetResourceSeries {
  resource: FleetResource;
  points: FleetPoint[];
  /** Latest bucket that actually had a reading. */
  currentAvg?: number;
  busiest?: FleetBusiestServer;
  /** True when no bucket in the window carried a reading. */
  isEmpty: boolean;
}

export interface FleetSeries {
  resources: Record<FleetResource, FleetResourceSeries>;
  bucket: 'hour' | 'day';
  /** Distinct machines that reported anywhere in the window. */
  machines: number;
  /** False when nothing reported at all, which differs from "everything at 0%". */
  hasData: boolean;
}

const RESOURCE_KEYS: Record<
  FleetResource,
  {
    avg: keyof DTOs.FleetUtilisationPointV2;
    busiest: keyof DTOs.FleetUtilisationPointV2;
  }
> = {
  cpu: { avg: 'cpu_avg', busiest: 'cpu_busiest' },
  memory: { avg: 'memory_avg', busiest: 'memory_busiest' },
  disk: { avg: 'disk_avg', busiest: 'disk_busiest' },
};

/** Reshapes the API payload into one series per resource. */
export function buildFleetSeries(
  payload?: DTOs.FleetUtilisationV2,
): FleetSeries {
  const rawPoints = (payload?.points ?? [])
    .map((point) => ({ point, time: Date.parse(point.timestamp) }))
    .filter((entry) => !Number.isNaN(entry.time))
    .sort((left, right) => left.time - right.time);

  const resources = {} as Record<FleetResource, FleetResourceSeries>;

  for (const resource of FLEET_RESOURCES) {
    const keys = RESOURCE_KEYS[resource];
    const busiest = busiestServer(payload?.busiest?.[resource]);
    const points: FleetPoint[] = rawPoints.map(({ point, time }) => {
      // A bucket with no machines reporting is a real gap, not a zero
      // reading, so it is plotted as null and the line breaks there.
      const reported = (point.machines ?? 0) > 0;
      return {
        time,
        avg: reported ? numberOrNull(point[keys.avg]) : null,
        busiest: reported && busiest ? numberOrNull(point[keys.busiest]) : null,
      };
    });

    const withReading = points.filter((point) => point.avg != null);
    const latest = withReading.at(-1);

    resources[resource] = {
      resource,
      points,
      currentAvg: latest?.avg ?? undefined,
      busiest: busiest && { ...busiest, peak: linePeak(points, busiest.peak) },
      isEmpty: withReading.length === 0,
    };
  }

  return {
    resources,
    bucket: payload?.bucket === 'hour' ? 'hour' : 'day',
    machines: payload?.machines ?? 0,
    hasData: Boolean(payload?.has_data),
  };
}

/**
 * The peak quoted under the chart is read off the plotted line itself, so the
 * number can never disagree with what the reader sees. The API's own figure is
 * only used when the line has no points.
 */
function linePeak(points: FleetPoint[], fallback: number) {
  const values = points
    .map((point) => point.busiest)
    .filter((value): value is number => value != null);
  return values.length ? Math.max(...values) : fallback;
}

function busiestServer(
  raw?: DTOs.FleetBusiestServerV2,
): FleetBusiestServer | undefined {
  if (!raw?.machine_id) return undefined;
  return {
    machineId: raw.machine_id,
    hostname: raw.machine_hostname || undefined,
    average: numberOrNull(raw.average) ?? 0,
    peak: numberOrNull(raw.peak) ?? 0,
  };
}

/**
 * Severity band for a utilisation percentage. The thresholds are deliberately
 * the same ones the capacity panel already uses, so a server called "close to
 * full" in one place is not called healthy in another.
 */
export type FleetSeverity = 'healthy' | 'warning' | 'critical';

export const FLEET_WARNING_PERCENT = 85;
export const FLEET_CRITICAL_PERCENT = 95;

export function fleetSeverity(percent?: number | null): FleetSeverity {
  if (percent == null) return 'healthy';
  if (percent >= FLEET_CRITICAL_PERCENT) return 'critical';
  if (percent >= FLEET_WARNING_PERCENT) return 'warning';
  return 'healthy';
}

function numberOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, value));
}
