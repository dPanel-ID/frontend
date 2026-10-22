import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { schemaDashboardSearch } from './-rules/tabs';
import DashboardView from './-view/DashboardView';

export const Route = createFileRoute('/_with-app-layout/dashboard/')({
  head: () => ({
    meta: [{ title: 'Dashboard | dnocs' }],
  }),
  component: RouteComponent,
  validateSearch: zodValidator(schemaDashboardSearch),
});

function RouteComponent() {
  const { tab } = Route.useSearch();

  return <DashboardView tab={tab} />;
}
