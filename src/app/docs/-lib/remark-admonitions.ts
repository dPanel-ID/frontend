import type { Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive';
import { SKIP, visit } from 'unist-util-visit';

import { ADMONITION_TONES, isDocsAdmonition } from '../-rules/content';

/**
 * Turns Docusaurus admonitions into callouts.
 *
 * `remark-directive` reads `:::warning[Title] … :::` as a container
 * directive; this plugin renders one as an `<aside>` carrying the callout
 * tone, the admonition kind and the optional title, which the page's
 * `aside` component draws in the product's callout style.
 *
 * The directive syntax also gives a meaning to `:name` and `::name` in
 * ordinary prose. Documentation never uses those, so they are put back as
 * the text the author wrote rather than silently swallowed, and an unknown
 * `:::kind` keeps its content as plain paragraphs.
 */
export function remarkAdmonitions() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      if (!parent || index === undefined) return;

      if (node.type === 'containerDirective' && isDocsAdmonition(node.name)) {
        toCallout(node, node.name);
        return;
      }

      const replacement = restore(node);
      parent.children.splice(
        index,
        1,
        ...(replacement as typeof parent.children),
      );
      return [SKIP, index + replacement.length];
    });
  };
}

function toCallout(
  node: ContainerDirective,
  kind: keyof typeof ADMONITION_TONES,
) {
  const [first, ...rest] = node.children;
  const hasLabel = first?.type === 'paragraph' && first.data?.directiveLabel;
  const title = hasLabel ? plainText(first) : '';

  if (hasLabel) node.children = rest;

  node.data = {
    ...node.data,
    hName: 'aside',
    hProperties: {
      dataCallout: ADMONITION_TONES[kind],
      dataKind: kind,
      dataTitle: title,
    },
  };
}

/** Puts a directive the docs do not use back as the text it came from. */
function restore(
  node: ContainerDirective | LeafDirective | TextDirective,
): RootContent[] {
  if (node.type === 'containerDirective') {
    return node.children.filter(
      (child) => !(child.type === 'paragraph' && child.data?.directiveLabel),
    );
  }

  const marker = node.type === 'leafDirective' ? '::' : ':';
  const label: PhrasingContent[] = node.children.length
    ? [
        { type: 'text', value: '[' },
        ...node.children,
        { type: 'text', value: ']' },
      ]
    : [];
  const phrasing: PhrasingContent[] = [
    { type: 'text', value: `${marker}${node.name}` },
    ...label,
  ];

  return node.type === 'leafDirective'
    ? [{ type: 'paragraph', children: phrasing } satisfies Paragraph]
    : phrasing;
}

function plainText(node: { children?: unknown[]; value?: unknown }): string {
  if (typeof node.value === 'string') return node.value;

  return (node.children ?? [])
    .map((child) => plainText(child as typeof node))
    .join('');
}
