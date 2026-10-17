import { useMemo, useState } from 'react';

import { NetworkIcon, PlugZapIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

import { useServerDataModel } from '../../../-model/server-data';
import {
  TabMeta,
  TabPagination,
  TabPanel,
  TabRetry,
  TabState,
  tabTable,
  usePagedList,
} from '../_shared/TabPanel';

type NetworkView = 'ports' | 'interfaces';

interface PortItem {
  port: string;
  processName: string;
  processId: string;
  allowFrom: string;
  state: string;
}

interface InterfaceItem {
  interfaceName: string;
  address: string;
  ipV4: string;
  ipV6: string;
  subnet: string;
}

const EMPTY_PORTS: PortItem[] = [];
const EMPTY_INTERFACES: InterfaceItem[] = [];

/** Ports in use and interface addresses, one table at a time. */
export default function NetworkTab() {
  const t = useDevetekTranslations('page.serverDetail.network');
  const tCommon = useDevetekTranslations('page.serverDetail.tabsCommon');
  const [serverId] = useServerDataModel((s) => [String(s.serverId)]);
  const [view, setView] = useState<NetworkView>('ports');

  const [responsePorts, refreshPorts] = ApiServer.Origin.$Id.PortInUsed.useGet({
    serverId,
  });
  const [responseInterfaces, refreshInterfaces] =
    ApiServer.Origin.$Id.NetworkInterface.useGet({ serverId });

  const ports = useAdapter(responsePorts, (raw): PortItem[] =>
    raw.map((item) => ({
      port: String(item.port ?? '-'),
      processName: item.process_name ?? '-',
      processId: String(item.process_id ?? '-'),
      allowFrom: item.allow_from ?? '-',
      state: item.state ?? '-',
    })),
  );

  const interfaces = useAdapter(responseInterfaces, (raw): InterfaceItem[] =>
    raw.flatMap((item) => {
      const interfaceName = item.interface_name ?? '-';
      const interfaceData = item.interface_data ?? [];
      if (interfaceData.length < 1) {
        return [
          { interfaceName, address: '-', ipV4: '-', ipV6: '-', subnet: '-' },
        ];
      }
      return interfaceData.map((detail) => ({
        interfaceName,
        address: detail.address ?? '-',
        ipV4: detail.ip_v4 ?? '-',
        ipV6: detail.ip_v6 ?? '-',
        subnet: detail.subnet ?? '-',
      }));
    }),
  );

  const portList = useMemo(
    () => (ports.$status === 'success' ? ports : EMPTY_PORTS),
    [ports],
  );
  const interfaceList = useMemo(
    () => (interfaces.$status === 'success' ? interfaces : EMPTY_INTERFACES),
    [interfaces],
  );
  const pagedPorts = usePagedList(portList);
  const pagedInterfaces = usePagedList(interfaceList);

  const active = view === 'ports' ? ports : interfaces;
  const paged = view === 'ports' ? pagedPorts : pagedInterfaces;
  const activeCount = view === 'ports' ? portList.length : interfaceList.length;
  const isLoading =
    responsePorts.$status === 'loading' ||
    responseInterfaces.$status === 'loading';

  const refresh = () => {
    refreshPorts();
    refreshInterfaces();
  };

  return (
    <TabPanel
      icon={NetworkIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          disabled={isLoading}
          onClick={refresh}
        >
          <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
          {tCommon('refresh')}
        </Button>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={PlugZapIcon}
            tone="sky"
            label={t('tiles.ports')}
            value={ports.$status === 'success' ? portList.length : '-'}
            active={view === 'ports'}
            onClick={() => setView('ports')}
          />
          <StatTile
            size="sm"
            icon={NetworkIcon}
            tone="emerald"
            label={t('tiles.interfaces')}
            value={
              interfaces.$status === 'success' ? interfaceList.length : '-'
            }
            active={view === 'interfaces'}
            onClick={() => setView('interfaces')}
          />
        </>
      }
      footer={
        <>
          <TabMeta>{tCommon('rows', { count: activeCount })}</TabMeta>
          <TabPagination
            page={paged.page}
            totalPage={paged.totalPage}
            onPageChange={paged.setPage}
          />
        </>
      }
    >
      {active.$status === 'initial' || active.$status === 'loading' ? (
        <TabState state="loading" title={tCommon('loading')} />
      ) : active.$status === 'failed' ? (
        <TabState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(active.error)}
          action={<TabRetry onClick={refresh} />}
        />
      ) : activeCount === 0 ? (
        <TabState
          state="empty"
          title={view === 'ports' ? t('emptyPorts') : t('emptyInterfaces')}
        />
      ) : view === 'ports' ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(tabTable.head, 'w-24')}>
                {t('table.port')}
              </TableHead>
              <TableHead className={tabTable.head}>
                {t('table.process')}
              </TableHead>
              <TableHead className={cn(tabTable.head, 'w-24')}>
                {t('table.pid')}
              </TableHead>
              <TableHead className={tabTable.head}>
                {t('table.allowFrom')}
              </TableHead>
              <TableHead className={cn(tabTable.head, 'w-32')}>
                {t('table.state')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedPorts.pageItems.map((item, index) => (
              <TableRow key={`${item.port}-${item.processId}-${index}`}>
                <TableCell
                  className={cn(
                    tabTable.monoCell,
                    'font-semibold text-primary',
                  )}
                >
                  {item.port}
                </TableCell>
                <TableCell className={tabTable.cell}>
                  {item.processName}
                </TableCell>
                <TableCell className={tabTable.monoCell}>
                  {item.processId}
                </TableCell>
                <TableCell className={tabTable.monoCell}>
                  {item.allowFrom}
                </TableCell>
                <TableCell className={tabTable.cell}>
                  <StatusPill
                    tone={portStateTone(item.state)}
                    label={item.state}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(tabTable.head, 'w-32')}>
                {t('table.interface')}
              </TableHead>
              <TableHead className={tabTable.head}>
                {t('table.address')}
              </TableHead>
              <TableHead className={tabTable.head}>{t('table.ipv4')}</TableHead>
              <TableHead className={tabTable.head}>{t('table.ipv6')}</TableHead>
              <TableHead className={tabTable.head}>
                {t('table.subnet')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedInterfaces.pageItems.map((item, index) => (
              <TableRow key={`${item.interfaceName}-${item.address}-${index}`}>
                <TableCell className={cn(tabTable.cell, 'font-semibold')}>
                  {item.interfaceName}
                </TableCell>
                <TableCell className={tabTable.monoCell}>
                  {item.address}
                </TableCell>
                <TableCell className={tabTable.monoCell}>{item.ipV4}</TableCell>
                <TableCell className={tabTable.monoCell}>{item.ipV6}</TableCell>
                <TableCell className={tabTable.monoCell}>
                  {item.subnet}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TabPanel>
  );
}

function portStateTone(state: string): StatusTone {
  const normalized = state.toLowerCase();
  if (/\b(listen|open|running)\b/.test(normalized)) return 'success';
  if (/\b(established|connected)\b/.test(normalized)) return 'info';
  return 'neutral';
}
