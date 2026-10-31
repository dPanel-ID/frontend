import { describe, expect, it } from 'vitest';

import type { ServerCard } from '../rules/schema';

import { canReinstallServer } from './describeServer';

const withStatus = (status: ServerCard['state']['status']) =>
  ({ state: { status } }) as Pick<ServerCard, 'state'>;

describe('canReinstallServer', () => {
  it.each(['ready', 'failed', 'pending', 'unknown'] as const)(
    'allows reinstall when %s',
    (status) => {
      expect(canReinstallServer(withStatus(status))).toBe(true);
    },
  );

  it.each(['progress', 'cancelled', 'deleting', 'deleted'] as const)(
    'hides reinstall when %s',
    (status) => {
      expect(canReinstallServer(withStatus(status))).toBe(false);
    },
  );
});
