import { createFileRoute, Link } from '@tanstack/react-router';

import * as ApiHostGroupOperationAgentCommand from '@/shared/api/host-group.operation.agent-command.$operationId.$machineId';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import { DetailSummaryTable } from '@/features/server-groups/view/DetailSummaryTable';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

export const Route = createFileRoute(
  '/_with-app-layout/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId/',
)({
  head: () => ({
    meta: [{ title: 'Agent command | dnocs' }],
  }),
  component: AgentCommandDetailPage,
});

function AgentCommandDetailPage() {
  const { groupId, machineId, operationId } = Route.useParams();
  const [response, refresh] = ApiHostGroupOperationAgentCommand.useGet({
    machineId,
    operationId,
  });

  const detail =
    response.$status === 'success'
      ? response
      : response.$status === 'loading' && response.prevData
        ? response.prevData
        : null;

  if (response.$status === 'loading' && !detail) {
    return <PageHeaderShimmer hasHeadnote hasStatuses hasRightAppend={false} />;
  }

  if (response.$status === 'failed' && !detail) {
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

  if (!detail) {
    return null;
  }

  const command = detail.command;

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
        title={`Agent Command ${command.id ?? machineId}`}
        description="Scoped agent-command detail for a server-group operation target."
      />

      <section className="rounded-lg border bg-card p-4">
        <DetailSummaryTable
          rows={[
            {
              label: 'Operation ID',
              value: <span className="font-mono text-xs">{operationId}</span>,
            },
            {
              label: 'Command ID',
              value: (
                <span className="font-mono text-xs">{command.id ?? '-'}</span>
              ),
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
                    machineId,
                    operationId,
                  }}
                  to="/servers/groups/$groupId/operations/executions/$operationId/$machineId"
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
                machineId
              ),
            },
            {
              label: 'Requested by',
              value: command.requested_by ?? '-',
            },
            {
              label: 'Expires',
              value: command.expires_at ?? '-',
            },
            {
              label: 'Started',
              value: command.started_at ?? '-',
            },
            {
              label: 'Finished',
              value: command.finished_at ?? '-',
            },
            {
              label: 'Created',
              value: command.created_at ?? '-',
            },
            {
              label: 'Updated',
              value: command.updated_at ?? '-',
            },
          ]}
        />
      </section>
    </>
  );
}
