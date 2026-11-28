import {
  keepReleasesOf,
  parseReleaseName,
} from '@/entities/application/lib/release-folders';

import type { DTOs } from '@/shared/api';

/** One release folder on a server, ready to show. */
export interface ServerReleaseItem {
  name: string;
  /** When it was built: the report's date, else the one in its name. */
  date: Date | null;
  commit: string;
  /** The files the app had before it used release folders. */
  isBeforeReleaseFolders: boolean;
  current: boolean;
  previous: boolean;
  /** Not live, and nothing else is running on the server. */
  canRollBack: boolean;
}

/** The release folders of an app on one server. */
export interface ServerReleasesView {
  usesReleaseFolders: boolean;
  keepReleases: number;
  /** Newest first, as the server reported them. */
  releases: ServerReleaseItem[];
  /** Null before the server's first report. */
  reportedAt: Date | null;
  rollbackAvailable: boolean;
  /** A deploy or rollback is in progress on that server. */
  running: boolean;
}

function dateOf(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Maps the API answer once, so an empty, partial or older answer (null
 * lists, empty names, a missing current flag) never crashes the panel.
 * A release is current when the answer says so by flag or by name.
 */
export function toServerReleasesView(
  dto: DTOs.DeployReleasesV1 | null | undefined,
): ServerReleasesView {
  const current = (dto?.current ?? '').trim();
  const previous = (dto?.previous ?? '').trim();
  const running = dto?.running === true;
  const seen = new Set<string>();
  const releases: ServerReleaseItem[] = [];

  // Production answers may hold null entries.
  const list: Array<DTOs.DeployReleaseV1 | null> = dto?.releases ?? [];
  for (const release of list) {
    if (!release) continue;
    const name = (release.name || '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const parsed = parseReleaseName(name);
    const isCurrent =
      release.current === true || (!!current && name === current);
    releases.push({
      name,
      date: dateOf(release.created_at) ?? parsed.date,
      commit: (release.commit ?? '').trim() || parsed.commit,
      isBeforeReleaseFolders: parsed.isBeforeReleaseFolders,
      current: isCurrent,
      previous:
        !isCurrent &&
        (release.previous === true || (!!previous && name === previous)),
      canRollBack: !isCurrent && !running,
    });
  }

  return {
    usesReleaseFolders: dto?.strategy === 'releases',
    keepReleases: keepReleasesOf(dto?.keep_releases),
    releases,
    reportedAt: dateOf(dto?.reported_at),
    rollbackAvailable: dto?.rollback_available === true,
    running,
  };
}
