import { describe, expect, it } from 'vitest';

import { splitFrontmatter } from './frontmatter';

describe('splitFrontmatter', () => {
  it.each([
    {
      name: 'plain values',
      source: '---\ntitle: Servers\nsidebar_position: 2\n---\n\nBody',
      data: { title: 'Servers', sidebar_position: '2' },
      body: 'Body',
    },
    {
      name: 'quoted values keep their colons and quotes',
      source:
        "---\ntitle: \"Step 1: connect\"\ndescription: 'It''s quick'\n---\nBody",
      data: { title: 'Step 1: connect', description: "It's quick" },
      body: 'Body',
    },
    {
      name: 'comments and blank lines',
      source: '---\n# a note\n\nslug: overview\n---\nBody',
      data: { slug: 'overview' },
      body: 'Body',
    },
    {
      name: 'Windows line endings and a byte-order mark',
      source: '\uFEFF---\r\ntitle: Hi\r\n---\r\nBody\r\n',
      data: { title: 'Hi' },
      body: 'Body\n',
    },
    {
      name: 'no frontmatter at all',
      source: '# Just markdown',
      data: {},
      body: '# Just markdown',
    },
  ])('reads $name', ({ body, data, source }) => {
    expect(splitFrontmatter(source)).toEqual({ data, body });
  });

  it.each([
    ['an unclosed block', '---\ntitle: Hi\nBody'],
    ['a line that is not key: value', '---\n- list item\n---\nBody'],
  ])('rejects %s rather than misreading it', (_, source) => {
    expect(() => splitFrontmatter(source)).toThrow();
  });
});
