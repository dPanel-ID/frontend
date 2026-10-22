import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { GroupDetailModelProvider } from './-model/group';
import { schemaGroupDetailSearch } from './-rules/search';
import ServerGroupDetailView from './-view';

export const Route = createFileRoute('/_with-app-layout/servers/groups/$id/')({
  head: () => ({
    meta: [{ title: 'Server group | dnocs' }],
  }),
  component: ServerGroupDetailPage,
  validateSearch: zodValidator(schemaGroupDetailSearch),
});

function ServerGroupDetailPage() {
  const { id } = Route.useParams();
  const { operationId } = Route.useSearch();

  return (
    <GroupDetailModelProvider groupId={id} operationId={operationId}>
      <ServerGroupDetailView />
    </GroupDetailModelProvider>
  );
}
