export const POLL_INTERVAL_MS__CPU = 2000;
export const POLL_INTERVAL_MS__MEMORY = 2000;
export const POLL_INTERVAL_MS__DISK = 5000;

/**
 * Usage on a server list card. The agent reports usage with its heartbeat,
 * every 30 seconds, so polling faster only repeats the same reading.
 */
export const POLL_INTERVAL_MS__SERVER_CARD = 30_000;
