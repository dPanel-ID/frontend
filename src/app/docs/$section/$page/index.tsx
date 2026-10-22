import { createFileRoute, notFound } from '@tanstack/react-router';

import { useDevetekLocale } from '@/services/i18n';

import { FailedState } from '@/widgets/failed-state';

import { docsSections, findDocsPage } from '../../-lib/registry';
import { DocsPageView } from '../../-view/DocsPageView';

export const Route = createFileRoute('/docs/$section/$page/')({
  head: () => ({
    meta: [{ title: 'Documentation | dnocs' }],
  }),
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
