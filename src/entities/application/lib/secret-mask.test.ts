import { describe, expect, it } from 'vitest';

import {
  SECRET_MASK,
  revealMaskedEnvText,
  revealMaskedValues,
} from './secret-mask';

const revealed = [
  { key: 'DB_PASSWORD', value: 's3cret' },
  { key: 'PORT', value: '3000' },
];

describe('revealMaskedValues', () => {
  it('fills masked values and keeps what was typed', () => {
    expect(
      revealMaskedValues(
        [
          { key: 'DB_PASSWORD', value: SECRET_MASK },
          { key: 'PORT', value: '8080' },
          { key: 'NEW', value: SECRET_MASK },
        ],
        revealed,
      ),
    ).toEqual([
      { key: 'DB_PASSWORD', value: 's3cret' },
      { key: 'PORT', value: '8080' },
      { key: 'NEW', value: SECRET_MASK },
    ]);
  });
});

describe('revealMaskedEnvText', () => {
  it('fills masked lines only', () => {
    expect(
      revealMaskedEnvText(
        `DB_PASSWORD=${SECRET_MASK}\nPORT=8080\n# comment\nURL=a=b`,
        revealed,
      ),
    ).toBe('DB_PASSWORD=s3cret\nPORT=8080\n# comment\nURL=a=b');
  });
});
