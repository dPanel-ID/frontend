import { createFileRoute } from '@tanstack/react-router';

import { noIndexHead } from '@/shared/libs/seo/head';

import { AdminResourcesDataModelProvider } from './-model/resources-data';
import {
  AccessGuard,
  ApiAccessGuard,
  Header,
  ResourceTable,
  ResourceTabs,
} from './-view';

export const Route = createFileRoute(
  '/_with-app-layout/administrator/resources/',
)({
  head: () => noIndexHead('All resources'),
  component: AdminResourcesPage,
});

function AdminResourcesPage() {
  return (
    <div className="flex flex-col gap-4">
      <Header />

      <AccessGuard>
        <AdminResourcesDataModelProvider>
          <ApiAccessGuard>
            <ResourceTabs />
            <ResourceTable />
          </ApiAccessGuard>
        </AdminResourcesDataModelProvider>
      </AccessGuard>
    </div>
  );
}
