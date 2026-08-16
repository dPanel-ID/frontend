import { createFileRoute, Link } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { DetailSummaryTable } from '@/features/server-groups/view/DetailSummaryTable';

import { ApiAgentCommand } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

const schemaSearch = z.object({
  executionId: z.string().optional(),
  machineId: z.string().optional(),
});

export const Route = createFileRoute(
  '/_with-app-layout/servers/groups/$groupId/operations/agent-commands/$id/',
)({
  component: AgentCommandDetailPage,
  validateSearch: zodValidator(schemaSearch),
});

function AgentCommandDetailPage() {
  const { groupId, id } = Route.useParams();
  const { executionId, machineId } = Route.useSearch();
  const [response, refresh] = ApiAgentCommand.Find.useGet({
    executionId,
    limit: 100,
    machineId,
    options: {
      skip: !executionId || !machineId,
    },
  });

  const commands =
    response.$status === 'success'
      ? response
      : response.$status === 'loading' && response.prevData
        ? response.prevData
        : null;

  const command = commands?.find((item) => item.id === id) ?? null;

  if (!executionId || !machineId) {
    return (
      <>
        <PageHeader
          headnote={
            <Breadcrumb
              items={[
                { text: 'Dashboard', url: '/dashboard' },
                { text: 'Servers', url: '/servers' },
                { text: 'Server Groups', url: '/servers/groups' },
                { text: `Group ${groupId}`, url: `/servers/groups/${groupId}` },
              ]}
            />
          }
          title={`Agent Command ${id}`}
          description="This detail view needs the preserved execution and server context from the operation row."
        />

        <section className="rounded-lg border border-dashed bg-card p-4">
          <p className="text-sm font-medium text-primary">
            Command context unavailable
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Re-open this command from the server-group operation table so the
            execution and machine identifiers remain attached.
          </p>
        </section>
      </>
    );
  }

  if (response.$status === 'loading' && !commands) {
    return <PageHeaderShimmer hasHeadnote hasStatuses hasRightAppend={false} />;
  }

  if (response.$status === 'failed' && !commands) {
    const status = response.kind === 'api' ? Number(response.error.status) : 0;

    return status === 401 || status === 403 ? (
      <FallbackState.Unauthorized withCard />
    ) : (
      <FailedState.WallCentered.Retryable
        withCard
        errorPayload={getApiErrorDetail(response.error)}
        onClickRetry={() => refresh()}
      />
    );
  }

  return (
    <>
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              { text: 'Dashboard', url: '/dashboard' },
              { text: 'Servers', url: '/servers' },
              { text: 'Server Groups', url: '/servers/groups' },
              { text: `Group ${groupId}`, url: `/servers/groups/${groupId}` },
            ]}
          />
        }
        title={`Agent Command ${id}`}
        description="Active-agent command detail linked from a server-group operation target."
      />

      {!command ? (
        <section className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-primary">
            Command detail unavailable
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The backend returned commands for this execution, but not the
            requested command ID.
          </p>
          <div className="mt-3">
            <Button
              buttonColor="secondary"
              buttonStyle="outline"
              onClick={() => refresh()}
            >
              Refresh
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border bg-card p-4">
          <DetailSummaryTable
            rows={[
              {
                label: 'Command ID',
                value: <span className="font-mono text-xs">{command.id ?? id}</span>,
              },
              {
                label: 'Status',
                value: command.status ?? '-',
              },
              {
                label: 'Type',
                value: command.command_type ?? '-',
              },
              {
                label: 'Execution',
                value: command.execution_id ? (
                  <Link
                    className="text-primary hover:underline"
                    params={{
                      groupId,
                      id: command.execution_id,
                    }}
                    to="/servers/groups/$groupId/operations/executions/$id"
                  >
                    {command.execution_id}
                  </Link>
                ) : (
                  '-'
                ),
              },
              {
                label: 'Server',
                value: command.machine_id ? (
                  <Link
                    className="text-primary hover:underline"
                    params={{ id: command.machine_id }}
                    to="/servers/$id"
                  >
                    {command.machine_id}
                  </Link>
                ) : (
                  '-'
                ),
              },
              {
                label: 'Requested by',
                value: command.requested_by ?? '-',
              },
              {
                label: 'Error',
                value: command.error || '-',
              },
              {
                label: 'Created',
                value: command.created_at ?? '-',
              },
              {
                label: 'Finished',
                value: command.finished_at ?? '-',
              },
            ]}
          />
        </section>
      )}
    </>
  );
}
