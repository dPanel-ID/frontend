import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';

import { remarkAdmonitions } from './remark-admonitions';

function run(tree: Root) {
  remarkAdmonitions()(tree);
  return tree;
}

function admonition(name: string, label?: string): Root {
  return {
    type: 'root',
    children: [
      {
        type: 'containerDirective',
        name,
        attributes: {},
        children: [
          ...(label
            ? [
                {
                  type: 'paragraph' as const,
                  data: { directiveLabel: true },
                  children: [{ type: 'text' as const, value: label }],
                },
              ]
            : []),
          { type: 'paragraph', children: [{ type: 'text', value: 'Body' }] },
        ],
      },
    ],
  };
}

describe('remarkAdmonitions', () => {
  it.each([
    ['note', 'info'],
    ['tip', 'info'],
    ['info', 'info'],
    ['warning', 'warning'],
    ['danger', 'danger'],
  ])('draws :::%s in the %s callout tone', (name, tone) => {
    const [node] = run(admonition(name)).children;

    expect(node?.data).toMatchObject({
      hName: 'aside',
      hProperties: { dataCallout: tone, dataKind: name, dataTitle: '' },
    });
  });

  it('lifts the [label] into the callout title and out of the body', () => {
    const [node] = run(admonition('warning', 'Choose the password')).children;

    expect(node?.data).toMatchObject({
      hProperties: { dataTitle: 'Choose the password' },
    });
    expect(node && 'children' in node ? node.children : []).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'Body' }] },
    ]);
  });

  it('keeps the content of an unknown container as plain paragraphs', () => {
    const tree = run(admonition('details', 'Ignored'));

    expect(tree.children).toEqual([
      { type: 'paragraph', children: [{ type: 'text', value: 'Body' }] },
    ]);
  });

  it('puts a stray :name in prose back as the text the author wrote', () => {
    const tree = run({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'Open ' },
            {
              type: 'textDirective',
              name: 'port',
              attributes: {},
              children: [{ type: 'text', value: '80' }],
            },
            { type: 'text', value: ' now' },
          ],
        },
        { type: 'leafDirective', name: 'x', attributes: {}, children: [] },
      ],
    });

    expect(tree.children).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Open ' },
          { type: 'text', value: ':port' },
          { type: 'text', value: '[' },
          { type: 'text', value: '80' },
          { type: 'text', value: ']' },
          { type: 'text', value: ' now' },
        ],
      },
      { type: 'paragraph', children: [{ type: 'text', value: '::x' }] },
    ]);
  });
});
