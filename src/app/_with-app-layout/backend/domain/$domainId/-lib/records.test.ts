import { describe, expect, it } from 'vitest';

import {
  highlightParts,
  isAutoTtl,
  recordTypeTone,
  splitRecordName,
} from './records';

describe('splitRecordName', () => {
  it.each([
    [
      'docs-demo.terpusat.me',
      'terpusat.me',
      { host: 'docs-demo', zone: 'terpusat.me' },
    ],
    ['a.b.terpusat.me.', 'terpusat.me', { host: 'a.b', zone: 'terpusat.me' }],
    ['terpusat.me', 'terpusat.me', { zone: 'terpusat.me' }],
    ['WWW.Terpusat.ME', 'terpusat.me', { host: 'WWW', zone: 'terpusat.me' }],
    ['other.example', 'terpusat.me', { host: 'other.example', zone: '' }],
  ])('%s in %s', (name, zone, expected) => {
    expect(splitRecordName(name, zone)).toEqual(expected);
  });
});

describe('highlightParts', () => {
  it('marks every match, ignoring case', () => {
    expect(highlightParts('demo.docs-Demo.me', 'DEMO')).toEqual([
      { text: 'demo', match: true },
      { text: '.docs-', match: false },
      { text: 'Demo', match: true },
      { text: '.me', match: false },
    ]);
  });

  it('returns the text whole without a query or a match', () => {
    expect(highlightParts('api.terpusat.me', '  ')).toEqual([
      { text: 'api.terpusat.me', match: false },
    ]);
    expect(highlightParts('api.terpusat.me', 'demo')).toEqual([
      { text: 'api.terpusat.me', match: false },
    ]);
  });
});

describe('recordTypeTone', () => {
  it.each([
    ['A', 'sky'],
    ['aaaa', 'sky'],
    ['CNAME', 'violet'],
    ['MX', 'amber'],
    ['TXT', 'emerald'],
    ['NS', 'neutral'],
  ] as const)('%s is %s', (type, tone) => {
    expect(recordTypeTone(type)).toBe(tone);
  });
});

describe('isAutoTtl', () => {
  it('treats a TTL of 1 as automatic', () => {
    expect(isAutoTtl(1)).toBe(true);
    expect(isAutoTtl(300)).toBe(false);
  });
});
