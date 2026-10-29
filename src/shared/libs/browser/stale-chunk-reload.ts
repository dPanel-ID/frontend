const LAST_RELOAD_KEY = 'dpanel:stale-chunk-reload-at';

/**
 * A second failure this soon after a reload means the chunk is really
 * missing, not stale, so the error is shown rather than reloading in a loop.
 */
export const STALE_CHUNK_RELOAD_COOLDOWN_MS = 30_000;

/** Whether a failed chunk load should reload the page now. */
export function shouldReloadForStaleChunk(
  lastReloadAt: number | undefined,
  now: number,
) {
  return (
    lastReloadAt === undefined ||
    now - lastReloadAt > STALE_CHUNK_RELOAD_COOLDOWN_MS
  );
}

let installed = false;

/**
 * Reloads the page once when a lazily loaded chunk fails to load. A deploy
 * replaces every hashed chunk, so a tab opened before it asks for files that
 * no longer exist; a reload picks up the new entry point and its chunks.
 */
export function installStaleChunkReload(target: Window = window) {
  if (installed) return;
  installed = true;

  target.addEventListener('vite:preloadError', (event) => {
    const now = Date.now();
    if (!shouldReloadForStaleChunk(readLastReload(target), now)) return;

    event.preventDefault();
    writeLastReload(target, now);
    target.location.reload();
  });
}

function readLastReload(target: Window) {
  try {
    const value = Number(target.sessionStorage.getItem(LAST_RELOAD_KEY));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeLastReload(target: Window, now: number) {
  try {
    target.sessionStorage.setItem(LAST_RELOAD_KEY, String(now));
  } catch {
    // Without storage the cooldown cannot be kept; reloading once is still
    // better than a dead page, and a repeat failure surfaces after it.
  }
}
