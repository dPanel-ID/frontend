import { createFileRoute } from '@tanstack/react-router';

import ServerGroupsView from './-view';

export const Route = createFileRoute('/_with-app-layout/servers/groups/')({
  head: () => ({
    meta: [{ title: 'Server groups | dnocs' }],
  }),
  component: ServerGroupsView,
});
