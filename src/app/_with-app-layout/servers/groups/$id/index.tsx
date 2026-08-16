import { useMemo, useState } from 'react';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import {
  BoxesIcon,
  CalendarIcon,
  CpuIcon,
  HardDriveUploadIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { z } from 'zod';

import { useAuthLoggedIn } from '@/services/auth';

import {
  toHostGroupDetail,
  toHostGroupOperation,
} from '@/entities/host-group/adapter';
import type { Target } from '@/entities/host-group/rules/schema';
import { toServerModuleFromCatalog } from '@/entities/server-modules/lib/catalog';

import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import {
  ApiApplication,
  ApiArtifact,
  ApiDeploy,
  ApiHostGroup,
  ApiModule,
  ApiServer,
} from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

const schemaSearch = z.object({
  operationId: z.string().optional(),
});

export const Route = createFileRoute('/_with-app-layout/servers/groups/$id/')({
  component: ServerGroupDetailPage,
  validateSearch: zodValidator(schemaSearch),
});

function isUnauthorizedStatus(status?: number | string) {
  const normalizedStatus = Number(status);

  return normalizedStatus === 401 || normalizedStatus === 403;
}

function terminalOperationStatus(status?: string) {
  return ['succeeded', 'failed', 'cancelled'].includes(
    String(status ?? '').toLowerCase(),
  );
}

function ServerGroupDetailPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuthLoggedIn();
  const { id } = Route.useParams();
  const { operationId } = Route.useSearch();
  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [selectedArtifactId, setSelectedArtifactId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [upgradeVersion, setUpgradeVersion] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: 'inventory' | 'reboot' | 'upgrade';
    title: string;
  } | null>(null);

  const [detailResponse, refreshDetail] = ApiHostGroup.Detail.$Id.useGet({
    id,
    options: {
      refreshIntervalMs: 10_000,
    },
  });

  const [operationResponse, refreshOperation] =
    ApiHostGroup.Operation.$Id.useGet({
      id: operationId ?? '',
      options: {
        skip: !operationId,
        refreshIntervalMs: operationId ? 3_000 : 0,
      },
    });

  const [serversResponse] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page: 1,
    pageSize: 200,
    userId: userProfile.id,
  });

  const [applicationsResponse] = ApiApplication.Find.useGet({
    page: 1,
    limit: 100,
  });

  const [artifactsResponse] = ApiArtifact.Find.useGet({
    applicationId: selectedApplicationId || id,
    limit: 50,
    page: 1,
    options: {
      skip: !selectedApplicationId,
    },
  });

  const [modulesResponse] = ApiModule.Find.useGet({
    options: {
      refreshIntervalMs: 15_000,
    },
  });

  const group =
    detailResponse.$status === 'success'
      ? toHostGroupDetail(detailResponse).unwrap()
      : detailResponse.$status === 'loading' && detailResponse.prevData
        ? toHostGroupDetail(detailResponse.prevData).unwrap()
        : null;

  const operation =
    operationResponse.$status === 'success'
      ? toHostGroupOperation(operationResponse).unwrap()
      : operationResponse.$status === 'loading' && operationResponse.prevData
        ? toHostGroupOperation(operationResponse.prevData).unwrap()
        : null;

  const modules = useMemo(() => {
    if (modulesResponse.$status === 'success') {
      return modulesResponse.modules.map((module) =>
        toServerModuleFromCatalog(
          module,
          modulesResponse.repository?.ref?.name,
          modulesResponse.repository?.ref?.resolved_commit,
        ),
      );
    }

    return modulesResponse.$status === 'loading' && modulesResponse.prevData
      ? modulesResponse.prevData.modules.map((module) =>
          toServerModuleFromCatalog(
            module,
            modulesResponse.prevData?.repository?.ref?.name,
            modulesResponse.prevData?.repository?.ref?.resolved_commit,
          ),
        )
      : [];
  }, [modulesResponse]);

  const availableServers =
    serversResponse.$status === 'success'
      ? (serversResponse.machines ?? [])
      : [];
  const applications =
    applicationsResponse.$status === 'success'
      ? (applicationsResponse.applications ?? [])
      : [];
  const artifacts =
    artifactsResponse.$status === 'success'
      ? (artifactsResponse.artifacts ?? [])
      : [];

  const selectedModule =
    modules.find((module) => module.id === selectedModuleId) ?? null;

  const detailStatus =
    detailResponse.$status === 'failed' && detailResponse.kind === 'api'
      ? detailResponse.error.status
      : undefined;

  const operationStatus =
    operationResponse.$status === 'failed' && operationResponse.kind === 'api'
      ? operationResponse.error.status
      : undefined;

  const groupTarget: Target = {
    type: 'hostgroup',
    id,
  };

  const memberCount = group?.memberCount ?? 0;

  const handleSelectServer = (serverId: string, checked: boolean) => {
    setSelectedServerIds((current) =>
      checked
        ? [...current, serverId]
        : current.filter((item) => item !== serverId),
    );
  };

  const resetDialogState = () => {
    setSelectedServerIds([]);
    setSelectedApplicationId('');
    setSelectedArtifactId('');
    setSubmitError('');
    setIsSubmitting(false);
  };

  const navigateToOperation = (nextOperationId: string) => {
    navigate({
      to: '/servers/groups/$id',
      params: { id },
      search: {
        operationId: nextOperationId,
      },
    });
  };

  const handleAddMembers = async () => {
    if (selectedServerIds.length === 0) {
      setSubmitError('Select at least one server.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const response = await ApiHostGroup.Members.$Id.doPost({
      id,
      serverIds: selectedServerIds,
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setSubmitError(getApiErrorDetail(response.error));
      return;
    }

    setAddMembersOpen(false);
    resetDialogState();
    refreshDetail();
  };

  const handleSubmitAction = async () => {
    if (!pendingAction || !group) return;

    setIsSubmitting(true);
    setSubmitError('');

    const payload =
      pendingAction.action === 'upgrade' && upgradeVersion.trim()
        ? { version: upgradeVersion.trim() }
        : {};

    const response = await ApiHostGroup.Operation.$Id.doPost({
      id,
      action: pendingAction.action,
      payload,
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setSubmitError(getApiErrorDetail(response.error));
      return;
    }

    if (response.operation_id) {
      navigateToOperation(response.operation_id);
    }

    setPendingAction(null);
    setUpgradeVersion('');
    refreshDetail();
  };

  const handleDeploy = async () => {
    if (!selectedApplicationId || !selectedArtifactId) {
      setSubmitError('Select both an application and an artifact.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const response = await ApiDeploy.Create.doPost({
      applicationId: selectedApplicationId,
      artifactId: selectedArtifactId,
      workerId: '',
      target: groupTarget,
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setSubmitError(getApiErrorDetail(response.error));
      return;
    }

    if ('operation_id' in response && response.operation_id) {
      navigateToOperation(response.operation_id);
    }

    setDeployOpen(false);
    resetDialogState();
    refreshDetail();
  };

  const handleOpenModule = () => {
    if (!selectedModule) return;

    openServerModulesDetailModal({
      moduleInfo: selectedModule,
      hostGroupTarget: {
        id,
        label: group?.name ?? 'Selected group',
        memberCount,
      },
    });
  };

  if (detailResponse.$status === 'loading' && !group) {
    return <PageHeaderShimmer hasHeadnote hasStatuses hasRightAppend />;
  }

  if (detailResponse.$status === 'failed' && !group) {
    return isUnauthorizedStatus(detailStatus) ? (
      <FallbackState.Unauthorized withCard />
    ) : (
      <FailedState.WallCentered.Retryable
        withCard
        errorPayload={getApiErrorDetail(detailResponse.error)}
        onClickRetry={() => refreshDetail()}
      />
    );
  }

  if (!group) {
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
            ]}
          />
        }
        title={group.name}
        description={
          group.description ||
          'Explicit server group for coordinated operational fan-out.'
        }
        footnote={`Created ${group.timestamp.created.toLocaleString()} • Updated ${group.timestamp.updated.toLocaleString()}`}
        statuses={[
          {
            kind: 'status',
            icon: BoxesIcon,
            text: `${group.memberCount} members`,
          },
          {
            kind: 'status',
            icon: CalendarIcon,
            text: `Updated ${group.timestamp.updated.toLocaleDateString()}`,
          },
        ]}
        rightAppend={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setAddMembersOpen(true)}
            >
              <PlusCircleIcon />
              Add Members
            </Button>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setDeployOpen(true)}
            >
              <HardDriveUploadIcon />
              Deploy Artifact
            </Button>
          </div>
        }
      />

      <div className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Module launcher
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a role, then explicitly launch it against this group.
                </p>
              </div>
              <Button
                disabled={!selectedModule}
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={handleOpenModule}
              >
                Open Role
              </Button>
            </div>

            <div className="mt-4">
              {modulesResponse.$status === 'loading' && modules.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <Select
                  value={selectedModuleId}
                  onValueChange={setSelectedModuleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a server role" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold text-primary">Bulk actions</h2>
            <p className="text-sm text-muted-foreground">
              Every action snapshots the current member list before it is
              queued.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={() =>
                  setPendingAction({
                    action: 'inventory',
                    title: 'Refresh inventory',
                  })
                }
              >
                <RefreshCwIcon />
                Refresh Inventory
              </Button>
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={() =>
                  setPendingAction({
                    action: 'reboot',
                    title: 'Reboot servers',
                  })
                }
              >
                <RotateCcwIcon />
                Reboot
              </Button>
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={() =>
                  setPendingAction({
                    action: 'upgrade',
                    title: 'Upgrade agent',
                  })
                }
              >
                <CpuIcon />
                Upgrade Agent
              </Button>
            </div>
          </section>
        </div>

        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-primary">Members</h2>
            <p className="text-sm text-muted-foreground">
              Explicit members only. Current assignment is shown so group
              changes stay visible.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_140px_140px] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                <span>Server</span>
                <span>Address</span>
                <span>Status</span>
                <span>Current group</span>
              </div>

              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_140px_140px] gap-4 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <Link
                    to="/servers/$id"
                    params={{ id: member.id }}
                    className="truncate font-medium text-primary hover:underline"
                  >
                    {member.hostname}
                  </Link>
                  <span className="truncate text-muted-foreground">
                    {member.address || '-'}
                  </span>
                  <span>{member.status || '-'}</span>
                  <span className="truncate text-muted-foreground">
                    {member.currentHostGroupId || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  Operation detail
                </h2>
                <p className="text-sm text-muted-foreground">
                  The selected operation shows the exact snapshotted member
                  targets and linked child resources.
                </p>
              </div>
              {operationId ? (
                <Button
                  buttonStyle="outline"
                  buttonColor="secondary"
                  onClick={() => refreshOperation()}
                >
                  <RefreshCwIcon />
                  Refresh
                </Button>
              ) : null}
            </div>
          </div>

          {!operationId ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              Launch a group action, module run, or deployment to inspect its
              target snapshot here.
            </div>
          ) : operationResponse.$status === 'failed' && !operation ? (
            isUnauthorizedStatus(operationStatus) ? (
              <div className="p-4">
                <FallbackState.Unauthorized withCard />
              </div>
            ) : (
              <div className="p-4">
                <FailedState.WallCentered.Retryable
                  withCard
                  errorPayload={getApiErrorDetail(operationResponse.error)}
                  onClickRetry={() => refreshOperation()}
                />
              </div>
            )
          ) : operation ? (
            <div className="grid gap-4 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border px-2 py-1 text-xs font-medium text-primary/75">
                  {operation.action}
                </span>
                <span>{operation.status}</span>
                <span>•</span>
                <span>{operation.targetCount} targets</span>
                <span>•</span>
                <span>{operation.succeededCount} succeeded</span>
                <span>•</span>
                <span>{operation.failedCount} failed</span>
                {!terminalOperationStatus(operation.status) ? (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <TriangleAlertIcon className="size-3.5" />
                      Polling
                    </span>
                  </>
                ) : null}
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[960px]">
                  <div className="grid grid-cols-[minmax(180px,1fr)_120px_180px_180px_minmax(220px,1.1fr)] gap-4 border-b pb-2 text-xs font-semibold uppercase text-muted-foreground">
                    <span>Server</span>
                    <span>Status</span>
                    <span>Execution</span>
                    <span>Deployment</span>
                    <span>Error</span>
                  </div>

                  {operation.targets.map((target) => (
                    <div
                      key={target.id}
                      className="grid grid-cols-[minmax(180px,1fr)_120px_180px_180px_minmax(220px,1.1fr)] gap-4 border-b py-3 text-sm last:border-b-0"
                    >
                      <Link
                        to="/servers/$id"
                        params={{ id: target.serverId }}
                        className="truncate font-medium text-primary hover:underline"
                      >
                        {target.serverId}
                      </Link>
                      <span>{target.status}</span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {target.executionId || '-'}
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {target.deploymentId || '-'}
                      </span>
                      <span className="text-muted-foreground">
                        {target.error || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={addMembersOpen}
        onOpenChange={(open) => {
          setAddMembersOpen(open);
          if (!open) resetDialogState();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Pick the exact servers to add to {group.name}. Current assignment
              is shown for conflict awareness.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto rounded-lg border bg-background">
            {availableServers.map((server) => {
              const serverId = String(server.id ?? '');

              return (
                <label
                  key={serverId}
                  className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <Checkbox
                    checked={selectedServerIds.includes(serverId)}
                    onCheckedChange={(checked) =>
                      handleSelectServer(serverId, checked === true)
                    }
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-primary">
                        {server.hostname || serverId}
                      </span>
                      {server.host_group_id ? (
                        <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                          current group {server.host_group_id}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {server.address || 'No public address'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setAddMembersOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleAddMembers}>
              {isSubmitting ? 'Saving...' : 'Add Members'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setUpgradeVersion('');
            setSubmitError('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingAction?.title}</DialogTitle>
            <DialogDescription>
              This will snapshot exactly {memberCount} member
              {memberCount === 1 ? '' : 's'} before the action is queued.
            </DialogDescription>
          </DialogHeader>

          {pendingAction?.action === 'upgrade' ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium">Version</span>
              <Input
                value={upgradeVersion}
                onChange={(event) => setUpgradeVersion(event.target.value)}
                placeholder="v2.3.1"
              />
            </label>
          ) : null}

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmitAction}>
              {isSubmitting ? 'Queueing...' : 'Queue Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deployOpen}
        onOpenChange={(open) => {
          setDeployOpen(open);
          if (!open) resetDialogState();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy artifact</DialogTitle>
            <DialogDescription>
              The deployment will target exactly {memberCount} member
              {memberCount === 1 ? '' : 's'} in {group.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Application</span>
              <Select
                value={selectedApplicationId}
                onValueChange={(value) => {
                  setSelectedApplicationId(value);
                  setSelectedArtifactId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((application) => (
                    <SelectItem
                      key={String(application.id ?? '')}
                      value={String(application.id ?? '')}
                    >
                      {application.name ||
                        application.domain ||
                        String(application.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Artifact</span>
              <Select
                value={selectedArtifactId}
                onValueChange={setSelectedArtifactId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an artifact" />
                </SelectTrigger>
                <SelectContent>
                  {artifacts.map((artifact) => (
                    <SelectItem
                      key={String(artifact.id ?? '')}
                      value={String(artifact.id ?? '')}
                    >
                      {artifact.head ||
                        artifact.branch ||
                        `Artifact ${artifact.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setDeployOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleDeploy}>
              {isSubmitting ? 'Queueing...' : 'Deploy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
