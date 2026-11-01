import { createFileRoute, notFound } from '@tanstack/react-router';

import { useDevetekLocale } from '@/services/i18n';

import { FailedState } from '@/widgets/failed-state';

import { docsSections, findDocsPage } from '../../-lib/registry';
import { docsPageHead } from '../../-lib/seo';
import { DocsPageView } from '../../-view/DocsPageView';

export const Route = createFileRoute('/docs/$section/$page/')({
  // Rendered on the server, like the introduction, so every guide is real
  // HTML for search engines and the static prerender can crawl the index.
  ssr: true,
  // Search engines and AI crawlers read the English pages, which are the
  // ones the static build writes out.
  head: ({ params }) => docsPageHead('en', params.section, params.page),
  component: DocsPage,
  notFoundComponent: () => <FailedState.WallCentered />,
});

function DocsPage() {
  const { page, section } = Route.useParams();
  const locale = useDevetekLocale();

  const sections = docsSections(locale);
  const location = findDocsPage(locale, section, page);

  if (!location) {
    throw notFound();
  }

  return <DocsPageView sections={sections} location={location} />;
}
