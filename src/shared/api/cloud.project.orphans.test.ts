import { describe, expect, it } from 'vitest';

import { recipe as listRecipe } from './cloud.project.orphans.$id';
import { recipe as deleteRecipe } from './cloud.project.orphans.$id.delete';
import { recipe as executionRecipe } from './cloud.project.orphans.$id.executions.$executionId';
import { recipe as agentInstallRecipe } from './server.agent-install';

describe('cloud project orphan VM recipes', () => {
  it('scans every region without a region', () => {
    expect(listRecipe({ cloudProjectId: '7' })).toEqual({
      url: '/v1/cloud/project/detail/7/orphans',
    });
  });

  it('scans one region and encodes the path', () => {
    expect(
      listRecipe({ cloudProjectId: '7/../8', region: ' us-east-1 ' }),
    ).toEqual({
      url: '/v1/cloud/project/detail/7%2F..%2F8/orphans?region=us-east-1',
    });
  });

  it('posts the VM and its typed confirmation', () => {
    expect(
      deleteRecipe({
        cloudProjectId: '7',
        instanceId: 'i-123',
        name: 'web-1',
        region: 'us-east-1',
        confirm: 'web-1',
      }),
    ).toEqual({
      method: 'POST',
      url: '/v1/cloud/project/detail/7/orphans/delete',
      data: {
        instance_id: 'i-123',
        name: 'web-1',
        region: 'us-east-1',
        confirm: 'web-1',
      },
    });
  });

  it('reads the deletion execution', () => {
    expect(
      executionRecipe({ cloudProjectId: '7', executionId: 'ex/1' }).url,
    ).toBe('/v1/cloud/project/detail/7/orphans/executions/ex%2F1');
  });
});

describe('server agent install recipe', () => {
  it('sends the trimmed name', () => {
    expect(agentInstallRecipe({ hostname: ' home-server ' })).toEqual({
      method: 'POST',
      url: '/v1/server/agent-install',
      data: { hostname: 'home-server' },
    });
  });

  it('sends an empty body without a name', () => {
    expect(agentInstallRecipe({}).data).toEqual({});
  });
});
