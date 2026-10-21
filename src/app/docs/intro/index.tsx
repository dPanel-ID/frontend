import { createFileRoute } from '@tanstack/react-router';

import { useDevetekLocale } from '@/services/i18n';

import { docsSections } from '../-lib/registry';
import { DocsFooter } from '../-view/-presentation/DocsFooter';

import { DocsIntroContent } from './-view/DocsIntroContent';

export const Route = createFileRoute('/docs/intro/')({
  ssr: true,
  head: () => ({
    meta: [
      {
        title: 'dPanel Documentation | Introduction',
      },
      {
        name: 'description',
        content:
          'dPanel launches a server at your cloud provider, or connects one you already run, then sets it up and deploys your application.',
      },
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <DocsIntroContent locale={locale} sections={sections} />
          <DocsFooter />
        </div>
      </main>
    </>
  );
}
