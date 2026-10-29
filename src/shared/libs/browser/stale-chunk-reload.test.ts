import { describe, expect, it } from 'vitest';

import {
  STALE_CHUNK_RELOAD_COOLDOWN_MS,
  shouldReloadForStaleChunk,
} from './stale-chunk-reload';

describe('shouldReloadForStaleChunk', () => {
  const now = 1_000_000;

  it.each([
    ['nothing reloaded yet', undefined, true],
    [
      'the last reload was long ago',
      now - STALE_CHUNK_RELOAD_COOLDOWN_MS - 1,
      true,
    ],
    ['a reload just happened', now - 1_000, false],
    [
      'the cooldown has not passed',
      now - STALE_CHUNK_RELOAD_COOLDOWN_MS,
      false,
    ],
  ])('%s', (_, lastReloadAt, expected) => {
    expect(shouldReloadForStaleChunk(lastReloadAt, now)).toBe(expected);
  });
});
