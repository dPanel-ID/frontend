import { createFileRoute, Link } from '@tanstack/react-router';

import { DetailSummaryTable } from '@/features/server-groups/view/DetailSummaryTable';

import { ApiDeploy } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

export const Route = createFileRoute(
  '/_with-app-layout/servers/groups/$groupId/operations/deployments/$id/',
)({
  component: DeploymentDetailPage,
});

function DeploymentDetailPage() {
  const { groupId, id } = Route.useParams();
  const [response, refresh] = ApiDeploy.Detail.$Id.useGet({
    id,
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
        title={`Deployment ${detail.id ?? id}`}
        description="Application deployment detail linked from a server-group operation target."
      />

      <section className="rounded-lg border bg-card p-4">
        <DetailSummaryTable
          rows={[
            {
              label: 'Deployment ID',
              value: <span className="font-mono text-xs">{detail.id ?? id}</span>,
            },
            {
              label: 'Status',
              value: detail.installer_status ?? '-',
            },
            {
              label: 'Application',
              value: detail.application_id ? (
                <Link
                  className="text-primary hover:underline"
                  params={{ id: String(detail.application_id) }}
                  to="/applications/$id"
                >
                  {String(detail.application_id)}
                </Link>
              ) : (
                '-'
              ),
            },
            {
              label: 'Server',
              value: detail.machine_id ? (
                <Link
                  className="text-primary hover:underline"
                  params={{ id: String(detail.machine_id) }}
                  to="/servers/$id"
                >
                  {String(detail.machine_id)}
                </Link>
              ) : (
                '-'
              ),
            },
            {
              label: 'Artifact',
              value: detail.artifact?.head ?? detail.artifact?.branch ?? '-',
            },
            {
              label: 'Primary',
              value: detail.is_primary ? 'Yes' : 'No',
            },
            {
              label: 'Error',
              value: detail.error || '-',
            },
            {
              label: 'Created',
              value: detail.created_at ?? '-',
            },
            {
              label: 'Updated',
              value: detail.updated_at ?? '-',
            },
          ]}
        />
      </section>
    </>
  );
}
