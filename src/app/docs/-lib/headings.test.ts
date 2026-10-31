import { describe, expect, it } from 'vitest';

import { pageHeadings } from './headings';

describe('pageHeadings', () => {
  it('lists level 2 and 3 headings in order, as plain text', () => {
    const markdown = [
      '# Title is not listed',
      '## What you need first',
      'Text',
      '### The `dpanel-ec2` policy',
      '## 2. Connect it to [dPanel](/docs/intro) **now**',
      '#### Too deep',
    ].join('\n');

    expect(pageHeadings(markdown)).toEqual([
      { level: 2, text: 'What you need first' },
      { level: 3, text: 'The dpanel-ec2 policy' },
      { level: 2, text: '2. Connect it to dPanel now' },
    ]);
  });

  it('skips headings inside fenced code', () => {
    const markdown = ['```bash', '## not a heading', '```', '## Real'].join(
      '\n',
    );

    expect(pageHeadings(markdown)).toEqual([{ level: 2, text: 'Real' }]);
  });
});
