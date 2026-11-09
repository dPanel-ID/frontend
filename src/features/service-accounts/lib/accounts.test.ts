import { describe, expect, it } from 'vitest';

import { toAccountRows, tokenStatus } from './accounts';

const now = new Date('2026-11-09T00:00:00Z');

describe('tokenStatus', () => {
  it('prefers revoked over expired', () => {
    expect(
      tokenStatus(
        {
          id: 't',
          revoked_at: '2026-01-01T00:00:00Z',
          expires_at: '2026-01-02T00:00:00Z',
        },
        now,
      ),
    ).toBe('revoked');
  });

  it('treats a past expiry as expired and no expiry as active', () => {
    expect(
      tokenStatus({ id: 't', expires_at: '2026-11-08T00:00:00Z' }, now),
    ).toBe('expired');
    expect(tokenStatus({ id: 't', expires_at: null }, now)).toBe('active');
  });
});

describe('toAccountRows', () => {
  it('lists working tokens first and tolerates missing lists', () => {
    const [first, second] = toAccountRows(
      {
        service_accounts: [
          {
            id: 'a',
            tokens: [
              { id: 'old', revoked_at: '2026-01-01T00:00:00Z' },
              { id: 'new' },
            ],
          },
          { id: 'b', tokens: null },
        ],
      },
      now,
    );

    expect(first?.tokens.map((token) => token.id)).toEqual(['new', 'old']);
    expect(second?.tokens).toEqual([]);
  });
});
