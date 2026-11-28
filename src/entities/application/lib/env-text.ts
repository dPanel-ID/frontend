/**
 * Environment variables written as text, one variable per line.
 *
 * Accepted on each line:
 * - `KEY="value"`: double quotes, with the escapes \" \\ \n \r \t
 *   (any other backslash stays as typed);
 * - `KEY='value'`: single quotes, taken literally;
 * - `KEY=value`: no quotes (`.env` style), surrounding spaces trimmed;
 * - an optional `export ` before the name.
 *
 * Empty lines and lines starting with `#` are ignored. After a value
 * without quotes, a `#` that follows a space or tab starts a comment
 * (`KEY=abc # note` is `abc`); a `#` inside the value stays
 * (`COLOR=#fff`, `URL=https://x/#top`). To keep " #" in a value, quote it.
 *
 * A value stays on one line: a line break is written as \n inside double
 * quotes. Text made from variables always uses double quotes, so turning
 * variables into text and back gives the same variables.
 */

export interface EnvVariable {
  key: string;
  value: string;
}

/** Same rule as the dPanel CLI and API tools: letters, digits, underscore. */
const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isValidEnvKey(key: string) {
  return ENV_KEY_PATTERN.test(key);
}

export type EnvTextErrorCode =
  | 'missingEquals'
  | 'missingKey'
  | 'invalidKey'
  | 'duplicateKey'
  | 'unclosedQuote'
  | 'multiline'
  | 'textAfterQuote';

export interface EnvTextError {
  /** 1-based line number. */
  line: number;
  code: EnvTextErrorCode;
  key?: string;
  /** For duplicateKey: the line that set the key first. */
  firstLine?: number;
}

export type EnvQuote = 'none' | 'double' | 'single';

export interface EnvTextEntry {
  /** 1-based line number. */
  line: number;
  key: string;
  value: string;
  quote: EnvQuote;
  /**
   * An empty `=""` line, as an empty row writes it. It is kept so a row
   * just added does not vanish, but it is not a variable.
   */
  isPlaceholder: boolean;
  /** Raw text before the value (indent, export, key, `=`). */
  head: string;
  /** Raw text after the value (spaces, closing comment). */
  tail: string;
}

export interface ParsedEnvText {
  entries: EnvTextEntry[];
  /** Every entry that names a key, in order. */
  variables: EnvVariable[];
  errors: EnvTextError[];
}

const DOUBLE_QUOTE_ESCAPES: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  n: '\n',
  r: '\r',
  t: '\t',
};

interface QuotedValue {
  value: string;
  /** Index just after the closing quote, or -1 when it never closes. */
  end: number;
}

function readQuoted(text: string, start: number, quote: string): QuotedValue {
  let value = '';
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index]!;
    if (char === quote) return { value, end: index + 1 };
    if (quote === '"' && char === '\\' && index + 1 < text.length) {
      const next = text[index + 1]!;
      const escaped = DOUBLE_QUOTE_ESCAPES[next];
      value += escaped ?? `\\${next}`;
      index += 1;
      continue;
    }
    value += char;
  }
  return { value, end: -1 };
}

