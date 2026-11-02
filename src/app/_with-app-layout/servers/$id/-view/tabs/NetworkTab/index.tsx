import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  NetworkIcon,
  PlugZapIcon,
  RefreshCwIcon,
  ShieldIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { serverDisplayName } from '@/entities/server/lib/describeServer';

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
import {
  DataPanel,
  DataPanelMeta,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelState,
  dataTable,
  usePagedList,
} from '@/shared/presentation/organisms/DataPanel';

import { portCoverage } from '../../../-lib/port-coverage';
import type { PortCoverage } from '../../../-lib/port-coverage';
import { useServerDataModel } from '../../../-model/server-data';
import { useServerFirewall } from '../../../-model/server-firewall';
import type { ServerNetworkView } from '../../../-rules/tabs';

import FirewallPanel from './Firewall';

interface PortItem {
  port: string;
  portNumber?: number;
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

/** Ports in use, interface addresses and the firewall, one view at a time. */
export default function NetworkTab() {
  const t = useDevetekTranslations('page.serverDetail.network');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const [serverId, serverDetail] = useServerDataModel((s) => [
    String(s.serverId),
    s.detail,
  ]);
  const serverName =
    serverDetail.$status === 'success'
      ? serverDisplayName(serverDetail)
      : serverId;
  const search = useSearch({ from: '/_with-app-layout/servers/$id/' });
  const navigate = useNavigate({ from: '/servers/$id' });
  const view: ServerNetworkView = search.view ?? 'ports';
  const setView = (next: ServerNetworkView) => {
    void navigate({
      search: (prev) => ({ ...prev, tab: 'network', view: next }),
      replace: true,
    });
  };

  // Read once for the whole tab: the firewall view and the ports' coverage.
  const firewallState = useServerFirewall(serverId);
  const firewallView = firewallState.current;

  const [responsePorts, refreshPorts] = ApiServer.Origin.$Id.PortInUsed.useGet({
    serverId,
  });
  const [responseInterfaces, refreshInterfaces] =
    ApiServer.Origin.$Id.NetworkInterface.useGet({ serverId });

  const ports = useAdapter(responsePorts, (raw): PortItem[] =>
    raw.map((item) => ({
      port: String(item.port ?? '-'),
      portNumber: item.port,
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

  const tableView = view === 'interfaces' ? 'interfaces' : 'ports';
  const active = tableView === 'ports' ? ports : interfaces;
  const paged = tableView === 'ports' ? pagedPorts : pagedInterfaces;
  const activeCount =
    tableView === 'ports' ? portList.length : interfaceList.length;
  const isLoading =
    responsePorts.$status === 'loading' ||
    responseInterfaces.$status === 'loading';

  const refresh = () => {
    refreshPorts();
    refreshInterfaces();
    firewallState.refresh();
  };

  const tiles = (
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
        value={interfaces.$status === 'success' ? interfaceList.length : '-'}
        active={view === 'interfaces'}
        onClick={() => setView('interfaces')}
      />
      <StatTile
        size="sm"
        icon={ShieldIcon}
        tone={
          !firewallView
            ? 'neutral'
            : firewallView.policy.drift || firewallView.policy.pendingChanges
              ? 'amber'
              : firewallView.policy.enabled
                ? 'emerald'
                : 'neutral'
        }
        label={t('tiles.firewall')}
        value={
          firewallView
            ? firewallView.policy.enabled
              ? t('firewall.status.on')
              : t('firewall.status.off')
            : '-'
        }
        active={view === 'firewall'}
        onClick={() => setView('firewall')}
      />
    </>
  );

  if (view === 'firewall') {
    return (
      <FirewallPanel
        serverId={serverId}
        serverName={serverName}
        tiles={tiles}
        state={firewallState}
      />
    );
  }

  return (
    <DataPanel
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
      tiles={tiles}
      footer={
        <>
          <DataPanelMeta>
            {tCommon('rows', { count: activeCount })}
          </DataPanelMeta>
          <DataPanelPagination
            page={paged.page}
            totalPage={paged.totalPage}
            onPageChange={paged.setPage}
          />
        </>
      }
    >
      {active.$status === 'initial' || active.$status === 'loading' ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : active.$status === 'failed' ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(active.error)}
          action={<DataPanelRetry onClick={refresh} />}
        />
      ) : activeCount === 0 ? (
        <DataPanelState
          state="empty"
          title={tableView === 'ports' ? t('emptyPorts') : t('emptyInterfaces')}
        />
      ) : tableView === 'ports' ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(dataTable.head, 'w-24')}>
                {t('table.port')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.process')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-24')}>
                {t('table.pid')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.allowFrom')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-32')}>
                {t('table.state')}
              </TableHead>
              <TableHead
                className={cn(dataTable.head, 'w-44')}
                title={t('coverage.hint')}
              >
                {t('table.firewall')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedPorts.pageItems.map((item, index) => (
              <TableRow key={`${item.port}-${item.processId}-${index}`}>
                <TableCell
                  className={cn(
                    dataTable.monoCell,
                    'font-semibold text-primary',
                  )}
                >
                  {item.port}
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {item.processName}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.processId}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.allowFrom}
                </TableCell>
                <TableCell className={dataTable.cell}>
                  <StatusPill
                    tone={portStateTone(item.state)}
                    label={item.state}
                  />
                </TableCell>
                <TableCell className={dataTable.cell}>
                  {firewallView ? (
                    <CoverageLabel
                      coverage={portCoverage(item.portNumber, firewallView)}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(dataTable.head, 'w-32')}>
                {t('table.interface')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.address')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.ipv4')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.ipv6')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.subnet')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedInterfaces.pageItems.map((item, index) => (
              <TableRow key={`${item.interfaceName}-${item.address}-${index}`}>
                <TableCell className={cn(dataTable.cell, 'font-semibold')}>
                  {item.interfaceName}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.address}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.ipV4}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.ipV6}
                </TableCell>
                <TableCell className={dataTable.monoCell}>
                  {item.subnet}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}

/** Whether a stored allow rule lets the outside reach this port. */
function CoverageLabel(props: { coverage: PortCoverage }) {
  const { coverage } = props;
  const t = useDevetekTranslations('page.serverDetail.network.coverage');

  if (coverage.kind === 'unknown') {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const label =
    coverage.kind === 'restricted'
      ? t('restricted', { count: coverage.sources.length })
      : t(coverage.kind);

  return (
    <span
      className="flex flex-col gap-0.5"
      title={
        coverage.sources.length > 0 ? coverage.sources.join(', ') : undefined
      }
    >
      <span
        className={cn(
          'text-xs font-semibold',
          coverage.kind === 'anywhere' &&
            'text-emerald-700 dark:text-emerald-300',
          coverage.kind === 'restricted' && 'text-sky-700 dark:text-sky-300',
          coverage.kind === 'none' && 'text-muted-foreground',
        )}
      >
        {label}
      </span>
      {!coverage.enforced && (
        <span className="text-[11px] text-amber-700 dark:text-amber-300">
          {t('notEnforced')}
        </span>
      )}
    </span>
  );
}

function portStateTone(state: string): StatusTone {
  const normalized = state.toLowerCase();
  if (/\b(listen|open|running)\b/.test(normalized)) return 'success';
  if (/\b(established|connected)\b/.test(normalized)) return 'info';
  return 'neutral';
}
