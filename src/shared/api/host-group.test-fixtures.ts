export const canonicalHostGroupSummary = {
  id: 'hg_1',
  name: 'Production',
  description: 'Primary API fleet',
  workspace_id: 'team-1',
  workspace_type: 'group',
  created_at: '2026-08-15T10:00:00Z',
  updated_at: '2026-08-16T10:00:00Z',
};

export const canonicalHostGroupDetail = {
  ...canonicalHostGroupSummary,
  members: [
    {
      id: '101',
      hostname: 'api-01',
      address: '10.0.0.10',
      http_port: '8080',
      ssh_port: '22',
      secret_id: 'secret-1',
      organization: {
        id: 'team-1',
        name: 'Platform',
        description: 'Main workspace',
        user_id: '44',
        user: {
          id: '44',
          username: 'ops-owner',
          fullname: 'Ops Owner',
          email: 'ops@example.com',
          register_from: 'casdoor',
          avatar_url: 'https://example.com/avatar.png',
          actived_at: '2026-08-14T09:00:00Z',
          created_at: '2026-08-14T08:00:00Z',
          updated_at: '2026-08-16T08:00:00Z',
        },
        created_at: '2026-08-14T08:00:00Z',
        updated_at: '2026-08-16T08:00:00Z',
        error: '',
        status: 'ready',
      },
      user: {
        id: '44',
        username: 'ops-owner',
        fullname: 'Ops Owner',
        email: 'ops@example.com',
        register_from: 'casdoor',
        avatar_url: 'https://example.com/avatar.png',
        actived_at: '2026-08-14T09:00:00Z',
        created_at: '2026-08-14T08:00:00Z',
        updated_at: '2026-08-16T08:00:00Z',
      },
      owner_subject: 'actor-1',
      workspace_id: 'team-1',
      workspace_type: 'group',
      host_group_id: 'hg_1',
      workspace: {
        id: 'team-1',
        type: 'group',
        name: 'Platform',
        local_organization_id: '19',
        roles: ['server-admin'],
      },
      cloud_id: 'cloud-1',
      source: 'manual',
      provider: 'hetzner',
      region_id: 'nbg1',
      region: 'Nuremberg',
      default_user: 'root',
      token: 'public-token',
      token_version: '2',
      agent_version: 'v1.2.3',
      agent: {
        upgrade_available: true,
        new_version: 'v1.2.4',
      },
      router_version: 'v0.9.0',
      distributor: 'ubuntu',
      version: '22.04',
      os_family: 'debian',
      os_codename: 'jammy',
      os_arch: 'amd64',
      kernel_name: 'linux',
      kernel_version: '6.8.0',
      inventory_refreshed_at: '2026-08-16T09:30:00Z',
      os_info: [
        {
          key: 'pretty_name',
          value: 'Ubuntu 22.04 LTS',
        },
      ],
      disks: [
        {
          device: '/dev/sda1',
          fstype: 'ext4',
          mountpoint: '/',
          opts: ['rw'],
        },
      ],
      ports: [
        {
          allow_from: '0.0.0.0/0',
          port: 22,
          process_id: 1,
          process_name: 'sshd',
          state: 'listen',
        },
      ],
      network_interfaces: [
        {
          interface_name: 'eth0',
          interface_data: [
            {
              address: '10.0.0.10',
              ip_v4: '10.0.0.10',
              ip_v6: '',
              is_global_unicast: true,
              is_interface_local_multicast: false,
              is_link_local_multicast: false,
              is_link_local_unicast: false,
              is_loopback: false,
              is_multicast: false,
              subnet: '24',
            },
          ],
        },
      ],
      status: 'ready',
      error: '',
      error_detail: {
        action: 'install',
        command: 'ansible-playbook',
        detail: '',
        event_type: 'summary',
        execution_id: 'exec_1',
        exit_code: 0,
        host: 'api-01',
        machine_id: '101',
        message: 'completed',
        module: 'nodejs',
        module_id: 'mod_1',
        organization_id: 'team-1',
        play: 'main',
        playbook: 'site.yml',
        role: 'nodejs',
        stderr: '',
        stdout: '',
        summary: 'ok',
        task: 'verify',
        task_path: 'tasks/main.yml:10',
        traceparent: '00-abc-123-01',
        type: 'ansible',
      },
      created_at: '2026-08-15T10:00:00Z',
      updated_at: '2026-08-16T10:00:00Z',
    },
  ],
};

