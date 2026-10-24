import { createFileRoute } from '@tanstack/react-router';

import EventController from './-EventController';
import { AppsDataModelProvider } from './-model/apps-data';
import { FilterModelProvider } from './-model/filters';
import { AppsOverviewModelProvider } from './-model/overview';
import View from './-view';

export const Route = createFileRoute('/_with-app-layout/applications/')({
  head: () => ({
    meta: [{ title: 'Applications | dnocs' }],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return (
    <FilterModelProvider>
      <AppsOverviewModelProvider>
        <AppsDataModelProvider>
          <EventController />
          <View />
        </AppsDataModelProvider>
      </AppsOverviewModelProvider>
    </FilterModelProvider>
  );
}
