import { Link } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import type { DocsSection } from '../../../-rules/content';

interface DocsNavProps {
  sections: DocsSection[];
  activeSection: string;
  activePage: string;
}

/**
 * The documentation index. It is the same list on every page, so a reader
 * always sees where they are and what else there is.
 */
export function DocsNav(props: DocsNavProps) {
  const { activePage, activeSection, sections } = props;
  const t = useDevetekTranslations('page.docs');

  return (
    <nav aria-label={t('navLabel')} className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.slug} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.pages.map((page) => {
              const isActive =
                section.slug === activeSection && page.slug === activePage;

              return (
                <li key={page.slug}>
                  <Link
                    to="/docs/$section/$page"
                    params={{ section: section.slug, page: page.slug }}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                      isActive
                        ? 'bg-sky-500/10 font-semibold text-sky-700 dark:text-sky-200'
                        : 'text-primary/75 hover:bg-card hover:text-primary',
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
