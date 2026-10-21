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
  /** Worst single machine in this bucket, or null if none reported. */
  max: number | null;
}

export interface FleetResourceSeries {
  resource: FleetResource;
  points: FleetPoint[];
  /** Latest bucket that actually had a reading. */
  currentAvg?: number;
  currentMax?: number;
  /** Worst reading anywhere in the window, and the machine that produced it. */
  peak?: number;
  peakMachineId?: string;
  peakMachineHostname?: string;
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
    max: keyof DTOs.FleetUtilisationPointV2;
  }
> = {
  cpu: { avg: 'cpu_avg', max: 'cpu_max' },
  memory: { avg: 'memory_avg', max: 'memory_max' },
  disk: { avg: 'disk_avg', max: 'disk_max' },
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
    const points: FleetPoint[] = rawPoints.map(({ point, time }) => {
      // A bucket with no machines reporting is a real gap, not a zero
      // reading, so it is plotted as null and the line breaks there.
      const reported = (point.machines ?? 0) > 0;
      return {
        time,
        avg: reported ? numberOrNull(point[keys.avg]) : null,
        max: reported ? numberOrNull(point[keys.max]) : null,
      };
    });

    const withReading = points.filter((point) => point.avg != null);
    const latest = withReading.at(-1);
    const peakEntry = payload?.peak?.[resource];

    resources[resource] = {
      resource,
      points,
      currentAvg: latest?.avg ?? undefined,
      currentMax: latest?.max ?? undefined,
      peak: peakEntry?.percent,
      peakMachineId: peakEntry?.machine_id,
      peakMachineHostname: peakEntry?.machine_hostname,
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

/**
 * Whether the peak is worth naming next to the chart. A peak only matters
 * when it is both above the warning line and meaningfully worse than the
 * average, otherwise it is just the fleet reading twice.
 */
export function shouldNamePeak(series: FleetResourceSeries) {
  if (series.peak == null || !series.peakMachineId) return false;
  if (series.peak < FLEET_WARNING_PERCENT) return false;
  if (series.currentAvg == null) return true;
  return series.peak - series.currentAvg >= 5;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, value));
}
