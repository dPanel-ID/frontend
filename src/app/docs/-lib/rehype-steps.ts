import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Numbers the items of every ordered list, so each can be drawn as the
 * house "steps" block: a numbered tile beside the text. The number is
 * stored on the item because a list item on its own cannot tell where it
 * sits in its list, and an ordered list may start at any number.
 */
export function rehypeSteps() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'ol') return;

      const start = Number(node.properties.start ?? 1) || 1;
      let step = start;

      for (const child of node.children) {
        if (child.type !== 'element' || child.tagName !== 'li') continue;
        child.properties.dataStep = step;
        step += 1;
      }
    });
  };
}
