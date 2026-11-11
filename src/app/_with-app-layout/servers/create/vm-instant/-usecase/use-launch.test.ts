import { describe, expect, it } from 'vitest';

import { formSchema } from '../-model/form';
import type { FormSchema } from '../-model/form';

import { buildLaunchPayload } from './use-launch';

function values(provider: string, spec: Partial<FormSchema['spec']> = {}) {
  return {
    provider,
    cloud: { projectID: '11', sshKeyID: '33', zoneSlug: 'ap-jakarta-1' },
    // Alibaba Cloud and Tencent Cloud join over SSH only for now.
    joinMethod: 'agent',
    contract: { agentJoin: false, publicIPChoice: true },
    regionSlug: 'ap-jakarta',
    vpcBulk: { id: '', subnet: '' },
    spec: {
      vmName: 'dpanel-web-01',
      osTemplate: 'img-mmytdhbn',
      osName: 'ubuntu',
      osVersion: '24.04',
      machineType: 'SA5.MEDIUM2',
      cpuCore: 2,
      ramSizeGB: 2,
      diskSizeGB: 40,
      reservePublicIP: true,
      ...spec,
    },
    login: { username: 'dpanel', password: '' },
  } satisfies FormSchema;
}

describe('buildLaunchPayload', () => {
  it('sends the Alibaba Cloud zone, instance type and system disk', () => {
    expect(
      buildLaunchPayload(values('alibabacloud', { diskSizeGB: 60 })),
    ).toEqual({
      provider: 'alibabacloud',
      cloud_project_id: '11',
      secret_id: '33',
      vm: {
        name: 'dpanel-web-01',
        region: 'ap-jakarta',
        zone: 'ap-jakarta-1',
        instance_type: 'SA5.MEDIUM2',
        image_id: 'img-mmytdhbn',
        system_disk_size: 60,
        reserve_public_ip: true,
      },
    });
  });

  it('sends the Tencent Cloud zone and instance type, without a disk', () => {
    const payload = buildLaunchPayload(values('tencent'));
    expect(payload.vm).toEqual({
      name: 'dpanel-web-01',
      region: 'ap-jakarta',
      zone: 'ap-jakarta-1',
      instance_type: 'SA5.MEDIUM2',
      image_id: 'img-mmytdhbn',
      reserve_public_ip: true,
    });
  });
});

describe('formSchema for Alibaba Cloud and Tencent Cloud', () => {
  const issuePaths = (input: FormSchema) => {
    const result = formSchema.safeParse(input);
    return result.success
      ? []
      : result.error.issues.map((issue) => issue.path.join('.'));
  };

  it.each(['alibabacloud', 'tencent'])(
    'accepts a complete %s form',
    (provider) => {
      expect(issuePaths(values(provider))).toEqual([]);
    },
  );

  it.each(['alibabacloud', 'tencent'])(
    'asks %s for a zone, an instance type and an image',
    (provider) => {
      const input = values(provider, { machineType: '', osTemplate: '' });
      input.cloud.zoneSlug = '';
      expect(issuePaths(input)).toEqual([
        'cloud.zoneSlug',
        'spec.machineType',
        'spec.osTemplate',
      ]);
    },
  );

  it.each(['web_01', '1web', 'web-'])(
    'rejects %s, which cannot be a host name',
    (vmName) => {
      expect(issuePaths(values('tencent', { vmName }))).toContain(
        'spec.vmName',
      );
    },
  );

  it('keeps the Alibaba Cloud system disk within 40-500 GB', () => {
    expect(issuePaths(values('alibabacloud', { diskSizeGB: 20 }))).toEqual([
      'spec.diskSizeGB',
    ]);
    expect(issuePaths(values('tencent', { diskSizeGB: 20 }))).toEqual([]);
  });
});

function gcp(
  joinMethod: FormSchema['joinMethod'],
  reservePublicIP: boolean,
  sshKeyID?: string,
) {
  return {
    ...values('gcp', {
      machineType: 'e2-medium',
      osTemplate: 'ubuntu-2404',
      reservePublicIP,
    }),
    cloud: { projectID: '11', sshKeyID, zoneSlug: 'asia-southeast2-a' },
    joinMethod,
    contract: { agentJoin: true, publicIPChoice: true },
  } satisfies FormSchema;
}

describe('buildLaunchPayload join method', () => {
  it('sends join_method agent and no secret_id for an agent VM', () => {
    const payload = buildLaunchPayload(gcp('agent', false, '33'));
    expect(payload).toMatchObject({ join_method: 'agent' });
    expect(payload).not.toHaveProperty('secret_id');
    expect(payload.vm).toMatchObject({ reserve_public_ip: false });
  });

  it('sends the SSH key and a public IP for an SSH VM', () => {
    const payload = buildLaunchPayload(gcp('ssh', true, '33'));
    expect(payload).toMatchObject({ join_method: 'ssh', secret_id: '33' });
    expect(payload.vm).toMatchObject({ reserve_public_ip: true });
  });

  it('omits join_method for a provider that joins over SSH only', () => {
    const payload = buildLaunchPayload(values('tencent'));
    expect(payload).not.toHaveProperty('join_method');
    expect(payload).toMatchObject({ secret_id: '33' });
  });

  it('sends no public IP choice where the contract has none', () => {
    const input = {
      ...values('digitalocean', { machineType: 's-1vcpu-2gb' }),
      contract: { agentJoin: true, publicIPChoice: false },
    } satisfies FormSchema;
    // Undefined is left out of the JSON request body.
    expect(buildLaunchPayload(input).vm.reserve_public_ip).toBeUndefined();
  });
});

describe('formSchema join method', () => {
  const issuePaths = (input: FormSchema) => {
    const result = formSchema.safeParse(input);
    return result.success
      ? []
      : result.error.issues.map((issue) => issue.path.join('.'));
  };

  it('needs no SSH key for an agent VM', () => {
    expect(issuePaths(gcp('agent', false))).toEqual([]);
  });

  it('needs an SSH key for an SSH VM', () => {
    expect(issuePaths(gcp('ssh', true))).toEqual(['cloud.sshKeyID']);
  });

  it('refuses SSH without a public IP', () => {
    expect(issuePaths(gcp('ssh', false, '33'))).toEqual([
      'spec.reservePublicIP',
    ]);
  });

  it('needs an SSH key where the provider joins over SSH only', () => {
    const input = values('tencent');
    input.cloud.sshKeyID = '';
    expect(issuePaths(input)).toEqual(['cloud.sshKeyID']);
  });
});
