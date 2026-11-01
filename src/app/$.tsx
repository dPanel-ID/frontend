import { createFileRoute } from '@tanstack/react-router';

import { noIndexHead } from '@/shared/libs/seo';

import NotFoundView from './-view/NotFound';

export const Route = createFileRoute('/$')({
  head: () => noIndexHead('Page not found'),
  component: NotFoundView,
});
