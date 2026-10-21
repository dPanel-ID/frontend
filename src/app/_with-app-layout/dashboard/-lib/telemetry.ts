import type { ServerUsageSample } from './capacity';

/** Ready servers probed for live utilisation. */
export const TELEMETRY_LIMIT = 8;

/**
 * Three requests per probed server make this the page's most expensive poll.
 * Utilisation moves slowly enough that a minute is plenty, and the capacity
 * panel reports the latest reading rather than drawing a trend, so nothing
 * needs a dense history.
 */
export const TELEMETRY_POLL_SECONDS = 60;
export const TELEMETRY_POLL_MS = TELEMETRY_POLL_SECONDS * 1000;

/**
 * One server's latest reading. `unreachable` separates a server that is idle
 * from one that answered nothing, which an absent reading alone cannot say.
 */
export interface TelemetrySample extends ServerUsageSample {
  unreachable: boolean;
}
