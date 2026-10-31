import { describe, expect, it } from 'vitest';

import { formSchema } from '../-model/form';
import type { FormSchema } from '../-model/form';

import { buildLaunchPayload } from './use-launch';

function values(provider: string, spec: Partial<FormSchema['spec']> = {}) {
  return {
    provider,
    cloud: { projectID: '11', sshKeyID: '33', zoneSlug: 'ap-jakarta-1' },
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
