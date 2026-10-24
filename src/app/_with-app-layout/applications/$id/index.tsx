import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import EventController from './-EventController';
import { AppDataModelProvider } from './-model/app-data';
import { AppLogsModelProvider } from './-model/app-logs';
import { ArtifactHistoryModelProvider } from './-model/artifact-history';
import { schemaApplicationDetailSearch } from './-rules/tabs';
import View from './-view';

export const Route = createFileRoute('/_with-app-layout/applications/$id/')({
  head: () => ({
    meta: [{ title: 'Application | dnocs' }],
  }),
  component: ApplicationDetailPage,
  validateSearch: zodValidator(schemaApplicationDetailSearch),
});

function ApplicationDetailPage() {
  const { id } = Route.useParams();

  return (
    <AppDataModelProvider applicationId={id}>
      <ArtifactHistoryModelProvider applicationId={id}>
        <AppLogsModelProvider applicationId={id}>
          <EventController />
          <View />
        </AppLogsModelProvider>
      </ArtifactHistoryModelProvider>
    </AppDataModelProvider>
  );
}
