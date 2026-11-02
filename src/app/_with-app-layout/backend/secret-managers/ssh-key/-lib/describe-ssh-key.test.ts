import { describe, expect, it } from 'vitest';

import { summarizeSshKeys } from '../-model/overview';

import {
  sshKeyAlgorithmLabel,
  sshKeyAlgorithmParts,
  toSshKeyCard,
} from './describe-ssh-key';

describe('toSshKeyCard', () => {
  it('maps a complete key', () => {
    const card = toSshKeyCard(
      {
        id: 7,
        name: ' work-laptop ',
        type: 'ssh-key',
        data: { public: 'ssh-rsa AAAAB3Nza demo@laptop', length: '4096' },
        user: { fullname: 'Dina', username: 'dina', email: 'dina@example.com' },
        organization: { id: 'org-1', name: 'Platform' },
        workspace_type: 'group',
        workspace_id: 'group-1',
        created_at: '2026-01-02 03:04:05',
        updated_at: '2026-02-03 04:05:06',
      },
      'Untitled key',
    );

    expect(card).toMatchObject({
      id: 7,
      name: 'work-laptop',
      type: 'ssh-key',
      length: '4096',
      owner: { name: 'Dina' },
      teamName: 'Platform',
      teamId: 'group-1',
      sharedWithTeam: true,
    });
  });

  it('drops records without an ID, which nothing can act on', () => {
    expect(toSshKeyCard({ name: 'orphan' }, 'Untitled key')).toBeNull();
  });

  it('falls back to a readable name and reports empty fields as absent', () => {
    const card = toSshKeyCard(
      { id: 1, name: '   ', type: '', data: { length: '' } },
      'Untitled key',
    );

    expect(card?.name).toBe('Untitled key');
    expect(card?.type).toBeNull();
    expect(card?.length).toBeNull();
    expect(card?.publicKey).toBeNull();
    expect(card?.sharedWithTeam).toBe(false);
  });

  it('treats a personal workspace as having no team ID', () => {
    const card = toSshKeyCard(
      { id: 2, name: 'home-mac', workspace_type: 'user', workspace_id: '9' },
      'Untitled key',
    );

    expect(card?.teamId).toBeNull();
    expect(card?.sharedWithTeam).toBe(false);
  });

  it('counts an organization-scoped key as shared even without a name', () => {
    const card = toSshKeyCard(
      { id: 3, name: 'ci', organization_id: 'org-9' },
      'Untitled key',
    );

    expect(card?.sharedWithTeam).toBe(true);
    expect(card?.teamName).toBeNull();
  });
});

describe('summarizeSshKeys', () => {
  const pagination = (totalItem: number) =>
    ({ total_item: totalItem }) as never;

  it('splits the sample into personal and team keys', () => {
    const overview = summarizeSshKeys({
      secrets: [
        { id: 1, name: 'a' },
        { id: 2, name: 'b', organization: { id: 'o', name: 'Platform' } },
        { id: 3, name: 'c', organization_id: 'o' },
      ],
      pagination: pagination(3),
    });

    expect(overview).toEqual({
      total: 3,
      personal: 1,
      team: 2,
      sampled: false,
    });
  });

  it('marks the counts as sampled when the workspace holds more keys', () => {
    const overview = summarizeSshKeys({
      secrets: [{ id: 1, name: 'a' }],
      pagination: pagination(120),
    });

    expect(overview.sampled).toBe(true);
    expect(overview.total).toBe(120);
  });

  it('survives a response without any keys', () => {
    expect(summarizeSshKeys({ pagination: pagination(0) })).toEqual({
      total: 0,
      personal: 0,
      team: 0,
      sampled: false,
    });
  });
});

describe('sshKeyAlgorithmLabel', () => {
  it('names an Ed25519 key without inventing a size', () => {
    expect(sshKeyAlgorithmLabel({ algorithm: 'ed25519', length: null })).toBe(
      'Ed25519',
    );
  });

  it('puts the size next to RSA, where it means something', () => {
    expect(sshKeyAlgorithmLabel({ algorithm: 'rsa', length: '4096' })).toBe(
      'RSA 4096',
    );
    expect(sshKeyAlgorithmLabel({ algorithm: 'RSA', length: null })).toBe(
      'RSA',
    );
  });

  it('says nothing for a key whose algorithm the backend could not read', () => {
    expect(
      sshKeyAlgorithmLabel({ algorithm: null, length: '4096' }),
    ).toBeNull();
  });

  it('passes through an algorithm it does not know', () => {
    expect(
      sshKeyAlgorithmLabel({ algorithm: 'ecdsa-sha2-nistp256', length: null }),
    ).toBe('ecdsa-sha2-nistp256');
  });
});

describe('sshKeyAlgorithmParts', () => {
  it('leaves Ed25519 without a second line, because it has no size', () => {
    expect(
      sshKeyAlgorithmParts({ algorithm: 'ed25519', length: null }),
    ).toEqual({ name: 'Ed25519', detail: null });
  });

  it('moves the RSA size off the value, which is the narrow slot', () => {
    expect(sshKeyAlgorithmParts({ algorithm: 'rsa', length: '4096' })).toEqual({
      name: 'RSA',
      detail: '4096 bits',
    });
    expect(sshKeyAlgorithmParts({ algorithm: 'rsa', length: null })).toEqual({
      name: 'RSA',
      detail: null,
    });
  });

  it('keeps an unknown algorithm out of the value, where it would be cut', () => {
    expect(
      sshKeyAlgorithmParts({ algorithm: 'ecdsa-sha2-nistp256', length: null }),
    ).toEqual({ name: 'SSH key', detail: 'ecdsa-sha2-nistp256' });
  });

  it('says nothing for a key whose algorithm the backend could not read', () => {
    expect(sshKeyAlgorithmParts({ algorithm: null, length: '4096' })).toEqual({
      name: null,
      detail: null,
    });
  });
});
