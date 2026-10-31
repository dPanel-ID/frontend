import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { DomainRecordsModelProvider } from './-model/domain-records';
import { schemaDomainDetailQuery } from './-rules/qs';
import View from './-view';

export const Route = createFileRoute(
  '/_with-app-layout/backend/domain/$domainId/',
)({
  head: () => ({
    meta: [{ title: 'Domain | dnocs' }],
  }),
  component: RouteComponent,
  validateSearch: zodValidator(schemaDomainDetailQuery),
});

function RouteComponent() {
  return (
    <DomainRecordsModelProvider>
      <View />
    </DomainRecordsModelProvider>
  );
}
