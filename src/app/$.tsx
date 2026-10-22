import { createFileRoute } from '@tanstack/react-router';

import NotFoundView from './-view/NotFound';

export const Route = createFileRoute('/$')({
  head: () => ({
    meta: [{ title: 'Page not found | dnocs' }],
  }),
  component: NotFoundView,
});
