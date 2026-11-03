import { Link } from '@tanstack/react-router';
import { BookOpenIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { DocsLanguageToggle } from '../DocsLanguageToggle';
import { DocsThemeToggle } from '../DocsThemeToggle';

/**
 * The foot of every documentation page.
 *
 * It carries the language and theme controls, which otherwise have nowhere
 * to live on these pages: they sit outside the app shell, so without this
 * there is no way to switch language or to leave dark mode.
 *
 * mb-20 lets the page scroll the footer clear of the floating "Ask dPanel"
 * button, which sits 20px from the bottom right and is about 44px tall.
 */
export function DocsFooter() {
  const t = useDevetekTranslations('page.docs');

  return (
    <footer className="mt-2 mb-20 flex flex-col gap-3 rounded-2xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        to="/docs/intro"
        className="inline-flex min-w-0 items-center gap-2 rounded-lg text-sm font-semibold text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      >
        <BookOpenIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t('breadcrumb')}</span>
      </Link>

      <div className="flex items-center gap-2">
        <DocsLanguageToggle />
        <DocsThemeToggle />
      </div>
    </footer>
  );
}
