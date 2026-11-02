import { describe, expect, it } from 'vitest';

import { summarizeCloudProjects } from '../-model/overview';

import {
  cloudStatusBucket,
  cloudStatusKey,
  cloudStatusTone,
  toCloudProjectCard,
} from './describe-cloud-project';

const FALLBACK = 'Cloud account';
const UNKNOWN = 'Unknown provider';

describe('toCloudProjectCard', () => {
  it('maps a complete account', () => {
    const card = toCloudProjectCard(
      {
        id: 12,
        name: '  Production  ',
        provider: 'IDCloudHost',
        installer_status: 'ready',
        user: { fullname: 'Dina' },
        workspace: { name: 'Platform' },
        workspace_type: 'group',
        workspace_id: 'group-7',
        created_at: '2026-01-02 03:04:05',
        updated_at: '2026-02-03 04:05:06',
      },
      FALLBACK,
      UNKNOWN,
    );

    expect(card).toMatchObject({
      id: '12',
      name: 'Production',
      provider: 'IDCloudHost',
      providerLabel: 'IDCloudHost',
      status: 'ready',
      owner: { name: 'Dina' },
      teamName: 'Platform',
      teamId: 'group-7',
      sharedWithTeam: true,
    });
  });

  it('drops records without an ID, which nothing can act on', () => {
    expect(
      toCloudProjectCard({ name: 'orphan' }, FALLBACK, UNKNOWN),
    ).toBeNull();
    expect(toCloudProjectCard({ id: '' }, FALLBACK, UNKNOWN)).toBeNull();
  });

  it('keeps an unrecognised provider readable', () => {
    const card = toCloudProjectCard(
      { id: 1, name: 'lab', provider: 'openstack' },
      FALLBACK,
      UNKNOWN,
    );

    expect(card?.providerLabel).toBe('openstack');
  });

  it('falls back to the unknown label when no provider is reported', () => {
    const card = toCloudProjectCard({ id: 2, name: 'lab' }, FALLBACK, UNKNOWN);

    expect(card?.provider).toBeNull();
    expect(card?.providerLabel).toBe(UNKNOWN);
  });

  it('treats a legacy empty status as a real value, not a crash', () => {
    const card = toCloudProjectCard(
      { id: 3, name: 'legacy', installer_status: '' },
      FALLBACK,
      UNKNOWN,
    );

    expect(card?.status).toBe('');
    expect(cloudStatusBucket(card!.status)).toBe('other');
  });

  it('counts an organization-scoped account as shared', () => {
    const card = toCloudProjectCard(
      { id: 4, name: 'team', organization_id: 'org-1' },
      FALLBACK,
      UNKNOWN,
    );

    expect(card?.sharedWithTeam).toBe(true);
    expect(card?.teamId).toBeNull();
  });
});

describe('cloudStatusBucket', () => {
  it('buckets the backend vocabulary', () => {
    expect(cloudStatusBucket('ready')).toBe('ready');
    expect(cloudStatusBucket('pending')).toBe('progress');
    expect(cloudStatusBucket('progress')).toBe('progress');
    expect(cloudStatusBucket('deleting')).toBe('progress');
    expect(cloudStatusBucket('failed')).toBe('failed');
    expect(cloudStatusBucket('cancelled')).toBe('failed');
  });

  it('keeps unknown and terminal values out of the healthy bucket', () => {
    expect(cloudStatusBucket('')).toBe('other');
    expect(cloudStatusBucket('deleted')).toBe('other');
    expect(cloudStatusBucket('something-new')).toBe('other');
  });
});

describe('cloudStatusTone', () => {
  it('never colours an unknown status as healthy', () => {
    expect(cloudStatusTone('ready')).toBe('success');
    expect(cloudStatusTone('progress')).toBe('info');
    expect(cloudStatusTone('failed')).toBe('danger');
    expect(cloudStatusTone('')).toBe('neutral');
    expect(cloudStatusTone('whatever')).toBe('neutral');
  });
});

describe('cloudStatusKey', () => {
  it('maps known statuses and falls back for the rest', () => {
    expect(cloudStatusKey('ready')).toBe('page.cloudProjects.status.ready');
    expect(cloudStatusKey('DELETED')).toBe('page.cloudProjects.status.deleted');
    expect(cloudStatusKey('')).toBe('page.cloudProjects.status.unknown');
  });
});

describe('summarizeCloudProjects', () => {
  const pagination = (totalItem: number) =>
    ({ total_item: totalItem }) as never;

  it('counts states and distinct providers', () => {
    const overview = summarizeCloudProjects({
      clouds: [
        { id: 1, provider: 'IDCloudHost', installer_status: 'ready' },
        { id: 2, provider: 'idcloudhost', installer_status: 'progress' },
        { id: 3, provider: 'gcp', installer_status: 'failed' },
        { id: 4, provider: 'gcp', installer_status: '' },
      ],
      pagination: pagination(4),
    });

    expect(overview).toEqual({
      total: 4,
      ready: 1,
      progress: 1,
      failed: 1,
      providers: 2,
      sampled: false,
    });
  });

  it('marks the counts as sampled when the workspace holds more', () => {
    const overview = summarizeCloudProjects({
      clouds: [{ id: 1, provider: 'aws', installer_status: 'ready' }],
      pagination: pagination(120),
    });

    expect(overview.sampled).toBe(true);
    expect(overview.total).toBe(120);
  });

  it('survives a response without any accounts', () => {
    expect(summarizeCloudProjects({ pagination: pagination(0) })).toEqual({
      total: 0,
      ready: 0,
      progress: 0,
      failed: 0,
      providers: 0,
      sampled: false,
    });
  });
});
