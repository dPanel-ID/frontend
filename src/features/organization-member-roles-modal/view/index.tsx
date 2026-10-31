import { useMemo, useState } from 'react';

import {
  AppWindowIcon,
  CloudIcon,
  CreditCardIcon,
  DatabaseIcon,
  GlobeIcon,
  KeyRoundIcon,
  NetworkIcon,
  RefreshCwIcon,
  SaveIcon,
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';
import { useToaster } from '@/services/toaster';

import { ApiOrganization, ApiOrganizationPeople } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import type { OrganizationMemberRolesModalProps as Props } from '../rules/types';
import { roleSelectionSchema } from '../rules/types';

type Role = DTOs.OrganizationAvailableRoleV1;
type RoleGroup = DTOs.OrganizationAvailableRoleGroupV1;

interface AvailableRolesResponse {
  role_groups?: RoleGroup[];
  roles?: Role[];
}

const ROLE_LEVEL_PRIORITY: Record<string, number> = {
  admin: 60,
  editor: 50,
  devops: 45,
  developer: 40,
  billing: 30,
  viewer: 20,
  owner: 10,
};

function roleValue(role: Role) {
  return (
    role.slug ||
    role.role_group_id ||
    role.workspace_role ||
    role.template_role ||
    role.name ||
    ''
  );
}

function roleAliases(role: Role) {
  return [
    role.slug,
    role.role_group_id,
    role.workspace_role,
    role.template_role,
    role.name,
  ].filter(Boolean) as string[];
}

function isRoleAssignable(role: Role) {
  return (
    // The backend marks protected roles (owner, admin) assignable only for
    // workspace owners.
    role.assignable !== false && !!roleValue(role)
  );
}

function isOwnerRole(role: Role) {
  const value = roleValue(role).toLowerCase();
  const level = role.level?.toLowerCase();

  return (
    value === 'owner' || value.endsWith('-role-owner') || level === 'owner'
  );
}

function groupKey(group: RoleGroup, index: number) {
  return group.slug || group.kind || group.name || `group-${index}`;
}

function resourceLabel(resource?: string | null) {
  if (!resource) return 'Workspace';

  return resource
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function groupDisplayName(group: RoleGroup) {
  return (
    group.name ||
    resourceLabel(
      group.roles?.find((role) => role.resource)?.resource || group.slug,
    )
  );
}

function isSingleSelectionGroup(group: RoleGroup) {
  if (group.selection_mode === 'single') return true;

  const conflictGroups = new Set(
    (group.roles ?? []).map((role) => role.conflict_group).filter(Boolean),
  );

  return conflictGroups.size === 1 && (group.roles?.length ?? 0) > 1;
}

function preferredRoleForGroup(group: RoleGroup) {
  const roles = (group.roles ?? [])
    .filter(isRoleAssignable)
    .filter((role) => !isOwnerRole(role));

  return roles.sort((a, b) => {
    const aLevel = ROLE_LEVEL_PRIORITY[a.level?.toLowerCase() ?? ''] ?? 0;
    const bLevel = ROLE_LEVEL_PRIORITY[b.level?.toLowerCase() ?? ''] ?? 0;

    return bLevel - aLevel;
  })[0];
}

function getSelectableRoleValues(group: RoleGroup) {
  if (isSingleSelectionGroup(group)) {
    const preferred = preferredRoleForGroup(group);
    return preferred ? [roleValue(preferred)] : [];
  }

  return (group.roles ?? [])
    .filter(isRoleAssignable)
    .filter((role) => !isOwnerRole(role))
    .map(roleValue)
    .filter(Boolean);
}

function canonicalizeSelection(selection: Set<string>, groups: RoleGroup[]) {
  const next = new Set(selection);
  const allRoles = groups.flatMap((group) => group.roles ?? []);

  selection.forEach((roleId) => {
    const matchedRole = allRoles.find((role) =>
      roleAliases(role).includes(roleId),
    );
    const canonicalValue = matchedRole ? roleValue(matchedRole) : '';

    if (canonicalValue && canonicalValue !== roleId) {
      next.delete(roleId);
      next.add(canonicalValue);
    }
  });

  return next;
}

function buildGroups(response: AvailableRolesResponse): RoleGroup[] {
  if ((response.role_groups?.length ?? 0) > 0) {
    return response.role_groups ?? [];
  }

  const groupedRoles = new Map<string, Role[]>();

  (response.roles ?? []).forEach((role) => {
    const key = role.resource || role.kind || 'workspace';
    groupedRoles.set(key, [...(groupedRoles.get(key) ?? []), role]);
  });

  return [...groupedRoles.entries()].map(([resource, roles]) => ({
    slug: resource,
    name: resourceLabel(resource),
    kind: roles[0]?.kind,
    selection_mode: 'multiple',
    roles,
  }));
}

function ResourceIcon(props: { group: RoleGroup }) {
  const resource =
    props.group.roles?.find((role) => role.resource)?.resource ||
    props.group.slug ||
    props.group.kind ||
    '';

  switch (resource) {
    case 'workspace':
      return <UsersIcon className="size-4" />;

    case 'cloud-project':
      return <CloudIcon className="size-4" />;

    case 'server':
      return <ServerIcon className="size-4" />;

    case 'application':
      return <AppWindowIcon className="size-4" />;

    case 'database':
      return <DatabaseIcon className="size-4" />;

    case 'domain':
      return <GlobeIcon className="size-4" />;

    case 'load-balancer':
      return <NetworkIcon className="size-4" />;

    case 'billing':
      return <CreditCardIcon className="size-4" />;

    case 'secret':
      return <KeyRoundIcon className="size-4" />;

    default:
      return <ShieldCheckIcon className="size-4" />;
  }
}

export default function OrganizationMemberRolesModal(props: Props) {
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const emitModal = useModalEmit();

  const [response, refresh] = ApiOrganization.Role.Available.useGet({
    organizationId: props.organizationId,
  });

  const [selectedRoles, setSelectedRoles] = useState(
    () => new Set(props.initialRoleIds.filter(Boolean)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groups = useMemo(() => {
    if (response.$status !== 'success') return [];
    return buildGroups(response);
  }, [response]);

  const canonicalSelectedRoles = useMemo(() => {
    if (groups.length < 1) return selectedRoles;
    return canonicalizeSelection(selectedRoles, groups);
  }, [groups, selectedRoles]);

  const selectedCount = canonicalSelectedRoles.size;

  const isChecked = (role: Role) =>
    roleAliases(role).some((alias) => canonicalSelectedRoles.has(alias));

  const setRoleChecked = (group: RoleGroup, role: Role, checked: boolean) => {
    const value = roleValue(role);
    if (!value || !isRoleAssignable(role)) return;

    setSelectedRoles((current) => {
      const next = new Set(current);

      if (checked) {
        if (isSingleSelectionGroup(group)) {
          (group.roles ?? []).forEach((groupRole) => {
            roleAliases(groupRole).forEach((alias) => next.delete(alias));
          });
        }

        next.add(value);
      } else {
        roleAliases(role).forEach((alias) => next.delete(alias));
      }

      return next;
    });
  };

  const setGroupChecked = (group: RoleGroup, checked: boolean) => {
    setSelectedRoles((current) => {
      const next = new Set(current);
      const values = getSelectableRoleValues(group);

      if (checked) {
        if (isSingleSelectionGroup(group)) {
          (group.roles ?? []).forEach((role) => {
            roleAliases(role).forEach((alias) => next.delete(alias));
          });
        }

        values.forEach((value) => next.add(value));
      } else {
        (group.roles ?? []).forEach((role) => {
          roleAliases(role).forEach((alias) => next.delete(alias));
        });
      }

      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedRoles((current) => {
      const next = new Set(current);

      groups.forEach((group) => {
        if (isSingleSelectionGroup(group)) {
          (group.roles ?? []).forEach((role) => {
            roleAliases(role).forEach((alias) => next.delete(alias));
          });
        }

        getSelectableRoleValues(group).forEach((value) => next.add(value));
      });

      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedRoles(new Set());
  };

  const handleSubmit = async () => {
    const payload = roleSelectionSchema.parse({
      roles: [...canonicalSelectedRoles],
    });

    setIsSubmitting(true);
    emitModal('%%modal/allow-trivial-close', false);

    const updateResponse = await ApiOrganizationPeople.Update.$Id.doPost({
      id: props.memberId,
      payload: {
        organization_id: props.organizationId,
        roles: payload.roles,
      },
    });

    emitModal('%%modal/allow-trivial-close', true);
    setIsSubmitting(false);

    if (updateResponse.$status === 'success') {
      emitModal('%%modal/close', null);
      openToaster({
        variant: 'success',
        message: t('modal.manageMemberRoles.toaster.success', {
          name: props.memberName,
        }),
      });
      props.onSubmitSuccess?.();
      return;
    }

    openToaster({
      variant: 'error',
      message:
        updateResponse.kind === 'api'
          ? updateResponse.error.message
          : t('modal.manageMemberRoles.toaster.error', {
              name: props.memberName,
            }),
    });
  };

  return (
    <ModalLayoutGeneral maxWidth="880px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('modal.manageMemberRoles.title')}
        description={t('modal.manageMemberRoles.description', {
          name: props.memberName,
        })}
      />

      <ModalLayoutGeneral.Content className="flex flex-col gap-4">
        <Toolbar
          selectedCount={selectedCount}
          isSubmitting={isSubmitting}
          isCatalogReady={response.$status === 'success'}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          onSubmit={handleSubmit}
        />

        {response.$status === 'failed' ? (
          <CatalogError onRetry={() => refresh()} />
        ) : response.$status === 'success' ? (
          <RoleGroups
            groups={groups}
            selectedRoles={canonicalSelectedRoles}
            isSubmitting={isSubmitting}
            isChecked={isChecked}
            onRoleChecked={setRoleChecked}
            onGroupChecked={setGroupChecked}
          />
        ) : (
          <CatalogLoading />
        )}
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}

function Toolbar(props: {
  selectedCount: number;
  isCatalogReady: boolean;
  isSubmitting: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSubmit: () => void;
}) {
  const {
    selectedCount,
    isCatalogReady,
    isSubmitting,
    onSelectAll,
    onClearAll,
    onSubmit,
  } = props;
  const t = useDevetekTranslations();

  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">
          {t('modal.manageMemberRoles.selectedCount', { count: selectedCount })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('modal.manageMemberRoles.selectedHint')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          buttonColor="secondary"
          buttonStyle="outline"
          disabled={!isCatalogReady || isSubmitting}
          onClick={onSelectAll}
        >
          {t('modal.manageMemberRoles.selectAll')}
        </Button>
        <Button
          size="sm"
          buttonColor="secondary"
          buttonStyle="ghost"
          disabled={isSubmitting}
          onClick={onClearAll}
        >
          {t('modal.manageMemberRoles.clearAll')}
        </Button>
        <Button
          size="sm"
          buttonColor="primary"
          buttonStyle="flat"
          disabled={!isCatalogReady || selectedCount < 1 || isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? <Spinner className="text-current" /> : <SaveIcon />}
          {t('modal.manageMemberRoles.save')}
        </Button>
      </div>
    </section>
  );
}

function CatalogLoading() {
  const t = useDevetekTranslations();

  return (
    <section className="flex min-h-[280px] items-center justify-center rounded-lg border bg-background">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        {t('modal.manageMemberRoles.loading')}
      </div>
    </section>
  );
}

function CatalogError(props: { onRetry: () => void }) {
  const { onRetry } = props;
  const t = useDevetekTranslations();

  return (
    <section className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border bg-background p-6 text-center">
      <p className="text-sm font-semibold text-primary">
        {t('modal.manageMemberRoles.errorTitle')}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {t('modal.manageMemberRoles.errorMessage')}
      </p>
      <Button
        size="sm"
        buttonColor="secondary"
        buttonStyle="outline"
        onClick={onRetry}
      >
        <RefreshCwIcon />
        {t('common.actions.retry')}
      </Button>
    </section>
  );
}

function RoleGroups(props: {
  groups: RoleGroup[];
  selectedRoles: Set<string>;
  isSubmitting: boolean;
  isChecked: (role: Role) => boolean;
  onRoleChecked: (group: RoleGroup, role: Role, checked: boolean) => void;
  onGroupChecked: (group: RoleGroup, checked: boolean) => void;
}) {
  const {
    groups,
    selectedRoles,
    isSubmitting,
    isChecked,
    onRoleChecked,
    onGroupChecked,
  } = props;
  const t = useDevetekTranslations();

  if (groups.length < 1) {
    return (
      <section className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
        {t('modal.manageMemberRoles.empty')}
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      {groups.map((group, index) => {
        const roles = group.roles ?? [];
        const selectedInGroup = roles.filter(isChecked).length;
        const selectableValues = getSelectableRoleValues(group);
        const isAllSelected =
          selectableValues.length > 0 &&
          selectableValues.every((value) => selectedRoles.has(value));
        const checkedState =
          isAllSelected || selectedInGroup < 1
            ? isAllSelected
            : 'indeterminate';

        return (
          <RoleGroupCard
            key={groupKey(group, index)}
            group={group}
            checkedState={checkedState}
            selectedInGroup={selectedInGroup}
            isSubmitting={isSubmitting}
            isChecked={isChecked}
            onRoleChecked={onRoleChecked}
            onGroupChecked={onGroupChecked}
          />
        );
      })}
    </section>
  );
}

function RoleGroupCard(props: {
  group: RoleGroup;
  checkedState: boolean | 'indeterminate';
  selectedInGroup: number;
  isSubmitting: boolean;
  isChecked: (role: Role) => boolean;
  onRoleChecked: (group: RoleGroup, role: Role, checked: boolean) => void;
  onGroupChecked: (group: RoleGroup, checked: boolean) => void;
}) {
  const {
    group,
    checkedState,
    selectedInGroup,
    isSubmitting,
    isChecked,
    onRoleChecked,
    onGroupChecked,
  } = props;
  const t = useDevetekTranslations();
  const groupName = groupDisplayName(group);
  const roles = group.roles ?? [];

  return (
    <article className="overflow-hidden rounded-lg border bg-background">
      <header className="flex flex-col gap-3 border-b bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ResourceIcon group={group} />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-primary">
                {groupName}
              </h3>
              <Badge variant="outline">
                {t('modal.manageMemberRoles.groupSelectedCount', {
                  selected: selectedInGroup,
                  total: roles.length,
                })}
              </Badge>
            </div>
            {group.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-primary">
          <Checkbox
            checked={checkedState}
            disabled={isSubmitting || roles.length < 1}
            aria-label={t('modal.manageMemberRoles.selectGroup', {
              group: groupName,
            })}
            onCheckedChange={(checked) =>
              onGroupChecked(group, checked === true)
            }
          />
          {t('modal.manageMemberRoles.selectGroupAction')}
        </label>
      </header>

      <div className="grid gap-2 p-3 md:grid-cols-2">
        {roles.map((role) => {
          const value = roleValue(role);
          const checked = isChecked(role);
          const disabled = isSubmitting || !isRoleAssignable(role);

          return (
            <label
              key={value}
              className={cn(
                'flex min-w-0 cursor-pointer gap-3 rounded-lg border bg-card/30 p-3 transition-colors',
                checked && 'border-primary/60 bg-primary/5',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                aria-label={role.name ?? value}
                onCheckedChange={(newChecked) =>
                  onRoleChecked(group, role, newChecked === true)
                }
              />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-primary">
                    {role.name || resourceLabel(role.slug)}
                  </p>
                  {role.level && (
                    <Badge variant="secondary" className="capitalize">
                      {role.level}
                    </Badge>
                  )}
                  {role.protected && (
                    <Badge variant="outline">
                      {t('modal.manageMemberRoles.protected')}
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {role.description}
                  </p>
                )}
                <p className="mt-2 truncate font-mono text-[0.65rem] text-muted-foreground">
                  {value}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </article>
  );
}
