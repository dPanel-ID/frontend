import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import EventController from './-EventController';
import { ServerDataModelProvider } from './-model/server-data';
import { ServerStatsModelProvider } from './-model/server-stats';
import { schemaServerDetailSearch } from './-rules/tabs';
import ServerDetailView from './-view';

export const Route = createFileRoute('/_with-app-layout/servers/$id/')({
  head: () => ({
    meta: [{ title: 'Server | dnocs' }],
  }),
  component: ServerDetailPage,
  validateSearch: zodValidator(schemaServerDetailSearch),
});

function ServerDetailPage() {
  const { id } = Route.useParams();

  return (
    <ServerDataModelProvider serverId={id}>
      <ServerStatsModelProvider serverId={id}>
        <EventController />

        <ServerDetailView />
      </ServerStatsModelProvider>
    </ServerDataModelProvider>
  );
}
