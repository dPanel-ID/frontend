import { describe, expect, it } from 'vitest';

import {
  envVariablesToText,
  formatEnvValue,
  isValidEnvKey,
  mapEnvTextValues,
  parseEnvText,
  quoteEnvValue,
} from './env-text';
import { SECRET_MASK } from './secret-mask';

function variablesOf(text: string) {
  return parseEnvText(text).variables;
}

describe('parseEnvText formats', () => {
  it.each([
    ['KEY="value"', 'value'],
    ["KEY='value'", 'value'],
    ['KEY=value', 'value'],
    ['export KEY="value"', 'value'],
    ['export KEY=value', 'value'],
    ['  KEY = "value"  ', 'value'],
    ['KEY=  spaced value  ', 'spaced value'],
    ['KEY=', ''],
    ['KEY=""', ''],
    ['KEY=a=b=c', 'a=b=c'],
    ['KEY="a=b # not a comment"', 'a=b # not a comment'],
    ["KEY='a \\n b'", 'a \\n b'],
    ['KEY="say \\"hi\\""', 'say "hi"'],
    ['KEY="back\\\\slash"', 'back\\slash'],
    ['KEY="line\\nbreak"', 'line\nbreak'],
    ['KEY="tab\\there"', 'tab\there'],
    ['KEY="keep \\$ as typed"', 'keep \\$ as typed'],
    ['KEY=unquoted\\nstays', 'unquoted\\nstays'],
    ['KEY=abc # a comment', 'abc'],
    ['KEY=abc\t# a comment', 'abc'],
    ['KEY="abc" # a comment', 'abc'],
    ['KEY=#fff', '#fff'],
    ['KEY=https://example.com/#top', 'https://example.com/#top'],
    ['KEY=a"b', 'a"b'],
    [`KEY=${SECRET_MASK}`, SECRET_MASK],
    [`KEY="${SECRET_MASK}"`, SECRET_MASK],
  ])('reads %s', (line, value) => {
    const parsed = parseEnvText(line);
    expect(parsed.errors).toEqual([]);
    expect(parsed.variables).toEqual([{ key: 'KEY', value }]);
  });

  it('ignores empty lines and comments, and reads Windows line ends', () => {
    expect(
      variablesOf('# header\n\nA=1\r\n   # indented comment\r\nB="2"\n\n'),
    ).toEqual([
      { key: 'A', value: '1' },
      { key: 'B', value: '2' },
    ]);
  });

  it('treats an empty "=" line as nothing (an empty row)', () => {
    const parsed = parseEnvText('A=1\n=""\n=');
    expect(parsed.errors).toEqual([]);
    expect(parsed.variables).toEqual([{ key: 'A', value: '1' }]);
    expect(parsed.entries.filter((entry) => entry.isPlaceholder)).toHaveLength(
      2,
    );
  });

  it('accepts a lowercase name and one starting with an underscore', () => {
    expect(variablesOf('_private=1\nlower_case=2')).toHaveLength(2);
  });
});