function isIgnoredLine(line: string) {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

const ASSIGNMENT_START = /^\s*(export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=/;

/**
 * The later line that closes a quote left open, as a value written over
 * several lines does; -1 when the next variable starts first.
 */
function findClosingLine(lines: string[], from: number, quote: string) {
  for (let index = from + 1; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (ASSIGNMENT_START.test(line)) return -1;
    const unescaped = quote === '"' ? line.replace(/\\[\s\S]/g, '') : line;
    if (unescaped.includes(quote)) return index;
  }
  return -1;
}

export function parseEnvText(text: string): ParsedEnvText {
  const lines = text.split(/\r?\n/);
  const entries: EnvTextEntry[] = [];
  const errors: EnvTextError[] = [];
  const firstLineOfKey = new Map<string, number>();

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index]!;
    const lineNumber = index + 1;
    if (isIgnoredLine(raw)) continue;

    const exportMatch = /^\s*export\s+/.exec(raw);
    const afterExport = exportMatch ? exportMatch[0].length : 0;
    const separator = raw.indexOf('=', afterExport);
    if (separator < 0) {
      errors.push({ line: lineNumber, code: 'missingEquals' });
      continue;
    }

    const key = raw.slice(afterExport, separator).trim();
    const rest = raw.slice(separator + 1);
    const valueStart = separator + 1 + (rest.length - rest.trimStart().length);
    const first = raw[valueStart];

    let value: string;
    let quote: EnvQuote = 'none';
    let tailStart: number;

    if (first === '"' || first === "'") {
      quote = first === '"' ? 'double' : 'single';
      const quoted = readQuoted(raw, valueStart, first);
      if (quoted.end < 0) {
        const closing = findClosingLine(lines, index, first);
        if (closing >= 0) {
          errors.push({ line: lineNumber, code: 'multiline', key });
          index = closing;
        } else {
          errors.push({ line: lineNumber, code: 'unclosedQuote', key });
        }
        continue;
      }
      value = quoted.value;
      tailStart = quoted.end;
      const after = raw.slice(quoted.end);
      if (after.trim() !== '' && !/^\s+#/.test(after)) {
        errors.push({ line: lineNumber, code: 'textAfterQuote', key });
        continue;
      }
    } else {
      const remainder = raw.slice(valueStart);
      const comment = /[ \t]#/.exec(remainder);
      const valueText = comment ? remainder.slice(0, comment.index) : remainder;
      value = valueText.trimEnd();
      tailStart = valueStart + value.length;
    }

    const isPlaceholder = key === '' && value === '';
    entries.push({
      line: lineNumber,
      key,
      value,
      quote,
      isPlaceholder,
      head: raw.slice(0, valueStart),
      tail: raw.slice(tailStart),
    });
    if (isPlaceholder) continue;

    if (key === '') {
      errors.push({ line: lineNumber, code: 'missingKey' });
      continue;
    }
    if (!isValidEnvKey(key)) {
      errors.push({ line: lineNumber, code: 'invalidKey', key });
      continue;
    }
    const firstLine = firstLineOfKey.get(key);
    if (firstLine !== undefined) {
      errors.push({ line: lineNumber, code: 'duplicateKey', key, firstLine });
      continue;
    }
    firstLineOfKey.set(key, lineNumber);
  }

  return {
    entries,
    variables: entries
      .filter((entry) => !entry.isPlaceholder && entry.key !== '')
      .map((entry) => ({ key: entry.key, value: entry.value })),
    errors,
  };
}

/** A value in double quotes, escaped so it reads back the same. */
export function quoteEnvValue(value: string) {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `"${escaped}"`;
}

/** Whether a value reads back the same without quotes. */
function isSafeUnquoted(value: string) {
  return !/^\s|\s$|[\r\n\t]|\s#|^["']/.test(value);
}

/**
 * A value for an existing line: keeps a line without quotes unquoted when
 * the new value allows it, and uses double quotes otherwise.
 */
export function formatEnvValue(value: string, quote: EnvQuote = 'double') {
  if (quote === 'none' && isSafeUnquoted(value)) return value;
  if (quote === 'single' && !/['\r\n]/.test(value)) return `'${value}'`;
  return quoteEnvValue(value);
}

/** One `KEY="value"` line per variable. */
export function envVariablesToText(variables: EnvVariable[]) {
  return variables
    .map((variable) => `${variable.key}=${quoteEnvValue(variable.value)}`)
    .join('\n');
}

/**
 * Rewrites the value of each line for which `next` returns a new value,
 * keeping every other line, comment and spacing as it was.
 */
export function mapEnvTextValues(
  text: string,
  next: (entry: EnvTextEntry) => string | undefined,
) {
  const { entries } = parseEnvText(text);
  if (entries.length === 0) return text;
  const lines = text.split(/\r?\n/);
  let changed = false;
  for (const entry of entries) {
    if (entry.isPlaceholder) continue;
    const value = next(entry);
    if (value === undefined || value === entry.value) continue;
    lines[entry.line - 1] =
      entry.head + formatEnvValue(value, entry.quote) + entry.tail;
    changed = true;
  }
  return changed ? lines.join('\n') : text;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sets each KEY=value in env text: a line that already sets KEY (with or
 * without "export") is replaced where it stands, any other key is added at
 * the end. Other lines and comments stay as they are. A value is quoted
 * only when it would not read back the same without quotes.
 */
export function upsertEnvText(
  text: string,
  entries: Array<[string, string]>,
): string {
  const lines = text === '' ? [] : text.replace(/\n+$/, '').split('\n');
  const missing: string[] = [];
  for (const [key, value] of entries) {
    const pattern = new RegExp(`^\\s*(export\\s+)?${escapeRegExp(key)}\\s*=`);
    let found = false;
    for (let index = 0; index < lines.length; index += 1) {
      if (!pattern.test(lines[index] ?? '')) continue;
      lines[index] = `${key}=${formatEnvValue(value, 'none')}`;
      found = true;
    }
    if (!found) missing.push(`${key}=${formatEnvValue(value, 'none')}`);
  }
  return [...lines, ...missing].join('\n');
}
