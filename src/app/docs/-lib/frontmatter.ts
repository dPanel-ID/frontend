/**
 * Splits a Markdown file into its frontmatter and its body.
 *
 * Documentation frontmatter is a flat list of `key: value` lines, which is
 * all Docusaurus pages need here (`title`, `description`, `sidebar_position`,
 * `slug`). A full YAML parser would be a dependency for four keys, so this
 * reads exactly that subset: one key per line, optionally quoted values, and
 * `#` comments. Anything richer is rejected rather than misread.
 */

export interface MarkdownFile {
  data: Record<string, string>;
  body: string;
}

const FENCE = '---';

export function splitFrontmatter(source: string): MarkdownFile {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');

  if (lines[0]?.trim() !== FENCE) {
    return { data: {}, body: text };
  }

  const end = lines.findIndex(
    (line, index) => index > 0 && line.trim() === FENCE,
  );
  if (end < 0) {
    throw new Error('Frontmatter starts with --- but never closes.');
  }

  const data: Record<string, string> = {};
  for (const raw of lines.slice(1, end)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const match = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!match) {
      throw new Error(`Frontmatter line is not "key: value": ${line}`);
    }

    const [, key = '', value = ''] = match;
    data[key] = unquote(value.trim());
  }

  return {
    data,
    body: lines
      .slice(end + 1)
      .join('\n')
      .replace(/^\n+/, ''),
  };
}

function unquote(value: string) {
  const quote = value[0];
  if (
    (quote === '"' || quote === "'") &&
    value.endsWith(quote) &&
    value.length > 1
  ) {
    const inner = value.slice(1, -1);
    return quote === '"'
      ? inner.replace(/\\"/g, '"')
      : inner.replace(/''/g, "'");
  }

  return value;
}
