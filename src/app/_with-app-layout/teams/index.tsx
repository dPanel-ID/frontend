import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import EventController from './-EventController';
import { FilterModelProvider } from './-model/filters';
import { OrgDataModelProvider } from './-model/org-data';
import { schemaQueryString } from './-rules/qs';
import {
  Header,
  MainBottomActions,
  MainFilter,
  MainList,
  Overview,
} from './-view';

export const Route = createFileRoute('/_with-app-layout/teams/')({
  head: () => ({
    meta: [{ title: 'Teams | dnocs' }],
  }),
  component: TeamsPage,
  validateSearch: zodValidator(schemaQueryString),
});

function TeamsPage() {
  return (
    <FilterModelProvider>
      <OrgDataModelProvider>
        <EventController />

        <div className="flex flex-col gap-4">
          <Header />
          <Overview />
          <MainFilter />
          <MainList />
          <MainBottomActions />
        </div>
      </OrgDataModelProvider>
    </FilterModelProvider>
  );
}
