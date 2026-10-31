/** A heading of a page, for its "On this page" outline. */
export interface DocsHeadingEntry {
  level: 2 | 3;
  /** The heading as plain text: Markdown emphasis, code and links removed. */
  text: string;
}

const HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

/**
 * The `##` and `###` headings of a page, in order, skipping fenced code so a
 * `## comment` inside an example is not mistaken for one.
 */
export function pageHeadings(markdown: string): DocsHeadingEntry[] {
  const headings: DocsHeadingEntry[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING.exec(line);
    if (!match?.[1] || !match[2]) continue;

    headings.push({
      level: match[1].length === 2 ? 2 : 3,
      text: plainText(match[2]),
    });
  }

  return headings;
}

function plainText(markdown: string) {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .trim();
}
