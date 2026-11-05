import { Link } from '@tanstack/react-router';
import { BookOpenIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { DocsLanguageToggle } from '../DocsLanguageToggle';
import { DocsThemeToggle } from '../DocsThemeToggle';

/**
 * The top of every documentation page: the way home to the docs, and the
 * language and theme controls.
 *
 * The docs sit outside the app shell, so these controls have nowhere else to
 * live. They lead the page rather than close it, so a reader sees at once
 * that the docs come in English and Indonesian, and in light and dark.
 */
export function DocsTopBar() {
  const t = useDevetekTranslations('page.docs');

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
      <Link
        to="/docs/intro"
        className="inline-flex min-w-0 items-center gap-2 rounded-lg text-sm font-semibold text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      >
        <BookOpenIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t('breadcrumb')}</span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <DocsLanguageToggle />
        <DocsThemeToggle />
      </div>
    </header>
  );
}
