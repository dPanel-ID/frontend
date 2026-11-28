/** A runtime the application declares, as stored in its definition. */
export interface NamedRuntime {
  name: string;
  version?: string;
}

/**
 * The module name a runtime is known by, without the catalog's namespace or
 * install-method suffix, so `dpanel.php`, `php:mise` and `PHP` all read
 * `php`.
 */
export function runtimeKey(name: string | undefined | null): string {
  const base = String(name ?? '')
    .trim()
    .toLowerCase()
    .split(':')[0]!;
  return base.replace(/^dpanel\./, '');
}

/**
 * Puts the runtime named `preferred` first and keeps the others in order.
 *
 * The first runtime becomes the application's language and the rest its
 * additional languages. The wizard lists runtimes alphabetically, so a
 * Laravel app picked Node.js over PHP as its language (2026-11-28); the
 * language the repository asks for (the preset's, or the one already stored)
 * must win instead.
 */
export function orderRuntimesByPrimary<T extends NamedRuntime>(
  runtimes: T[],
  preferred: string | undefined | null,
): T[] {
  const key = runtimeKey(preferred);
  if (!key) return runtimes;

  const index = runtimes.findIndex(
    (runtime) => runtimeKey(runtime.name) === key,
  );
  if (index <= 0) return runtimes;

  return [
    runtimes[index]!,
    ...runtimes.slice(0, index),
    ...runtimes.slice(index + 1),
  ];
}