describe('parseEnvText errors', () => {
  it('names the line of a missing "="', () => {
    expect(parseEnvText('A=1\n\nNOT_A_VARIABLE').errors).toEqual([
      { line: 3, code: 'missingEquals' },
    ]);
  });

  it('flags a missing name', () => {
    expect(parseEnvText('="value"').errors).toEqual([
      { line: 1, code: 'missingKey' },
    ]);
  });

  it.each(['1KEY=x', 'MY-KEY=x', 'MY KEY=x', 'KEY.NAME=x', 'KÉY=x'])(
    'flags the invalid name in %s',
    (line) => {
      expect(parseEnvText(line).errors).toEqual([
        { line: 1, code: 'invalidKey', key: line.slice(0, line.indexOf('=')) },
      ]);
    },
  );

  it('names both lines of a duplicate key', () => {
    const lines = Array.from({ length: 20 }, (_, index) => `K${index}=v`);
    lines[7] = 'APP_KEY=one';
    lines[19] = 'APP_KEY=two';
    expect(parseEnvText(lines.join('\n')).errors).toEqual([
      { line: 20, code: 'duplicateKey', key: 'APP_KEY', firstLine: 8 },
    ]);
  });

  it('flags a quote that is never closed', () => {
    expect(parseEnvText('A="open\nB=2').errors).toEqual([
      { line: 1, code: 'unclosedQuote', key: 'A' },
    ]);
    expect(parseEnvText("A='open").errors).toEqual([
      { line: 1, code: 'unclosedQuote', key: 'A' },
    ]);
  });

  it('explains a value written over several lines, once', () => {
    const parsed = parseEnvText(
      'CERT="-----BEGIN-----\nMIIB\n-----END-----"\nNEXT=1',
    );
    expect(parsed.errors).toEqual([
      { line: 1, code: 'multiline', key: 'CERT' },
    ]);
    expect(parsed.variables).toEqual([{ key: 'NEXT', value: '1' }]);
  });

  it('flags text after the closing quote', () => {
    expect(parseEnvText('A="one"two').errors).toEqual([
      { line: 1, code: 'textAfterQuote', key: 'A' },
    ]);
  });

  it('reports every bad line', () => {
    expect(
      parseEnvText('oops\n1A=x\nB=1\nB=2').errors.map((error) => error.line),
    ).toEqual([1, 2, 4]);
  });
});

describe('round trip', () => {
  const tricky = [
    { key: 'PLAIN', value: 'value' },
    { key: 'EMPTY', value: '' },
    { key: 'SPACES', value: '  padded  ' },
    { key: 'QUOTES', value: `He said "hi" and 'bye'` },
    { key: 'BACKSLASH', value: 'C:\\path\\n\\"' },
    { key: 'NEWLINES', value: 'one\ntwo\r\nthree\tfour' },
    { key: 'HASH', value: 'a # b #c' },
    { key: 'EQUALS', value: 'a=b==' },
    { key: 'UNICODE', value: 'héllo ✓ 你好' },
    { key: 'MASKED', value: SECRET_MASK },
  ];

  it('rows to text to rows gives the same variables', () => {
    const text = envVariablesToText(tricky);
    const parsed = parseEnvText(text);
    expect(parsed.errors).toEqual([]);
    expect(parsed.variables).toEqual(tricky);
    expect(text.split('\n')).toHaveLength(tricky.length);
  });

  it('writes KEY="VALUE" lines', () => {
    expect(envVariablesToText([{ key: 'A', value: 'x "y"' }])).toBe(
      'A="x \\"y\\""',
    );
    expect(quoteEnvValue('a\nb')).toBe('"a\\nb"');
  });

  it('keeps every value through formatEnvValue in each style', () => {
    for (const quote of ['none', 'double', 'single'] as const) {
      for (const { key, value } of tricky) {
        expect(variablesOf(`${key}=${formatEnvValue(value, quote)}`)).toEqual([
          { key, value },
        ]);
      }
    }
  });
});

describe('mapEnvTextValues', () => {
  it('rewrites only the changed values and keeps comments and style', () => {
    const text = [
      '# database',
      `export DB_PASSWORD="${SECRET_MASK}" # stored`,
      `TOKEN=${SECRET_MASK}`,
      "SINGLE='keep'",
      'PORT=3000',
    ].join('\n');
    expect(
      mapEnvTextValues(text, (entry) =>
        entry.value === SECRET_MASK ? `new "${entry.key}"` : undefined,
      ),
    ).toBe(
      [
        '# database',
        'export DB_PASSWORD="new \\"DB_PASSWORD\\"" # stored',
        'TOKEN=new "TOKEN"',
        "SINGLE='keep'",
        'PORT=3000',
      ].join('\n'),
    );
  });

  it('returns the same text when nothing changes', () => {
    const text = 'A=1\nbroken line';
    expect(mapEnvTextValues(text, () => undefined)).toBe(text);
  });
});

describe('isValidEnvKey', () => {
  it('matches the API rule', () => {
    expect(isValidEnvKey('APP_KEY')).toBe(true);
    expect(isValidEnvKey('_A1')).toBe(true);
    expect(isValidEnvKey('1A')).toBe(false);
    expect(isValidEnvKey('A-B')).toBe(false);
    expect(isValidEnvKey('')).toBe(false);
  });
});
