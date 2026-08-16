import { useEffect, useMemo, useState } from 'react';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { CalendarIcon, FolderTreeIcon, PlusCircleIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';

import { toHostGroupSummary } from '@/entities/host-group/adapter';

import { ApiHostGroup, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { buildHostGroupMemberCountMap } from '@/features/server-groups/shared/lib/member-counts';
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

  const [groupsResponse, refreshGroups] = ApiHostGroup.Find.useGet({});
  const [serversResponse] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page: 1,
    pageSize: 200,
    userId: userProfile.id,
  });

  const groups = useMemo(() => {
    if (groupsResponse.$status === 'success') {
      return groupsResponse
        .map((item) => toHostGroupSummary(item).unwrap())
        .sort(
          (a, b) =>
            b.timestamp.updated.getTime() - a.timestamp.updated.getTime(),
        );
    }

    return groupsResponse.$status === 'loading'
      ? (groupsResponse.prevData?.map((item) =>
          toHostGroupSummary(item).unwrap(),
        ) ?? [])
      : [];
  }, [groupsResponse]);

  const availableServers =
    serversResponse.$status === 'success'
      ? (serversResponse.machines ?? [])
      : [];

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
        {groupsResponse.$status === 'loading' && groups.length === 0 ? (
          <PageHeaderShimmer hasStatuses />
        ) : null}

        {groupsResponse.$status === 'failed' ? (
          isUnauthorizedStatus(groupsStatus) ? (
            <FallbackState.Unauthorized withCard />
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

              <div className="max-h-72 overflow-y-auto rounded-lg border bg-background">
                {serversResponse.$status === 'loading' ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : null}

                {serversResponse.$status === 'failed' ? (
                  <div className="p-4 text-sm text-destructive">
                    {getApiErrorDetail(serversResponse.error)}
                  </div>
                ) : null}

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
                          handleToggleServer(serverId, checked === true)
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
