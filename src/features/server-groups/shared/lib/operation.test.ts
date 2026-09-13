import { describe, expect, it } from 'vitest';

import {
  getOperationRefreshInterval,
  getQueuedHostGroupOperationId,
} from './operation';

describe('getOperationRefreshInterval', () => {
  it('returns zero without an operation id', () => {
    expect(getOperationRefreshInterval(undefined, 'running')).toBe(0);
  });

  it('polls while the parent operation is non-terminal', () => {
    expect(getOperationRefreshInterval('hgop_1', 'running')).toBe(3000);
    expect(getOperationRefreshInterval('hgop_1', 'queued')).toBe(3000);
  });

  it('stops polling once the parent operation is terminal', () => {
    expect(getOperationRefreshInterval('hgop_1', 'succeeded')).toBe(0);
    expect(getOperationRefreshInterval('hgop_1', 'failed')).toBe(0);
    expect(getOperationRefreshInterval('hgop_1', 'cancelled')).toBe(0);
  });
});

describe('getQueuedHostGroupOperationId', () => {
  it('returns the operation id for host-group module responses', () => {
    expect(
      getQueuedHostGroupOperationId({
        operation_id: 'hgop_1',
        target: {
          type: 'hostgroup',
          id: 'hg_1',
        },
      }),
    ).toBe('hgop_1');
  });

  it('ignores responses without a host-group operation id', () => {
    expect(
      getQueuedHostGroupOperationId({
        operation_id: undefined,
      }),
    ).toBeUndefined();

    expect(
      getQueuedHostGroupOperationId({
        operation_id: 'hgop_1',
        target: {
          type: 'server',
          id: '45',
        },
      }),
    ).toBeUndefined();
  });
});
