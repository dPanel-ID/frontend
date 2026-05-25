import { useMemo, useState } from 'react';

import {
  Building2Icon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  FolderPlusIcon,
  SearchIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { WorkspacePickerItem } from '@/features/app-shell/rules/types';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { Tabs, TabsList, TabsTrigger } from '@/shared/presentation/atoms/Tabs';

import type { WorkspacePickerModalProps, WorkspacePickerTab } from './types';

const WORKSPACE_TABS: WorkspacePickerTab[] = ['all', 'personal', 'teams'];

function workspaceMatchesQuery(workspace: WorkspacePickerItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchable = [
    workspace.name,
    workspace.id,
    workspace.workspaceId ?? '',
    workspace.type,
    workspace.role ?? '',
    workspace.status ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return searchable.includes(normalizedQuery);
}

function filterWorkspacesByTab(
  workspaces: WorkspacePickerItem[],
  tab: WorkspacePickerTab,
) {
  switch (tab) {
    case 'personal':
      return workspaces.filter((workspace) => workspace.type === 'personal');

    case 'teams':
      return workspaces.filter((workspace) => workspace.type === 'team');

    case 'all':
    default:
      return workspaces;
  }
}

function WorkspaceRow(props: {
  workspace: WorkspacePickerItem;
  selectedWorkspaceId?: string | null;
  onClickWorkspace: (workspace: WorkspacePickerItem) => void;
  onClickWorkspaceDetails: (workspace: WorkspacePickerItem) => void;
}) {
  const {
    workspace,
    selectedWorkspaceId,
    onClickWorkspace,
    onClickWorkspaceDetails,
  } = props;

  const t = useDevetekTranslations();

  const selected = workspace.workspaceId === selectedWorkspaceId;
  const workspaceType =
    workspace.type === 'personal'
      ? t('sidebar.workspacePicker.typePersonal')
      : t('sidebar.workspacePicker.typeTeam');

  return (
    <TableRow
      aria-selected={selected}
      data-state={selected ? 'selected' : undefined}
      className="group"
    >
      <TableCell className="w-10 text-center">
        <Button
          size="icon-sm"
          buttonStyle={selected ? 'flat' : 'outline'}
          buttonColor={selected ? 'primary' : 'secondary'}
          aria-pressed={selected}
          aria-label={
            selected
              ? t('sidebar.workspacePicker.selectedWorkspace', {
                  name: workspace.name,
                })
              : t('sidebar.workspacePicker.selectWorkspace', {
                  name: workspace.name,
                })
          }
          title={
            selected
              ? t('sidebar.workspacePicker.selectedWorkspace', {
                  name: workspace.name,
                })
              : t('sidebar.workspacePicker.selectWorkspace', {
                  name: workspace.name,
                })
          }
          onClick={() => onClickWorkspace(workspace)}
        >
          <CheckIcon
            className="size-4 opacity-0 data-[selected=true]:opacity-100"
            data-selected={selected}
          />
        </Button>
      </TableCell>
      <TableCell className="min-w-[240px]">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card">
            {workspace.type === 'personal' ? (
              <CircleUserRoundIcon className="size-4 text-primary/75" />
            ) : (
              <Building2Icon className="size-4 text-primary/75" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-primary">
                {workspace.name}
              </p>
              {selected && (
                <Badge variant="outline">
                  {t('sidebar.workspacePicker.current')}
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-primary/55">
              {workspace.description}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-primary/75">{workspaceType}</TableCell>
      <TableCell className="font-mono text-xs text-primary/65">
        {workspace.id}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {workspace.role || t('sidebar.workspacePicker.roleMember')}
        </Badge>
      </TableCell>
      <TableCell className="text-primary/65">
        {workspace.status || t('sidebar.workspacePicker.isolatedResources')}
      </TableCell>
      <TableCell className="w-24">
        <div className="flex items-center justify-end gap-1">
          {workspace.type === 'team' && (
            <Button
              size="icon-sm"
              buttonStyle="ghost"
              buttonColor="secondary"
              aria-label={t('sidebar.workspacePicker.manageWorkspaceNamed', {
                name: workspace.name,
              })}
              title={t('sidebar.workspacePicker.manageWorkspace')}
              onClick={() => onClickWorkspaceDetails(workspace)}
            >
              <UsersIcon className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function WorkspacePickerModal(props: WorkspacePickerModalProps) {
  const {
    open,
    selectedWorkspaceId,
    workspaces,
    searchQuery,
    pagination,
    isLoading,
    onOpenChange,
    onSearchQueryChange,
    onPageChange,
    onClickCreateWorkspace,
    onClickWorkspace,
    onClickWorkspaceDetails,
  } = props;

  const t = useDevetekTranslations();

  const [tab, setTab] = useState<WorkspacePickerTab>('all');
  const showPagination = tab !== 'personal' && pagination != null;

  const filteredWorkspaces = useMemo(() => {
    const tabWorkspaces = filterWorkspacesByTab(workspaces, tab);

    if (!searchQuery.trim()) return tabWorkspaces;

    return tabWorkspaces.filter((workspace) => {
      if (workspace.type === 'personal') {
        return workspaceMatchesQuery(workspace, searchQuery);
      }

      return true;
    });
  }, [searchQuery, tab, workspaces]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88svh] max-w-5xl flex-col overflow-hidden rounded-xl p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {t('sidebar.workspacePicker.title')}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {t('sidebar.workspacePicker.description')}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={onClickCreateWorkspace}
              >
                <FolderPlusIcon className="size-4" />
                {t('sidebar.workspacePicker.newWorkspace')}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="shrink-0 space-y-3 overflow-hidden px-6 pb-3 pt-5">
          <label className="flex min-h-11 items-center gap-3 rounded-lg border bg-card px-3 focus-within:border-primary">
            <SearchIcon className="size-4 text-primary/55" />
            <span className="sr-only">
              {t('sidebar.workspacePicker.searchLabel')}
            </span>
            <input
              className="w-full bg-transparent text-sm outline-hidden"
              placeholder={t('sidebar.workspacePicker.searchPlaceholder')}
              value={searchQuery}
              aria-label={t('sidebar.workspacePicker.searchLabel')}
              autoComplete="off"
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </label>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as WorkspacePickerTab)}
          >
            <TabsList className="bg-transparent p-0">
              {WORKSPACE_TABS.map((workspaceTab) => (
                <TabsTrigger
                  key={workspaceTab}
                  value={workspaceTab}
                  className="rounded-none border-b-2 border-transparent bg-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {t(`sidebar.workspacePicker.tabs.${workspaceTab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mx-6 min-h-0 flex-1 overflow-auto rounded-lg border">
          <Table>
            <TableCaption className="sr-only">
              {t('sidebar.workspacePicker.tableCaption')}
            </TableCaption>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>{t('sidebar.workspacePicker.columns.name')}</TableHead>
                <TableHead>{t('sidebar.workspacePicker.columns.type')}</TableHead>
                <TableHead>{t('sidebar.workspacePicker.columns.id')}</TableHead>
                <TableHead>{t('sidebar.workspacePicker.columns.role')}</TableHead>
                <TableHead>
                  {t('sidebar.workspacePicker.columns.resources')}
                </TableHead>
                <TableHead className="text-right">
                  {t('sidebar.workspacePicker.columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-72 text-center text-primary/60"
                  >
                    {t('sidebar.workspacePicker.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredWorkspaces.length ? (
                filteredWorkspaces.map((workspace) => (
                  <WorkspaceRow
                    key={`${workspace.type}-${workspace.id}`}
                    workspace={workspace}
                    selectedWorkspaceId={selectedWorkspaceId}
                    onClickWorkspace={onClickWorkspace}
                    onClickWorkspaceDetails={onClickWorkspaceDetails}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-72 text-center text-primary/60"
                  >
                    {t('sidebar.workspacePicker.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-6 pb-6 pt-5">
          <p className="text-xs text-primary/55">
            {t('sidebar.workspacePicker.footer')}
          </p>
          <div className="flex items-center gap-2">
            {showPagination && (
              <div className="flex items-center gap-2 text-xs text-primary/60">
                <Button
                  size="icon-sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  disabled={pagination.page <= 1 || isLoading}
                  aria-label={t('sidebar.workspacePicker.previousPage')}
                  title={t('sidebar.workspacePicker.previousPage')}
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="whitespace-nowrap">
                  {t('sidebar.workspacePicker.pageInfo', {
                    page: pagination.page,
                    totalPage: pagination.totalPages,
                    totalItem: pagination.totalItems,
                  })}
                </span>
                <Button
                  size="icon-sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  aria-label={t('sidebar.workspacePicker.nextPage')}
                  title={t('sidebar.workspacePicker.nextPage')}
                  onClick={() =>
                    onPageChange(
                      Math.min(pagination.totalPages, pagination.page + 1),
                    )
                  }
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            )}
            <Button
              buttonStyle="ghost"
              buttonColor="secondary"
              onClick={() => onOpenChange(false)}
            >
              {t('common.actions.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
