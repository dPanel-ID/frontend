import { useEffect, useMemo, useState } from 'react';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
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

import { useDialog } from '@/services/dialog';

import {
  toHostGroupDetail,
  toHostGroupOperation,
} from '@/entities/host-group/adapter';
import { toServerModuleFromCatalog } from '@/entities/server-modules/lib/catalog';

import { useSelectMachineModal } from '@/features/select-machine-modal';
import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';
import {
  getOperationRefreshInterval,
  isTerminalOperationStatus,
} from '@/features/server-groups/shared/lib/operation';
import { useServerGroupMemberMutations } from '@/features/server-groups/usecase/member-mutations';
import { MembersTable } from '@/features/server-groups/view/MembersTable';
import { OperationTargetsTable } from '@/features/server-groups/view/OperationTargetsTable';
import { isSemanticReleaseTag } from '@/features/server-groups/shared/lib/validation';

import {
  ApiApplication,
  ApiArtifact,
  ApiDeploy,
  ApiHostGroup,
  ApiModule,
} from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import type { ExplicitTarget } from '@/shared/rules/host-group';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
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

function ServerGroupDetailPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { operationId } = Route.useSearch();
  const [openDialog] = useDialog();
  const [openSelectMachineModal] = useSelectMachineModal();
  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const [deployOpen, setDeployOpen] = useState(false);
  const [operationRefreshStatus, setOperationRefreshStatus] = useState<
    string | undefined
  >();
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
        refreshIntervalMs: getOperationRefreshInterval(
          operationId,
          operationRefreshStatus,
        ),
      },
    });

  const [applicationsResponse, refreshApplications] = ApiApplication.Find.useGet({
    page: 1,
    limit: 100,
  });

  const [artifactsResponse, refreshArtifacts] = ApiArtifact.Find.useGet({
    applicationId: selectedApplicationId || id,
    limit: 50,
    page: 1,
    options: {
      skip: !selectedApplicationId,
    },
  });

  const [modulesResponse, refreshModules] = ApiModule.Find.useGet({
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

  const groupTarget: ExplicitTarget = {
    type: 'hostgroup',
    id,
  };

  const memberCount = group?.memberCount ?? 0;
  const {
    isMutatingMembers,
    memberActionError,
    pendingMemberAction,
    removeMember,
    submitMembers,
  } = useServerGroupMemberMutations({
    groupId: id,
    onSuccess: () => {
      resetDialogState();
      refreshDetail();
    },
  });

  const resetDialogState = () => {
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

  const handleRemoveMember = (serverId: string, hostname: string) => {
    openDialog({
      title: 'Remove member',
      content: <>Remove {hostname} from this explicit server group?</>,
      variant: 'info',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          await removeMember(serverId);
        },
      },
    });
  };

  const handleOpenMembersPicker = (mode: 'add' | 'replace') => {
    openSelectMachineModal({
      confirmLabel: mode === 'replace' ? 'Replace Members' : 'Add Members',
      description:
        mode === 'replace'
          ? `Choose the exact servers that should remain in ${group?.name ?? 'this group'}.`
          : `Choose the exact servers to add to ${group?.name ?? 'this group'}.`,
      disabledMachineIds:
        mode === 'add'
          ? group?.members
              .map((member) => Number(member.id))
              .filter((memberId) => Number.isFinite(memberId)) ?? []
          : [],
      initialSelectedMachineIds:
        mode === 'replace'
          ? group?.members
              .map((member) => Number(member.id))
              .filter((memberId) => Number.isFinite(memberId)) ?? []
          : [],
      onMachinesSelected: async (machineIds) => {
        await submitMembers(
          machineIds.map((machineId) => String(machineId)),
          mode,
        );
      },
      selectionMode: 'multiple',
      title: mode === 'replace' ? 'Replace Members' : 'Add Members',
    });
  };

  const handleSubmitAction = async () => {
    if (!pendingAction || !group) return;

    if (
      pendingAction.action === 'upgrade' &&
      !isSemanticReleaseTag(upgradeVersion)
    ) {
      setSubmitError('Enter a semantic release tag like v1.2.3.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload =
      pendingAction.action === 'upgrade'
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
      onOperationQueued: navigateToOperation,
    });
  };

  const operationStatusValue =
    operationResponse.$status === 'success'
      ? operationResponse.operation?.status
      : operationResponse.$status === 'loading'
        ? operationResponse.prevData?.operation?.status
        : undefined;

  useEffect(() => {
    setOperationRefreshStatus(operationStatusValue);
  }, [operationStatusValue]);

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
              disabled={isMutatingMembers}
              onClick={() => handleOpenMembersPicker('add')}
            >
              <PlusCircleIcon />
              Add Members
            </Button>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              disabled={isMutatingMembers}
              onClick={() => handleOpenMembersPicker('replace')}
            >
              Replace Members
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
              ) : modulesResponse.$status === 'failed' && modules.length === 0 ? (
                <FailedState.BannerRetryable onClickRetry={() => refreshModules()} />
              ) : modules.length === 0 ? (
                <div className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  No modules are currently available for this workspace.
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

          <div className="px-4 py-4">
            <MembersTable
              errorMessage={memberActionError?.message}
              members={group.members}
              onRemoveMember={(member) =>
                handleRemoveMember(member.id, member.hostname)
              }
              onRetry={memberActionError?.retry}
              pendingMemberAction={pendingMemberAction}
            />
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
                  targets and any child work IDs returned by the backend.
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
                {!isTerminalOperationStatus(operation.status) ? (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <TriangleAlertIcon className="size-3.5" />
                      Polling
                    </span>
                  </>
                ) : null}
              </div>

              <OperationTargetsTable
                groupId={id}
                operationId={operation.id}
                targets={operation.targets}
              />
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
        </section>
      </div>

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
              <span className="text-xs text-muted-foreground">
                Enter a semantic release tag such as v2.3.1.
              </span>
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
            <Button
              disabled={
                isSubmitting ||
                (pendingAction?.action === 'upgrade' &&
                  !isSemanticReleaseTag(upgradeVersion))
              }
              onClick={handleSubmitAction}
            >
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
            {applicationsResponse.$status === 'failed' ? (
              <FailedState.BannerRetryable
                onClickRetry={() => refreshApplications()}
              />
            ) : null}

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
              {artifactsResponse.$status === 'failed' && selectedApplicationId ? (
                <FailedState.BannerRetryable
                  onClickRetry={() => refreshArtifacts()}
                />
              ) : null}
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
