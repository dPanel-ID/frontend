import { Navigate, createFileRoute } from '@tanstack/react-router';

import { useDevetekLocale } from '@/services/i18n';

import { noIndexHead } from '@/shared/libs/seo';
import { FailedState } from '@/widgets/failed-state';

import { firstDocsPageSlug } from '../-lib/registry';

export const Route = createFileRoute('/docs/$section/')({
  head: () => noIndexHead('Documentation'),
  component: DocsSectionRedirect,
});

/** A bare section link lands on its first page. */
function DocsSectionRedirect() {
  const { section } = Route.useParams();
  const locale = useDevetekLocale();
  const first = firstDocsPageSlug(locale, section);

  if (!first) {
    return <FailedState.WallCentered />;
  }

  return (
    <Navigate
      to="/docs/$section/$page"
      params={{ section, page: first }}
      replace
    />
  );
}
