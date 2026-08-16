import { describe, expect, it } from 'vitest';

import { recipe as agentCommandRecipe } from './host-group.operation.agent-command.$operationId.$machineId';
import { recipe as executionRecipe } from './host-group.operation.execution.$operationId.$machineId';

describe('host-group operation child detail recipes', () => {
  it('builds a scoped execution detail path from operation and machine ids only', () => {
    expect(
      executionRecipe({
        machineId: 'server-1',
        operationId: 'operation-1',
      }),
    ).toEqual({
      url: '/v1/host-group-operations/operation-1/targets/server-1/execution',
    });
  });

  it('builds a scoped agent-command detail path from operation and machine ids only', () => {
    expect(
      agentCommandRecipe({
        machineId: 'server-1',
        operationId: 'operation-1',
      }),
    ).toEqual({
      url: '/v1/host-group-operations/operation-1/targets/server-1/agent-command',
    });
  });
});
