import { createFileRoute } from '@tanstack/react-router';

import View from './-view';

export const Route = createFileRoute('/_with-app-layout/profile/')({
  head: () => ({
    meta: [{ title: 'Profile | dnocs' }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <View />;
}
