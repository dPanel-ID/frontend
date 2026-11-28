import type { DTOs } from '@/shared/api';

/** Same limits as the API (docs/applications/definition.md). */
export const RELEASE_FOLDER_LIMITS = {
  sharedPaths: 20,
  sharedPathLength: 255,
  keepMin: 1,
  keepMax: 10,
  keepDefault: 3,
} as const;

/** What a Laravel app keeps between releases: uploads, .env and SQLite. */
export const DEFAULT_SHARED_PATHS = [
  'storage',
  '.env',
  'database/database.sqlite',
];

/** Release folders of one application, as Settings edits them. */
export interface ReleaseFoldersView {
  enabled: boolean;
  sharedPaths: string[];
  keepReleases: number;
}

/**
 * Whether the definition deploys into release folders. A definition saved
 * before the field existed (missing, empty or anything unknown) deploys in
 * place, as it always did.
 */
export function usesReleaseFolders(
  definition: DTOs.AppDefinition | null | undefined,
): boolean {
  return definition?.deploy_strategy === 'releases';
}

/** A number of releases to keep within 1-10; anything else is 3. */
export function keepReleasesOf(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number)) return RELEASE_FOLDER_LIMITS.keepDefault;
  if (
    number < RELEASE_FOLDER_LIMITS.keepMin ||
    number > RELEASE_FOLDER_LIMITS.keepMax
  ) {
    return RELEASE_FOLDER_LIMITS.keepDefault;
  }
  return number;
}

/** "./storage/" and " storage " are both "storage". */
export function normalizeSharedPath(path: string): string {
  return path
    .trim()
    .replace(/\/{2,}/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/\/+$/, '');
}

export type SharedPathError =
  | 'sharedPathAbsolute'
  | 'sharedPathParent'
  | 'sharedPathInvalid'
  | 'sharedPathTooLong';

/**
 * Why a shared path is refused, or '' when it is fine. A path is relative
 * to the app's build folder and never climbs out of it.
 */
export function sharedPathError(raw: string): SharedPathError | '' {
  const path = normalizeSharedPath(raw);
  if (!path || path === '.') return 'sharedPathInvalid';
  if (path.length > RELEASE_FOLDER_LIMITS.sharedPathLength) {
    return 'sharedPathTooLong';
  }
  if (path.startsWith('/') || path.startsWith('~')) return 'sharedPathAbsolute';
  if (path.split('/').some((part) => part === '..')) return 'sharedPathParent';
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(path)) return 'sharedPathInvalid';
  return '';
}

/** One path per line; blank lines are ignored. */
export function parseSharedPathsText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The first problem of each field, as message keys by path:
 * "sharedPaths.N" for one path, "sharedPaths" for the list and
 * "keepReleases".
 */
export function releaseFoldersErrors(
  view: ReleaseFoldersView,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!view.enabled) return errors;

  if (
    !Number.isInteger(view.keepReleases) ||
    view.keepReleases < RELEASE_FOLDER_LIMITS.keepMin ||
    view.keepReleases > RELEASE_FOLDER_LIMITS.keepMax
  ) {
    errors.keepReleases = 'badKeepReleases';
  }

  if (view.sharedPaths.length > RELEASE_FOLDER_LIMITS.sharedPaths) {
    errors.sharedPaths = 'tooManySharedPaths';
  }
  const seen = new Set<string>();
  view.sharedPaths.forEach((path, index) => {
    const error = sharedPathError(path);
    if (error) {
      errors[`sharedPaths.${index}`] ??= error;
      return;
    }
    const normalized = normalizeSharedPath(path);
    if (seen.has(normalized)) {
      errors[`sharedPaths.${index}`] ??= 'sharedPathDuplicate';
    }
    seen.add(normalized);
  });
  return errors;
}

function sharedPathsOf(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((path) => (typeof path === 'string' ? normalizeSharedPath(path) : ''))
    .filter(Boolean);
}

/**
 * The release-folder settings of a stored definition. An app that does
 * not use them yet shows the usual Laravel shared paths, ready for the
 * moment it is turned on.
 */
export function toReleaseFoldersView(
  definition: DTOs.AppDefinition | null | undefined,
): ReleaseFoldersView {
  const enabled = usesReleaseFolders(definition);
  const stored = sharedPathsOf(definition?.shared_paths);
  return {
    enabled,
    sharedPaths:
      stored && (enabled || stored.length) ? stored : [...DEFAULT_SHARED_PATHS],
    keepReleases: keepReleasesOf(definition?.keep_releases),
  };
}

/**
 * The app_definition patch for edited release-folder settings. An app
 * that never used them and still does not gets nothing, so its stored
 * definition stays exactly as it was.
 */
export function releaseFoldersPatch(
  view: ReleaseFoldersView,
  original: Pick<ReleaseFoldersView, 'enabled'>,
): Pick<
  DTOs.AppDefinition,
  'deploy_strategy' | 'shared_paths' | 'keep_releases'
> {
  if (!view.enabled) {
    return original.enabled ? { deploy_strategy: 'in_place' } : {};
  }
  const paths: string[] = [];
  for (const path of view.sharedPaths) {
    const normalized = normalizeSharedPath(path);
    if (normalized && !paths.includes(normalized)) paths.push(normalized);
  }
  return {
    deploy_strategy: 'releases',
    shared_paths: paths,
    keep_releases: view.keepReleases,
  };
}

/** What a release folder's name says about it. */
export interface ReleaseNameInfo {
  /** When the release was built (UTC); null when the name has no date. */
  date: Date | null;
  /** Short commit; empty when the name has none. */
  commit: string;
  /** The files an app had before it used release folders. */
  isBeforeReleaseFolders: boolean;
}

const RELEASE_NAME = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-(.*)$/;

/**
 * Reads "<UTC yyyymmddHHMMSS>-<short commit>". The folder an older app was
 * moved into ("00000000000000-in-place") is "before release folders".
 * Anything else keeps its name and has no date.
 */
export function parseReleaseName(name: string): ReleaseNameInfo {
  const match = RELEASE_NAME.exec(name.trim());
  if (!match) return { date: null, commit: '', isBeforeReleaseFolders: false };
  const [, year, month, day, hour, minute, second, rest = ''] = match;
  if (Number(year) === 0 || rest === 'in-place') {
    return { date: null, commit: '', isBeforeReleaseFolders: true };
  }
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );
  const valid =
    !Number.isNaN(date.getTime()) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);
  return {
    date: valid ? date : null,
    commit: /^[0-9a-f]{4,40}$/i.test(rest) ? rest : '',
    isBeforeReleaseFolders: false,
  };
}
