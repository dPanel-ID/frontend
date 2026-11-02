import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import {
  isCloudServer,
  serverProviderLabel,
  serverSystemLabel,
} from '@/entities/server/lib/describeServer';
import type { ServerCard } from '@/entities/server/rules/schema';
import { ServerCreator } from '@/entities/server/ui/ServerCreator';
import { ServerIdentity } from '@/entities/server/ui/ServerIdentity';
import { ServerStatusPill } from '@/entities/server/ui/ServerStatusPill';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import { ServerActions } from './ServerActions';
import type { ServerHandlers } from './useServerHandlers';

interface ServerTableProps {
  servers: ServerCard[];
  handlersFor: (server: ServerCard) => ServerHandlers;
}

/** The dense view: one line per server, for fleets that outgrow cards. */
export function ServerTable(props: ServerTableProps) {
  const { handlersFor, servers } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.servers.table.server')}
            </TableHead>
            <TableHead>{t('page.servers.table.status')}</TableHead>
            <TableHead>{t('page.servers.table.provider')}</TableHead>
            <TableHead>{t('page.servers.table.system')}</TableHead>
            <TableHead>{t('page.servers.table.address')}</TableHead>
            <TableHead>{t('page.servers.table.owner')}</TableHead>
            <TableHead>{t('page.servers.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.servers.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server) => {
            const handlers = handlersFor(server);

            return (
              <TableRow
                key={server.id}
                className="cursor-pointer"
                onClick={handlers.openDetails}
              >
                <TableCell className="max-w-[18rem] px-4">
                  <ServerIdentity server={server} size="sm" />
                </TableCell>
                <TableCell>
                  <ServerStatusPill
                    state={server.state}
                    onClick={handlers.showStatus}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {isCloudServer(server)
                    ? [serverProviderLabel(server), server.cloud?.region]
                        .filter(Boolean)
                        .join(' · ')
                    : t('common.terms.ownServer')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {serverSystemLabel(server) ?? '-'}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {server.host.address || '-'}
                </TableCell>
                <TableCell className="max-w-[14rem] text-muted-foreground">
                  <OwnerLink
                    ownership={server.ownership}
                    preferTeam
                    className="block truncate"
                  />
                  {server.ownership.team && (
                    <ServerCreator
                      creator={server.creator}
                      className="max-w-full text-xs"
                    />
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getDistanceFromNow(server.timestamp.updated, locale)}
                </TableCell>
                <TableCell className="px-4">
                  <ServerActions handlers={handlers} layout="menu" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
