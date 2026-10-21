import { Link } from '@tanstack/react-router';
import { BookOpenIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { DocsLanguageToggle } from '../DocsLanguageToggle';

/**
 * The foot of every documentation page.
 *
 * It carries the language control, which otherwise has nowhere to live on
 * these pages: they sit outside the app shell, and the introduction had no
 * way to switch language at all.
 */
export function DocsFooter() {
  const t = useDevetekTranslations('page.docs');

  return (
    <footer className="mt-2 flex flex-col gap-3 rounded-2xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        to="/docs/intro"
        className="inline-flex min-w-0 items-center gap-2 rounded-lg text-sm font-semibold text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      >
        <BookOpenIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t('breadcrumb')}</span>
      </Link>

      <DocsLanguageToggle />
    </footer>
  );
}
