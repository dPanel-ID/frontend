import { CloudOffIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ApiServer } from '@/shared/api';
import type { ReturnedServerDto } from '@/shared/api/server.removed';

/**
 * Servers removed from dPanel whose agent called again in the last 7 days:
 * a forgotten server may only have been down. dPanel refuses such an agent
 * and tells it to go quiet; the owner decides whether to take the machine
 * back or stop the agent (backend docs/architecture/removed-servers.md).
 */
export default function RemovedServersNotice() {
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const [response] = ApiServer.Removed.useGet();

  if (response.$status !== 'success' || !Array.isArray(response)) return null;
  const servers: ReturnedServerDto[] = response;
  if (servers.length === 0) return null;

  const formatTime = (value?: string) =>
    value ? new Date(value).toLocaleString(locale) : '-';

  return (
    <section className="rounded-xl border border-amber-400/40 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300">
          <CloudOffIcon className="size-4" />
        </span>
        <div className="min-w-0 grid gap-2">
          <p className="font-semibold">
            {t('page.servers.removedNotice.title', { count: servers.length })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.rich('page.servers.removedNotice.description', {
              code: (chunks) => (
                <code className="rounded bg-border/50 px-1 py-0.5 font-mono text-xs">
                  {chunks}
                </code>
              ),
            })}
          </p>
          <ul className="grid gap-1 text-sm">
            {servers.map((server) => (
              <li key={server.machine_id}>
                <span className="font-semibold">
                  {server.hostname || server.machine_id}
                </span>{' '}
                <span className="text-muted-foreground">
                  {t('page.servers.removedNotice.item', {
                    id: server.machine_id,
                    reason:
                      server.reason === 'forgotten'
                        ? t('page.servers.removedNotice.forgotten')
                        : t('page.servers.removedNotice.deleted'),
                    removedAt: formatTime(server.removed_at),
                    lastContact: formatTime(server.last_contact_at),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