export const canonicalRetryOperation = {
  id: 'hgop_retry_1',
  host_group_id: 'hg_1',
  workspace_id: 'team-1',
  workspace_type: 'group',
  actor_subject: 'actor-1',
  retry_of_operation_id: 'hgop_1',
  type: 'module.install',
  status: 'queued',
  request: {
    action: 'install',
    ref: {
      type: 'branch',
      name: 'main',
      expected_commit: 'abc123',
    },
    variables: {
      api_token: '[redacted]',
      version: '22.4.1',
    },
  },
  target_count: 1,
  succeeded_count: 0,
  failed_count: 0,
  created_at: '2026-08-16T10:00:00Z',
  updated_at: '2026-08-16T10:00:00Z',
};

export const canonicalRetryOperationDetail = {
  operation: canonicalRetryOperation,
  targets: [
    {
      id: 'hgot_retry_1',
      operation_id: 'hgop_retry_1',
      machine_id: '101',
      retry_of_target_id: 'hgot_1',
      execution_id: 'exec_2',
      status: 'queued',
      error: '',
      created_at: '2026-08-16T10:00:00Z',
      updated_at: '2026-08-16T10:00:00Z',
    },
  ],
};

export const canonicalHostGroupActionResponse = {
  operation_id: 'hgop_2',
  status: 'queued',
  action: 'reboot',
  command_type: 'system.reboot',
  target_count: 1,
  succeeded_count: 0,
  failed_count: 0,
  target: {
    type: 'hostgroup',
    id: 'hg_1',
  },
};

export const canonicalHostGroupExecutionDetail = {
  execution: {
    id: 'exec_1',
    type: 'module.install',
    status: 'queued',
    organization_id: 'team-1',
    actor_subject: 'actor-1',
    machine_id: '101',
    module: 'nodejs',
    module_id: 'module_1',
    started_at: '2026-08-16T10:00:00Z',
    finished_at: '2026-08-16T10:05:00Z',
    created_at: '2026-08-16T10:00:00Z',
    updated_at: '2026-08-16T10:05:00Z',
  },
  events: [],
  events_source: 'uptrace',
  events_stored: false,
  events_message:
    'Execution event history is stored in Uptrace for 30 days; PostgreSQL keeps only execution summary state.',
  events_retention_days: 30,
  events_retention_expires_at: '2026-09-15T10:00:00Z',
  events_retained: true,
  events_unavailable_reason: '',
};

export const canonicalIacRepository = {
  id: 'iacrepo_1',
  workspace_id: 'team-1',
  workspace_type: 'group',
  mode: 'managed',
  provider: 'github',
  owner: 'dPanel-ID',
  repo: 'dpanel-iac-ansible-shared-development',
  default_branch: 'main',
  active_ref: {
    type: 'branch',
    name: 'main',
    resolved_commit: '8f4f3f84b1e54e33d6c6b2b3b49f1a0f6c8a9f1d',
    last_synced_commit: '8f4f3f84b1e54e33d6c6b2b3b49f1a0f6c8a9f1d',
  },
  status: 'ready',
  error: '',
};

export const canonicalLegacyServerModuleActionResponse = {
  execution_id: 'exec_server_1',
  status: 'queued',
  module: 'nodejs',
  action: 'install',
  target: {
    type: 'server',
    id: '101',
  },
  repository: canonicalIacRepository,
};

export const canonicalModuleHostGroupActionResponse = {
  operation_id: 'hgop_module_1',
  status: 'queued',
  module: 'nodejs',
  action: 'install',
  target: {
    type: 'hostgroup',
    id: 'hg_1',
  },
  repository: canonicalIacRepository,
};

export const canonicalDeploymentHostGroupActionResponse = {
  operation_id: 'hgop_deploy_1',
  status: 'queued',
  target: {
    type: 'hostgroup',
    id: 'hg_1',
  },
};
