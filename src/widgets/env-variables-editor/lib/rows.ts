import {
  envVariablesToText,
  parseEnvText,
} from '@/entities/application/lib/env-text';
import type { EnvTextError } from '@/entities/application/lib/env-text';

export interface EnvRow {
  /** Stable React key; not part of the data. */
  id: number;
  key: string;
  value: string;
}

let nextRowId = 1;

export function newEnvRow(key = '', value = ''): EnvRow {
  const id = nextRowId;
  nextRowId += 1;
  return { id, key, value };
}

/** Rows for every variable line, an empty `=""` row included. */
export function rowsFromEnvText(text: string): EnvRow[] {
  return parseEnvText(text).entries.map((entry) =>
    newEnvRow(entry.key, entry.value),
  );
}

/** One `KEY="value"` line per row, an empty row as `=""`. */
export function rowsToEnvText(rows: EnvRow[]) {
  return envVariablesToText(rows);
}

/**
 * A name holds only letters, digits and underscores; anything else typed
 * into the name box is dropped as it is typed. That also keeps every row
 * on its own line (no "=", "#" or line break), so line N of the text is
 * row N.
 */
export function sanitizeEnvKey(key: string) {
  return key.replace(/[^A-Za-z0-9_]/g, '');
}

/** The error of each row, by row index (row N is line N + 1). */
export function rowErrorsOf(rows: EnvRow[]) {
  const byIndex = new Map<number, EnvTextError>();
  for (const error of parseEnvText(rowsToEnvText(rows)).errors) {
    if (!byIndex.has(error.line - 1)) byIndex.set(error.line - 1, error);
  }
  return byIndex;
}
