import { createFileRoute } from '@tanstack/react-router';

import EventController from './-EventController';
import { AdminTasksDataModelProvider } from './-model/tasks-data';
import {
  AccessGuard,
  ApiAccessGuard,
  Guide,
  Header,
  MainList,
  MainToolbar,
  Overview,
} from './-view';

export const Route = createFileRoute('/_with-app-layout/administrator/tasks/')({
  head: () => ({
    meta: [{ title: 'Executor tasks | dnocs' }],
  }),
  component: AdminTasksPage,
});

function AdminTasksPage() {
  return (
    <div className="flex flex-col gap-4">
      <Header />

      <AccessGuard>
        <AdminTasksDataModelProvider>
          <EventController />

          <ApiAccessGuard>
            <Guide />
            <Overview />
            <MainToolbar />
            <MainList />
          </ApiAccessGuard>
        </AdminTasksDataModelProvider>
      </AccessGuard>
    </div>
  );
}
