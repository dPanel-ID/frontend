import { useEffect, useMemo, useState } from 'react';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { CalendarIcon, FolderTreeIcon, PlusCircleIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';

import { toHostGroupSummary } from '@/entities/host-group/adapter';

import { useRetainedResponseData } from '@/features/server-groups/usecase/use-retained-response-data';
import { ApiHostGroup, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { buildHostGroupMemberCountMap } from '@/features/server-groups/shared/lib/member-counts';
import { toSelectableMachine } from '@/features/select-machine-modal/view/machine-options';
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
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

export const Route = createFileRoute('/_with-app-layout/servers/groups/')({
  component: ServerGroupsPage,
});

function isUnauthorizedStatus(status?: number | string) {
  const normalizedStatus = Number(status);

  return normalizedStatus === 401 || normalizedStatus === 403;
}

function isConfigDisabledMessage(message: string) {
  return /(disabled|not configured|unavailable)/i.test(message);
}

function ServerGroupsPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuthLoggedIn();
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [serverPage, setServerPage] = useState(1);
  const [serverSearchQuery, setServerSearchQuery] = useState('');

  const [groupsResponse, refreshGroups] = ApiHostGroup.Find.useGet({});
  const [serversResponse, refreshServers] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page: serverPage,
    pageSize: 20,
    searchQuery: serverSearchQuery.trim() || undefined,
    userId: userProfile.id,
  });
  const { data: retainedGroupsData, isDegraded: isGroupsDegraded } =
    useRetainedResponseData(groupsResponse);

  const groups = useMemo(() => {
    if (retainedGroupsData) {
      return retainedGroupsData
        .map((item) => toHostGroupSummary(item).unwrap())
        .sort(
          (a, b) =>
            b.timestamp.updated.getTime() - a.timestamp.updated.getTime(),
        );
    }

    return [];
  }, [retainedGroupsData]);

  const availableServers =
    serversResponse.$status === 'success'
      ? (serversResponse.machines ?? [])
      : serversResponse.$status === 'loading' && serversResponse.prevData
        ? (serversResponse.prevData.machines ?? [])
        : [];
  const selectableServers = availableServers
    .map((server) => toSelectableMachine(server))
    .filter((server) => server != null);
  const serverPagination =
    serversResponse.$status === 'success'
      ? serversResponse.pagination
      : serversResponse.$status === 'loading'
        ? serversResponse.prevData?.pagination
        : undefined;

  useEffect(() => {
    const groupIds = groups.map((group) => group.id);

    if (groupIds.length === 0) {
      setMemberCounts({});
      return;
    }

    let isDisposed = false;

    void (async () => {
      const responses = await Promise.all(
        groupIds.map((groupId) => ApiHostGroup.Detail.$Id.fetchGet({ id: groupId })),
      );

      if (isDisposed) return;

      setMemberCounts(
        buildHostGroupMemberCountMap(
          responses
            .filter((response) => response.$status === 'success')
            .map((response) => ({
              id: String(response.id ?? ''),
              members: response.members,
            })),
        ),
      );
    })();

    return () => {
      isDisposed = true;
    };
  }, [groups]);

  const groupsStatus =
    groupsResponse.$status === 'failed' && groupsResponse.kind === 'api'
      ? groupsResponse.error.status
      : undefined;
  const groupsErrorMessage =
    groupsResponse.$status === 'failed'
      ? getApiErrorDetail(groupsResponse.error)
      : '';

  const handleToggleServer = (serverId: string, checked: boolean) => {
    setSelectedServerIds((current) =>
      checked
        ? [...current, serverId]
        : current.filter((id) => id !== serverId),
    );
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreateDescription('');
    setSelectedServerIds([]);
    setServerPage(1);
    setServerSearchQuery('');
    setSubmitError('');
    setIsSubmitting(false);
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      setSubmitError('Group name is required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const response = await ApiHostGroup.Create.doPost({
      name: createName.trim(),
      description: createDescription.trim() || undefined,
      server_ids: selectedServerIds,
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setSubmitError(getApiErrorDetail(response.error));
      return;
    }

    const createdId = response.id;
    setCreateOpen(false);
    resetCreateForm();
    refreshGroups();

    if (createdId) {
      navigate({
        to: '/servers/groups/$id',
        params: {
          id: createdId,
        },
      });
    }
  };

  return (
    <>
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              { text: 'Dashboard', url: '/dashboard' },
              { text: 'Servers', url: '/servers' },
            ]}
          />
        }
        title="Server Groups"
        description="Manage explicit server groups for coordinated module runs, deployments, and bulk operations."
        footnote="Groups are explicit-only. Servers stay unchanged unless you select a group on purpose."
        rightAppend={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => navigate({ to: '/servers' })}
            >
              Back to Servers
            </Button>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setCreateOpen(true)}
            >
              <PlusCircleIcon />
              Create Group
            </Button>
          </div>
        }
        statuses={[
          {
            kind: 'status',
            icon: FolderTreeIcon,
            text: `${groups.length} groups`,
          },
        ]}
      />

      <div className="flex flex-col gap-4">
        {isGroupsDegraded ? (
          <FailedState.BannerRetryable onClickRetry={() => refreshGroups()} />
        ) : null}

        {groupsResponse.$status === 'loading' && groups.length === 0 ? (
          <PageHeaderShimmer hasStatuses />
        ) : null}

        {groupsResponse.$status === 'failed' && groups.length === 0 ? (
          isUnauthorizedStatus(groupsStatus) ? (
            <FallbackState.Unauthorized withCard />
          ) : isConfigDisabledMessage(groupsErrorMessage) ? (
            <div className="rounded-lg border border-dashed bg-card px-4 py-6 text-sm text-muted-foreground">
              Server group management is currently unavailable in this
              environment.
            </div>
          ) : (
            <FailedState.WallCentered.Retryable
              withCard
              errorPayload={getApiErrorDetail(groupsResponse.error)}
              onClickRetry={() => refreshGroups()}
            />
          )
        ) : null}

        {groupsResponse.$status !== 'failed' && groups.length === 0 ? (
          <EmptyState
            title="No server groups yet"
            message="Create a group to manage explicit member sets for coordinated server work."
            ctaText="Create Group"
            ctaOnClick={() => setCreateOpen(true)}
          />
        ) : null}

        {groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                to="/servers/groups/$id"
                params={{ id: group.id }}
                className="rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-card/90"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-primary">
                      {group.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {group.description || 'No description provided.'}
                    </p>
                  </div>
                  <span className="rounded-full border px-2 py-1 text-xs font-medium text-primary/75">
                    {memberCounts[group.id] != null
                      ? `${memberCounts[group.id]} members`
                      : 'Members unavailable'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarIcon className="size-3.5" />
                  Updated {group.timestamp.updated.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Server Group</DialogTitle>
            <DialogDescription>
              Choose a name, optional description, and the exact servers that
              should be snapshotted for group actions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Name</span>
              <Input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Production API"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Description</span>
              <TextArea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                placeholder="Explicit application servers for production fan-out operations."
              />
            </label>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Members</span>
                <span className="text-xs text-muted-foreground">
                  {selectedServerIds.length} selected
                </span>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium">Search machines</span>
                <Input
                  value={serverSearchQuery}
                  onChange={(event) => {
                    setServerSearchQuery(event.target.value);
                    setServerPage(1);
                  }}
                  placeholder="Filter by hostname"
                />
              </label>

              <div className="max-h-72 overflow-y-auto rounded-lg border bg-background">
                {serversResponse.$status === 'loading' &&
                selectableServers.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : null}

                {serversResponse.$status === 'failed' ? (
                  <div className="grid gap-3 p-4">
                    <FailedState.BannerRetryable
                      onClickRetry={() => refreshServers()}
                    />
                    <p className="text-sm text-destructive">
                      {getApiErrorDetail(serversResponse.error)}
                    </p>
                  </div>
                ) : null}

                {serversResponse.$status !== 'failed' &&
                selectableServers.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No machines match the current search.
                  </div>
                ) : null}

                {selectableServers.map((server) => {
                  const serverId = server.id;

                  return (
                    <label
                      key={serverId}
                      className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 border-b px-4 py-3 last:border-b-0"
                    >
                      <Checkbox
                        checked={selectedServerIds.includes(serverId)}
                        onCheckedChange={(checked) =>
                          handleToggleServer(serverId, checked === true)
                        }
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-primary">
                            {server.hostname}
                          </span>
                          {server.currentHostGroupId ? (
                            <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                              current group {server.currentHostGroupId}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {server.address}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Page {serverPagination?.page ?? serverPage} of{' '}
                  {serverPagination?.total_page ?? 1}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    buttonStyle="outline"
                    buttonColor="secondary"
                    disabled={(serverPagination?.page ?? serverPage) <= 1}
                    onClick={() =>
                      setServerPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    buttonStyle="outline"
                    buttonColor="secondary"
                    disabled={
                      (serverPagination?.page ?? serverPage) >=
                      (serverPagination?.total_page ?? 1)
                    }
                    onClick={() => setServerPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} onClick={handleCreate}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
