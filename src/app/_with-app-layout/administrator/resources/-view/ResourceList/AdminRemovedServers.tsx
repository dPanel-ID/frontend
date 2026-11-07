import { CloudOffIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ApiAdmin } from '@/shared/api';
import type { AdminReturnedServerDto } from '@/shared/api/admin.server.removed';

import { WorkspaceBadge } from '../-presentation/WorkspaceBadge';

/**
 * Removed servers of every workspace whose agent called in the last 7 days.
 * Many from one workspace point at an owner who removed servers during an
 * outage (backend docs/architecture/removed-servers.md).
 */
export default function AdminRemovedServers() {
  const t = useDevetekTranslations('page.adminResources.removed');
  const locale = useDevetekLocale();
  const [response] = ApiAdmin.Server.Removed.useGet();

  if (response.$status !== 'success' || !Array.isArray(response)) return null;
  const servers: AdminReturnedServerDto[] = response;
  if (servers.length === 0) return null;

  const formatTime = (value?: string) =>
    value ? new Date(value).toLocaleString(locale) : '-';

  return (
    <section className="rounded-2xl border border-amber-400/40 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 font-semibold">
        <CloudOffIcon className="size-4 text-amber-600 dark:text-amber-300" />
        {t('title', { count: servers.length })}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      <ul className="mt-3 grid gap-2 text-sm">
        {servers.map((server) => (
          <li
            key={server.machine_id}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="font-semibold">
              {server.hostname || server.machine_id}
            </span>
            <WorkspaceBadge
              type={server.workspace_type === 'group' ? 'team' : 'personal'}
              id={
                server.workspace_type === 'group'
                  ? server.workspace_id
                  : undefined
              }
            />
            <span className="text-muted-foreground">
              {t('item', {
                id: server.machine_id,
                reason: server.reason ?? '-',
                removedAt: formatTime(server.removed_at),
                lastContact: formatTime(server.last_contact_at),
                calls: server.contact_count ?? 0,
                upgrade: formatTime(server.upgrade_offered_at),
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
