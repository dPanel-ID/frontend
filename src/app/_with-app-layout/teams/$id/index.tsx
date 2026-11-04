import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import EventController from './-EventController';
import { FilterModelProvider } from './-model/filters';
import { MembersDataModelProvider } from './-model/members-data';
import { schemaQueryString } from './-rules/qs';
import { Header, MembersPanel, Overview, Workers } from './-view';

export const Route = createFileRoute('/_with-app-layout/teams/$id/')({
  head: () => ({
    meta: [{ title: 'Team | dnocs' }],
  }),
  component: TeamDetailPage,
  validateSearch: zodValidator(schemaQueryString),
});

function TeamDetailPage() {
  const { id } = Route.useParams();

  return (
    <FilterModelProvider>
      <MembersDataModelProvider orgId={id}>
        <EventController />

        <div className="flex flex-col gap-4">
          <Header />
          <Overview />
          <MembersPanel />
          <Workers />
        </div>
      </MembersDataModelProvider>
    </FilterModelProvider>
  );
}
