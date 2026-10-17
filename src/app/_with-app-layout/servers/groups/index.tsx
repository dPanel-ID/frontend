import { createFileRoute } from '@tanstack/react-router';

import ServerGroupsView from './-view';

export const Route = createFileRoute('/_with-app-layout/servers/groups/')({
  component: ServerGroupsView,
});
