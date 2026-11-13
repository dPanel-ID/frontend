import { describe, expect, it } from 'vitest';

import {
  SECRET_MASK,
  hideRevealedEnvText,
  hideRevealedValues,
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

describe('hideRevealedValues', () => {
  it('masks unchanged revealed values and keeps edits', () => {
    const shown = [
      { key: 'DB_PASSWORD', value: 'secret' },
      { key: 'LOG_LEVEL', value: 'info' },
    ];
    expect(
      hideRevealedValues(
        [
          { key: 'DB_PASSWORD', value: 'secret' },
          { key: 'LOG_LEVEL', value: 'warn' },
          { key: 'NEW', value: 'typed' },
        ],
        shown,
      ),
    ).toEqual([
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'LOG_LEVEL', value: 'warn' },
      { key: 'NEW', value: 'typed' },
    ]);
  });

  it('round-trips with revealMaskedValues', () => {
    const shown = [{ key: 'A', value: 'x=1' }];
    const masked = [{ key: 'A', value: SECRET_MASK }];
    expect(
      hideRevealedValues(revealMaskedValues(masked, shown), shown),
    ).toEqual(masked);
  });
});

describe('hideRevealedEnvText', () => {
  it('masks unchanged lines only', () => {
    const shown = [
      { key: 'A', value: 'one' },
      { key: 'B', value: 'two' },
    ];
    expect(hideRevealedEnvText('A=one\nB=changed\nC=three', shown)).toBe(
      `A=${SECRET_MASK}\nB=changed\nC=three`,
    );
  });
});
