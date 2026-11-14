import { createFileRoute } from '@tanstack/react-router';

import { useDevetekLocale } from '@/services/i18n';

import {
  breadcrumbJsonLd,
  seoHead,
  softwareApplicationJsonLd,
} from '@/shared/libs/seo';

import { docsSections } from '../-lib/registry';
import { DocsTopBar } from '../-view/-presentation/DocsTopBar';

import { DocsIntroContent } from './-view/DocsIntroContent';

export const Route = createFileRoute('/docs/intro/')({
  ssr: true,
  head: () =>
    seoHead({
      title: 'Docs: put your app online on a server you own',
      description:
        'Learn dPanel - dNocs: launch a server on seven clouds or connect your own with the dPanel agent, deploy from GitHub, add a domain with HTTPS, and see what happens to your data.',
      path: '/docs/intro',
      jsonLd: [
        softwareApplicationJsonLd(),
        breadcrumbJsonLd([{ name: 'Documentation', path: '/docs/intro' }]),
      ],
    }),
  component: DocsIntroPage,
});

/**
 * The documentation landing page.
 *
 * Laid out like a guide page and painted from the same sky accent, so the
 * documentation reads as one product — but without the index rail, because
 * nobody arrives here to look something up. This page has to explain what
 * dPanel is and make someone want to try it, so the article column gives way
 * to marketing sections and a card grid of the guides themselves.
 */
function DocsIntroPage() {
  const locale = useDevetekLocale();
  const sections = docsSections(locale);

  return (
    <>
      <a
        href="#docs-intro-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>

      <main
        id="docs-intro-content"
        tabIndex={-1}
        className="min-h-svh bg-background text-foreground"
      >
        {/* pb-24 lets the page scroll clear of the floating "Ask dPanel" button. */}
        <div className="flex w-full flex-col gap-4 p-3 pb-24 sm:p-4 sm:pb-24 lg:p-6 lg:pb-24">
          <DocsTopBar />
          <DocsIntroContent locale={locale} sections={sections} />
        </div>
      </main>
    </>
  );
}
