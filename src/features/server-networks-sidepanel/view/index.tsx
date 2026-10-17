import { useState } from 'react';

import { NetworkIcon, PlugZapIcon, RefreshCwIcon } from 'lucide-react';

import {
  ServerManagementIconButton,
  ServerManagementMetric,
  ServerManagementSidepanel,
  ServerManagementState,
  ServerManagementSurface,
  ServerManagementToolbar,
  serverManagementTableClassNames,
} from '@/features/server-management-sidepanel-ui';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/presentation/atoms/Tabs';

import type { ServerNetworksSidepanelProps as Props } from '../rules/types';

type NetworkTab = 'ports' | 'interfaces';

function PortStateBadge(props: { state: string }) {
  const { state } = props;
  const normalizedState = state.toLowerCase();

  const stateClassName = (() => {
    if (/\b(listen|open|running)\b/.test(normalizedState)) {
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300';
    }

    if (/\b(established|connected)\b/.test(normalizedState)) {
      return 'border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300';
    }

    return 'border-border bg-background text-muted-foreground';
  })();

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded border px-2 py-0.5 text-xs font-medium',
        stateClassName,
      )}
    >
      {state}
    </span>
  );
}

export default function ServerNetworksSidepanel(props: Props) {
  const { embedded = false, serverId, serverName } = props;

  const [activeTab, setActiveTab] = useState<NetworkTab>('ports');

  const [responsePorts, refreshPorts] = ApiServer.Origin.$Id.PortInUsed.useGet({
    serverId,
  });

  const [responseInterfaces, refreshInterfaces] =
    ApiServer.Origin.$Id.NetworkInterface.useGet({ serverId });

  const ports = useAdapter(responsePorts, (raw) =>
    raw.map((item) => ({
      port: String(item.port ?? '-'),
      processName: item.process_name ?? '-',
      processId: String(item.process_id ?? '-'),
      allowFrom: item.allow_from ?? '-',
      state: item.state ?? '-',
    })),
  );

  const interfaces = useAdapter(responseInterfaces, (raw) =>
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

  const handleRefresh = () => {
    if (activeTab === 'ports') refreshPorts();
    else refreshInterfaces();
  };

  const activeResponse =
    activeTab === 'ports' ? responsePorts : responseInterfaces;
  const isLoading = activeResponse.$status === 'loading';
  const portCount = ports.$status === 'success' ? ports.length : '-';
  const interfaceCount =
    interfaces.$status === 'success' ? interfaces.length : '-';

  return (
    <ServerManagementSidepanel
      embedded={embedded}
      title="Networks"
      subtitle={serverName || `Server ID: ${serverId}`}
      icon={NetworkIcon}
      heading="Network inventory"
      description="Inspect active ports and network interfaces reported by the server agent."
      actions={
        <ServerManagementIconButton
          label="Refresh network data"
          icon={RefreshCwIcon}
          disabled={isLoading}
          isLoading={isLoading}
          onClick={handleRefresh}
        />
      }
      metrics={
        <>
          <ServerManagementMetric
            label="Active ports"
            value={portCount}
            icon={PlugZapIcon}
          />
          <ServerManagementMetric
            label="Interfaces"
            value={interfaceCount}
            icon={NetworkIcon}
          />
        </>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as NetworkTab)}
        className="grid min-h-0 gap-3"
      >
        <ServerManagementToolbar>
          <TabsList className="grid h-9 w-full max-w-[360px] grid-cols-2">
            <TabsTrigger value="ports">Active Ports</TabsTrigger>
            <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
          </TabsList>
          <p className="text-xs text-muted-foreground">
            {activeTab === 'ports'
              ? 'Processes currently bound to server ports'
              : 'Addresses attached to each network interface'}
          </p>
        </ServerManagementToolbar>

        <TabsContent value="ports" className="mt-0">
          {ports.$status === 'initial' || ports.$status === 'loading' ? (
            <ServerManagementState
              state="loading"
              title="Loading active ports"
              description="Reading listening sockets and process ownership from the server."
            />
          ) : ports.$status === 'failed' ? (
            <ServerManagementState
              state="failed"
              title="Failed to load active ports"
              description={getApiErrorDetail(ports.error)}
              action={
                <ServerManagementIconButton
                  label="Retry"
                  icon={RefreshCwIcon}
                  onClick={refreshPorts}
                />
              }
            />
          ) : ports.length < 1 ? (
            <ServerManagementState
              title="No active ports found"
              description="The agent did not report any ports in use for this server."
            />
          ) : (
            <ServerManagementSurface
              title="Active ports"
              description="Port, process and access state"
              meta={`${ports.length} rows`}
            >
              <Table>
                <TableHeader className="bg-background/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={serverManagementTableClassNames.head}>
                      Port
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      Process
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      PID
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      Allow From
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      State
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ports.map((item, index) => (
                    <TableRow key={`${item.port}-${item.processId}-${index}`}>
                      <TableCell
                        className={cn(
                          serverManagementTableClassNames.cell,
                          'font-mono font-semibold text-primary',
                        )}
                      >
                        {item.port}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.cell}
                      >
                        {item.processName}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.mutedCell}
                      >
                        {item.processId}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.mutedCell}
                      >
                        {item.allowFrom}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.cell}
                      >
                        <PortStateBadge state={item.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ServerManagementSurface>
          )}
        </TabsContent>

        <TabsContent value="interfaces" className="mt-0">
          {interfaces.$status === 'initial' ||
          interfaces.$status === 'loading' ? (
            <ServerManagementState
              state="loading"
              title="Loading interfaces"
              description="Reading network interface addresses from the server."
            />
          ) : interfaces.$status === 'failed' ? (
            <ServerManagementState
              state="failed"
              title="Failed to load interfaces"
              description={getApiErrorDetail(interfaces.error)}
              action={
                <ServerManagementIconButton
                  label="Retry"
                  icon={RefreshCwIcon}
                  onClick={refreshInterfaces}
                />
              }
            />
          ) : interfaces.length < 1 ? (
            <ServerManagementState
              title="No network interface found"
              description="The agent did not report any interface data for this server."
            />
          ) : (
            <ServerManagementSurface
              title="Network interfaces"
              description="Interface names and assigned addresses"
              meta={`${interfaces.length} rows`}
            >
              <Table>
                <TableHeader className="bg-background/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={serverManagementTableClassNames.head}>
                      Interface
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      Address
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      IPv4
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      IPv6
                    </TableHead>
                    <TableHead className={serverManagementTableClassNames.head}>
                      Subnet
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interfaces.map((item, index) => (
                    <TableRow
                      key={`${item.interfaceName}-${item.address}-${index}`}
                    >
                      <TableCell
                        className={cn(
                          serverManagementTableClassNames.cell,
                          'font-semibold text-primary',
                        )}
                      >
                        {item.interfaceName}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.cell}
                      >
                        {item.address}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.mutedCell}
                      >
                        {item.ipV4}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.mutedCell}
                      >
                        {item.ipV6}
                      </TableCell>
                      <TableCell
                        className={serverManagementTableClassNames.mutedCell}
                      >
                        {item.subnet}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ServerManagementSurface>
          )}
        </TabsContent>
      </Tabs>
    </ServerManagementSidepanel>
  );
}
