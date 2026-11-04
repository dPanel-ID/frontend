import { describe, expect, it } from 'vitest';

import {
  toHostGroupDetail,
  toHostGroupOperation,
  toHostGroupSummary,
} from './index';

describe('host-group adapter', () => {
  it('maps a host-group summary with explicit member count', () => {
    expect(
      toHostGroupSummary({
        id: 'hg_1',
        name: 'Production',
        description: 'Primary API fleet',
        workspace_id: 'org_1',
        workspace_type: 'group',
        member_count: 2,
        created_at: '2026-08-15T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
        members: [
          { id: '44', hostname: 'api-01' },
          { id: '45', hostname: 'api-02' },
        ],
      }).unwrap(),
    ).toMatchObject({
      id: 'hg_1',
      name: 'Production',
      description: 'Primary API fleet',
      memberCount: 2,
    });
  });

  it('maps the cluster summary of a cluster group', () => {
    const group = toHostGroupSummary({
      id: 'hg_2',
      name: 'Edge',
      workspace_id: 'org_1',
      workspace_type: 'group',
      cluster: {
        id: 'cl_1',
        kind: 'kubernetes',
        engine: 'k3s',
        status: 'ready',
      },
      created_at: '2026-08-15T10:00:00Z',
      updated_at: '2026-08-16T10:00:00Z',
    }).unwrap();

    expect(group.cluster).toEqual({
      id: 'cl_1',
      kind: 'kubernetes',
      engine: 'k3s',
      status: 'ready',
    });
  });

  it('leaves generic groups without a cluster', () => {
    const group = toHostGroupSummary({
      id: 'hg_3',
      name: 'Fleet',
      workspace_id: 'org_1',
      workspace_type: 'group',
      cluster: null,
      created_at: '2026-08-15T10:00:00Z',
      updated_at: '2026-08-16T10:00:00Z',
    }).unwrap();

    expect(group.cluster).toBeUndefined();
  });

  it('maps host-group detail members with current assignment visibility', () => {
    expect(
      toHostGroupDetail({
        id: 'hg_1',
        name: 'Production',
        description: 'Primary API fleet',
        workspace_id: 'org_1',
        workspace_type: 'group',
        member_count: 2,
        created_at: '2026-08-15T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
        members: [
          {
            id: '44',
            hostname: 'api-01',
            status: 'ready',
            host_group_id: 'hg_1',
          },
          {
            id: '45',
            hostname: 'api-02',
            status: 'failed',
            host_group_id: 'hg_existing',
          },
        ],
      }).unwrap(),
    ).toMatchObject({
      id: 'hg_1',
      members: [
        {
          id: '44',
          hostname: 'api-01',
          currentHostGroupId: 'hg_1',
        },
        {
          id: '45',
          hostname: 'api-02',
          currentHostGroupId: 'hg_existing',
        },
      ],
    });
  });

  it('maps a host-group operation with per-server targets', () => {
    expect(
      toHostGroupOperation({
        operation: {
          id: 'hgo_1',
          host_group_id: 'hg_1',
          workspace_id: 'org_1',
          workspace_type: 'group',
          type: 'module.install',
          status: 'running',
          request: {
            action: 'install',
          },
          target_count: 2,
          succeeded_count: 1,
          failed_count: 0,
          created_at: '2026-08-16T09:00:00Z',
          updated_at: '2026-08-16T09:05:00Z',
        },
        targets: [
          {
            id: 'hgot_1',
            operation_id: 'hgo_1',
            machine_id: '44',
            status: 'succeeded',
            execution_id: 'exec_1',
            created_at: '2026-08-16T09:00:00Z',
            updated_at: '2026-08-16T09:01:00Z',
          },
          {
            id: 'hgot_2',
            operation_id: 'hgo_1',
            machine_id: '45',
            status: 'running',
            execution_id: 'exec_2',
            created_at: '2026-08-16T09:00:00Z',
            updated_at: '2026-08-16T09:05:00Z',
          },
        ],
      }).unwrap(),
    ).toMatchObject({
      id: 'hgo_1',
      hostGroupId: 'hg_1',
      status: 'running',
      targetCount: 2,
      targets: [
        {
          id: 'hgot_1',
          serverId: '44',
          status: 'succeeded',
          executionId: 'exec_1',
        },
        {
          id: 'hgot_2',
          serverId: '45',
          status: 'running',
          executionId: 'exec_2',
        },
      ],
    });
  });
});
