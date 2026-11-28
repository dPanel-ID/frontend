/**
 * Which framework an application is known to use, from what dPanel
 * recorded or detected: the framework saved with the application, the one
 * detected in its repository, or the preset the wizard applied. Several
 * sources may be given; empty and "unknown" ones are skipped.
 *
 * Framework-specific helpers (Laravel's storage and Redis drivers) show only
 * when the framework is identified, so a generic repository never gets
 * variables it would not read.
 */
export function knownFramework(
  ...sources: Array<string | null | undefined>
): string {
  for (const source of sources) {
    const name = (source ?? '').trim().toLowerCase();
    if (name && name !== 'unknown') return name;
  }
  return '';
}

/** The application is identified as a Laravel application. */
export function isLaravelFramework(
  ...sources: Array<string | null | undefined>
): boolean {
  return knownFramework(...sources) === 'laravel';
}
