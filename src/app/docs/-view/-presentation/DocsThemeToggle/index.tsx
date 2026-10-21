import { MoonIcon, SunIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useTheme } from '@/services/theme/model';

import { cn } from '@/shared/libs/tailwind/cn';

/**
 * The light and dark control for the documentation.
 *
 * These pages sit outside the app shell that normally carries it, so, like
 * the language control beside it, they bring their own.
 *
 * Nothing it renders depends on the current theme. The server cannot read a
 * system colour preference, so markup chosen from it disagrees with whatever
 * the browser resolves, and React discards the whole tree on a hydration
 * mismatch rather than patching an icon. Both icons are rendered instead and
 * CSS hides one, which the `dark` class on the document element already
 * drives, and the label names the choice rather than the current state.
 */
export function DocsThemeToggle(props: { className?: string }) {
  const [theme, { setTheme }] = useTheme();
  const t = useDevetekTranslations('page.docs');
  const label = t('switchTheme');

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-primary/80',
        'transition-colors hover:border-sky-400/40 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        props.className,
      )}
    >
      <MoonIcon className="size-4 dark:hidden" aria-hidden />
      <SunIcon className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
