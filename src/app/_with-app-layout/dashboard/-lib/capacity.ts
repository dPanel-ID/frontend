/**
 * Capacity reporting for the dashboard.
 *
 * A fleet average hides the server that is about to fall over: eleven idle
 * machines and one at 98% average out to a comfortable number. Everything
 * here reports the worst case and names the machines behind it instead.
 */

/** Utilisation dimensions the dashboard reports on, in reading order. */
export type CapacityMetric = 'memory' | 'cpu' | 'disk';

export const CAPACITY_METRICS: readonly CapacityMetric[] = [
  'memory',
  'cpu',
  'disk',
];

/** At or above this percentage a server is reported as under pressure. */
export const CAPACITY_PRESSURE_PERCENT = 85;

/** The latest reading for one server. Missing dimensions stay undefined. */
export interface ServerUsageSample {
  serverId: string;
  serverName: string;
  cpu?: number;
  memory?: number;
  disk?: number;
}

export interface CapacityReading {
  serverId: string;
  serverName: string;
  value: number;
}

export interface CapacityMetricReport {
  metric: CapacityMetric;
  /** How many sampled servers returned a reading for this dimension. */
  reporting: number;
  /** Servers at or above the threshold, worst first. */
  pressured: CapacityReading[];
  /** The highest reading, present whenever anything reported. */
  highest?: CapacityReading;
}

/**
 * Worst-case report per dimension. Readings that are not finite numbers are
 * dropped rather than counted as zero, so a broken probe cannot make a busy
 * fleet look idle.
 */
export function buildCapacityReport(
  samples: ServerUsageSample[],
  threshold: number = CAPACITY_PRESSURE_PERCENT,
): CapacityMetricReport[] {
  return CAPACITY_METRICS.map((metric) => {
    const readings = samples
      .map((sample) => toReading(sample, metric))
      .filter((reading): reading is CapacityReading => reading != null)
      .sort(byValueDescending);

    return {
      metric,
      reporting: readings.length,
      pressured: readings.filter((reading) => reading.value >= threshold),
      highest: readings[0],
    };
  });
}

function toReading(
  sample: ServerUsageSample,
  metric: CapacityMetric,
): CapacityReading | undefined {
  const value = sample[metric];
  if (value == null || !Number.isFinite(value)) return undefined;

  return {
    serverId: sample.serverId,
    serverName: sample.serverName,
    value,
  };
}

/** Worst first, then by name so equal readings keep a stable order. */
function byValueDescending(left: CapacityReading, right: CapacityReading) {
  if (right.value !== left.value) return right.value - left.value;
  return left.serverName.localeCompare(right.serverName);
}
