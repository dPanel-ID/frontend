/** Records per page. Big zones run to hundreds of records. */
export const RECORDS_PAGE_SIZE = 20;

/** How long typing pauses before the search is sent. */
export const RECORDS_SEARCH_DEBOUNCE_MS = 300;

/** The record types offered as filters, most common first. */
export const DNS_RECORD_TYPES = [
  'A',
  'AAAA',
  'CNAME',
  'MX',
  'TXT',
  'NS',
  'SRV',
  'CAA',
] as const;

/** Cloudflare's TTL of 1 second means "Auto": Cloudflare picks it. */
const TTL_AUTO = 1;

export type RecordTypeTone = 'sky' | 'violet' | 'amber' | 'emerald' | 'neutral';

/**
 * The colour of a record type's badge. Address records, aliases, mail and
 * text read apart at a glance; the rest share a neutral badge.
 */
export function recordTypeTone(type: string): RecordTypeTone {
  switch (type.toUpperCase()) {
    case 'A':
    case 'AAAA':
      return 'sky';
    case 'CNAME':
      return 'violet';
    case 'MX':
      return 'amber';
    case 'TXT':
      return 'emerald';
    default:
      return 'neutral';
  }
}

export interface RecordNameParts {
  /** The part before the zone, such as `docs-demo`; undefined at the apex. */
  host?: string;
  zone: string;
}

/**
 * Splits `docs-demo.terpusat.me` into the host the reader cares about and the
 * zone every record in the list shares.
 */
export function splitRecordName(name: string, zone: string): RecordNameParts {
  const cleanName = name.replace(/\.$/, '');
  const cleanZone = zone.replace(/\.$/, '');
  const lowerName = cleanName.toLowerCase();
  const lowerZone = cleanZone.toLowerCase();

  if (!lowerZone || lowerName === lowerZone) return { zone: cleanZone };
  if (lowerName.endsWith(`.${lowerZone}`)) {
    return {
      host: cleanName.slice(0, cleanName.length - cleanZone.length - 1),
      zone: cleanZone,
    };
  }

  // Not in this zone after all: show it whole rather than guess.
  return { host: cleanName, zone: '' };
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

/** `text` cut into the runs that match `query` and the runs that do not. */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [{ text, match: false }];

  const parts: HighlightPart[] = [];
  const haystack = text.toLowerCase();
  let cursor = 0;

  for (
    let index = haystack.indexOf(needle);
    index >= 0;
    index = haystack.indexOf(needle, cursor)
  ) {
    if (index > cursor) {
      parts.push({ text: text.slice(cursor, index), match: false });
    }
    parts.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), match: false });
  }

  return parts;
}

/** Whether the provider chooses this record's TTL itself. */
export function isAutoTtl(ttl: number) {
  return ttl === TTL_AUTO;
}
