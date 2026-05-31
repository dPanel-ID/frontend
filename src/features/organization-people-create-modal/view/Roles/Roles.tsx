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
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiOrganization } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useDcContext } from '../../model';

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
    role.assignable !== false && role.protected !== true && !!roleValue(role)
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

export default function Roles() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();
  const organizationId = form.watch('organization_id');
  const [selectedRoles, setSelectedRoles] = useState(() => new Set<string>());

  const [response, refresh] = ApiOrganization.Role.Available.useGet({
    organizationId,
  });

  const groups = useMemo(() => {
    if (response.$status !== 'success') return [];
    return buildGroups(response);
  }, [response]);

  const selectedCount = selectedRoles.size;

  const syncSelectedRoles = (next: Set<string>) => {
    setSelectedRoles(next);
    form.setValue('roles', [...next], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const isChecked = (role: Role) =>
    roleAliases(role).some((alias) => selectedRoles.has(alias));

  const handleRoleChecked = (
    group: RoleGroup,
    role: Role,
    checked: boolean,
  ) => {
    const value = roleValue(role);
    if (!value || !isRoleAssignable(role)) return;

    const next = new Set(selectedRoles);

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

    syncSelectedRoles(next);
  };

  const handleGroupChecked = (group: RoleGroup, checked: boolean) => {
    const next = new Set(selectedRoles);
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

    syncSelectedRoles(next);
  };

  const handleSelectAll = () => {
    const next = new Set(selectedRoles);

    groups.forEach((group) => {
      if (isSingleSelectionGroup(group)) {
        (group.roles ?? []).forEach((role) => {
          roleAliases(role).forEach((alias) => next.delete(alias));
        });
      }

      getSelectableRoleValues(group).forEach((value) => next.add(value));
    });

    syncSelectedRoles(next);
  };

  const handleClearAll = () => {
    syncSelectedRoles(new Set());
  };

  return (
    <section className="overflow-hidden rounded-lg border bg-background">
      <header className="flex flex-col gap-3 border-b bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">
            {t('modal.addTeamMember.rolesTitle')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('modal.addTeamMember.rolesHint')}
          </p>
          {form.formState.errors.roles?.message && (
            <p className="mt-1 text-xs font-medium text-destructive">
              {form.formState.errors.roles.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {t('modal.manageMemberRoles.selectedCount', {
              count: selectedCount,
            })}
          </Badge>
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            disabled={response.$status !== 'success'}
            onClick={handleSelectAll}
          >
            {t('modal.manageMemberRoles.selectAll')}
          </Button>
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="ghost"
            onClick={handleClearAll}
          >
            {t('modal.manageMemberRoles.clearAll')}
          </Button>
        </div>
      </header>

      <div className="max-h-[460px] overflow-y-auto p-3">
        {response.$status === 'failed' ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
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
              onClick={() => refresh()}
            >
              <RefreshCwIcon />
              {t('common.actions.retry')}
            </Button>
          </div>
        ) : response.$status !== 'success' ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            {t('modal.manageMemberRoles.loading')}
          </div>
        ) : groups.length < 1 ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
            {t('modal.manageMemberRoles.empty')}
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map((group, index) => (
              <RoleGroupCard
                key={groupKey(group, index)}
                group={group}
                selectedRoles={selectedRoles}
                isChecked={isChecked}
                onRoleChecked={handleRoleChecked}
                onGroupChecked={handleGroupChecked}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RoleGroupCard(props: {
  group: RoleGroup;
  selectedRoles: Set<string>;
  isChecked: (role: Role) => boolean;
  onRoleChecked: (group: RoleGroup, role: Role, checked: boolean) => void;
  onGroupChecked: (group: RoleGroup, checked: boolean) => void;
}) {
  const { group, selectedRoles, isChecked, onRoleChecked, onGroupChecked } =
    props;
  const t = useDevetekTranslations();
  const groupName = groupDisplayName(group);
  const roles = group.roles ?? [];
  const selectedInGroup = roles.filter(isChecked).length;
  const selectableValues = getSelectableRoleValues(group);
  const isAllSelected =
    selectableValues.length > 0 &&
    selectableValues.every((value) => selectedRoles.has(value));
  const checkedState =
    isAllSelected || selectedInGroup < 1 ? isAllSelected : 'indeterminate';

  return (
    <article className="overflow-hidden rounded-lg border bg-card/30">
      <header className="flex flex-col gap-3 border-b bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
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
            disabled={roles.length < 1}
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
          const disabled = !isRoleAssignable(role);

          return (
            <label
              key={value}
              className={cn(
                'flex min-w-0 cursor-pointer gap-3 rounded-lg border bg-background p-3 transition-colors',
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
