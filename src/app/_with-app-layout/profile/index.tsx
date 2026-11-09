import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { schemaQueryString } from './-rules/qs';
import View from './-view';

export const Route = createFileRoute('/_with-app-layout/profile/')({
  head: () => ({
    meta: [{ title: 'Profile | dnocs' }],
  }),
  component: RouteComponent,
  validateSearch: zodValidator(schemaQueryString),
});

function RouteComponent() {
  return <View />;
}
