import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Badge } from '@/shared/presentation/atoms/Badge';

import type { WorkspaceRolesDetailModalProps as Props } from '../rules/types';

export default function WorkspaceRolesDetailModal(props: Props) {
  const t = useDevetekTranslations();
  const roles = props.roles.filter(Boolean);

  return (
    <ModalLayoutGeneral maxWidth="520px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('modal.workspaceRoles.title')}
        description={t('modal.workspaceRoles.description', {
          workspace: props.workspaceName,
        })}
      />

      <ModalLayoutGeneral.Content className="flex flex-col gap-3">
        <section className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card">
              <ShieldCheckIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {props.workspaceName}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('modal.workspaceRoles.activeWorkspace')}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {t('modal.workspaceRoles.roleCount', { count: roles.length })}
          </Badge>
        </section>

        {roles.length > 0 ? (
          <ul className="grid gap-2">
            {roles.map((role) => (
              <li
                key={role}
                className="flex min-w-0 items-center gap-3 rounded-md border bg-background p-3"
              >
                <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 truncate text-sm font-medium capitalize">
                  {role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <section className="rounded-md border border-dashed bg-background p-6 text-center text-sm text-muted-foreground">
            {t('modal.workspaceRoles.empty')}
          </section>
        )}
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
