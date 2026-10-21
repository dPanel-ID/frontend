/** Semantic colour roles used across the dashboard's status surfaces. */
export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate';

/** Border, background and text classes for one tone, in both themes. */
export function toneClass(tone: Tone) {
  switch (tone) {
    case 'blue':
      return 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'green':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'amber':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'red':
      return 'border-destructive/25 bg-destructive/10 text-destructive';
    case 'violet':
      return 'border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400';
    default:
      return 'border-border bg-background text-muted-foreground';
  }
}

/**
 * Tone for a resource status string. Unrecognised and legacy values fall
 * through to the neutral tone rather than being coloured as healthy.
 */
export function statusTone(status?: string): Tone {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'ready' || normalized === 'running') return 'green';
  if (normalized === 'progress' || normalized === 'deleting') return 'blue';
  if (normalized === 'failed' || normalized === 'cancelled') return 'red';
  if (normalized === 'dead' || normalized === 'exited') return 'amber';
  return 'slate';
}
