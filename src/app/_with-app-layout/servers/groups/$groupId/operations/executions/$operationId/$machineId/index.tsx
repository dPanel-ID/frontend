import { createFileRoute, Link } from '@tanstack/react-router';

import * as ApiHostGroupOperationExecution from '@/shared/api/host-group.operation.execution.$operationId.$machineId';
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
  '/_with-app-layout/servers/groups/$groupId/operations/executions/$operationId/$machineId/',
)({
  component: ExecutionDetailPage,
});

function ExecutionDetailPage() {
  const { groupId, machineId, operationId } = Route.useParams();
  const [response, refresh] = ApiHostGroupOperationExecution.useGet({
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

  const execution = detail.execution;

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
        title={`Execution ${execution.id ?? machineId}`}
        description="Scoped execution detail for a server-group operation target."
      />

      <section className="rounded-lg border bg-card p-4">
        <DetailSummaryTable
          rows={[
            {
              label: 'Operation ID',
              value: (
                <span className="font-mono text-xs">{operationId}</span>
              ),
            },
            {
              label: 'Execution ID',
              value: (
                <span className="font-mono text-xs">
                  {execution.id ?? '-'}
                </span>
              ),
            },
            {
              label: 'Status',
              value: execution.status ?? '-',
            },
            {
              label: 'Type',
              value: execution.type ?? '-',
            },
            {
              label: 'Server',
              value: execution.machine_id ? (
                <Link
                  className="text-primary hover:underline"
                  params={{ id: execution.machine_id }}
                  to="/servers/$id"
                >
                  {execution.machine_id}
                </Link>
              ) : (
                machineId
              ),
            },
            {
              label: 'Module',
              value: execution.module ?? '-',
            },
            {
              label: 'Actor',
              value: execution.actor_subject ?? '-',
            },
            {
              label: 'Started',
              value: execution.started_at ?? '-',
            },
            {
              label: 'Finished',
              value: execution.finished_at ?? '-',
            },
            {
              label: 'Created',
              value: execution.created_at ?? '-',
            },
            {
              label: 'Updated',
              value: execution.updated_at ?? '-',
            },
            {
              label: 'Events',
              value: detail.events_message ?? 'No event detail was returned.',
            },
            {
              label: 'Retention',
              value: detail.events_retention_expires_at ?? '-',
            },
          ]}
        />
      </section>
    </>
  );
}
