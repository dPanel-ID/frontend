import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import EventController from './-EventController';
import { DomainDataModelProvider } from './-models/domain-data';
import { FilterModelProvider } from './-models/filters';
import { DomainOverviewModelProvider } from './-models/overview';
import { schemaQueryString } from './-rules/qs';
import View from './-view';

export const Route = createFileRoute('/_with-app-layout/backend/domain/')({
  head: () => ({
    meta: [{ title: 'Domains and DNS | dnocs' }],
  }),
  component: RouteComponent,
  validateSearch: zodValidator(schemaQueryString),
});

function RouteComponent() {
  return (
    <FilterModelProvider>
      <DomainOverviewModelProvider>
        <DomainDataModelProvider>
          <EventController />
          <View />
        </DomainDataModelProvider>
      </DomainOverviewModelProvider>
    </FilterModelProvider>
  );
}
