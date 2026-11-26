import { describe, expect, it } from 'vitest';

import { envVariablesToText, parseEnvText } from './env-text';
import {
  SECRET_MASK,
  hasMaskedEnvText,
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

describe('masked values in KEY="VALUE" text', () => {
  const stored = [
    { key: 'DB_PASSWORD', value: 'p@ss "quoted" # x' },
    { key: 'PORT', value: '3000' },
  ];
  const masked = envVariablesToText(
    stored.map((item) => ({ key: item.key, value: SECRET_MASK })),
  );

  it('shows KEY="••••••••" and keeps the mask when the line is left as is', () => {
    expect(masked).toBe(`DB_PASSWORD="${SECRET_MASK}"\nPORT="${SECRET_MASK}"`);
    expect(parseEnvText(masked).variables).toEqual([
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'PORT', value: SECRET_MASK },
    ]);
    expect(hasMaskedEnvText(masked)).toBe(true);
  });

  it('reveals quoted lines with escapes and hides them again', () => {
    const shown = revealMaskedEnvText(`# db\n${masked}`, stored);
    expect(shown).toBe(
      `# db\nDB_PASSWORD="p@ss \\"quoted\\" # x"\nPORT="3000"`,
    );
    expect(parseEnvText(shown).variables).toEqual(stored);
    expect(hasMaskedEnvText(shown)).toBe(false);
    expect(hideRevealedEnvText(shown, stored)).toBe(`# db\n${masked}`);
  });

  it('keeps a value typed over a revealed one when hiding', () => {
    const shown = revealMaskedEnvText(masked, stored).replace(
      'PORT="3000"',
      'PORT="8080"',
    );
    expect(parseEnvText(hideRevealedEnvText(shown, stored)).variables).toEqual([
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'PORT', value: '8080' },
    ]);
  });

  it('does not count the mask inside a comment', () => {
    expect(hasMaskedEnvText(`# ${SECRET_MASK}\nA=1`)).toBe(false);
  });
});
