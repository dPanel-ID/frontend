/** Separator between the parts of a dashboard row subtitle. */
export const SUBTITLE_SEPARATOR = ' · ';

/**
 * The parts of a row subtitle that have something to show, joined with
 * SUBTITLE_SEPARATOR. Missing or blank parts are dropped, so a subtitle never
 * reads "tencent ·  · …" when a value is empty.
 */
export function joinSubtitle(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(SUBTITLE_SEPARATOR);
}
