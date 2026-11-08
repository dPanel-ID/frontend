import { useEffect, useState } from 'react';

import { ServerIcon, TerminalIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import {
  InfiniteLogsPanel,
  LOG_MERGED_MAX_LINES,
  canDownloadAllLogs,
  formatUtcOffset,
  useLogDownload,
  useLogWindow,
} from '@/widgets/log-viewer';

import { useAppDataModel } from '../../-model/app-data';
import { useAppLogsModel } from '../../-model/app-logs';

export default function AppLogs() {
  const [
    fetchedAt,
    fetchLogPage,
    fetchWindowPage,
    isLogSelected,
    lineLimit,
    logFilename,
    logServerFilter,
    refreshLog,
    selectTimeRange,
    setLogSelection,
    timeGte,
    timeLt,
    timeRange,
    windowKey,
  ] = useAppLogsModel((s) => [
    s.fetchedAt,
    s.fetchLogPage,
    s.fetchWindowPage,
    s.isLogSelected,
    s.lineLimit,
    s.logFilename,
    s.logServerFilter,
    s.refreshLog,
    s.selectTimeRange,
    s.setLogSelection,
    s.timeGte,
    s.timeLt,
    s.timeRange,
    s.windowKey,
  ]);
  const [appDetailResponse] = useAppDataModel((s) => [s.appDetail]);
  const [selectedServerId] = useAppDataModel((s) => [s.selectedServerId]);
  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const appDetail =
    appDetailResponse.$status === 'success' ? appDetailResponse : undefined;
  const runName = appDetail?.configDefs.lifecycle?.run.name;
  const serverId = selectedServerId || appDetail?.deploymentTargets[0]?.id;
  const machineId = serverId ? Number(serverId) : NaN;
  const canLoadLogs = Boolean(runName && Number.isFinite(machineId));
  const servers = appDetail?.deploymentTargets ?? [];
  // An application on several servers shows all of their lines, merged,
  // until the person picks one of them.
  const allServers = servers.length > 1 && logServerFilter === 'all';

  const selectServer = (value: string) => {
    if (!runName) return;
    setLogSelection(
      value === 'all'
        ? { filename: runName, serverId: String(machineId), allServers: true }
        : { filename: runName, serverId: value, pinnedServer: true },
    );
  };

  // Open the tab onto the latest lines rather than an empty "load" prompt.
  useEffect(() => {
    if (!canLoadLogs || logFilename || !runName) return;
    setLogSelection({
      filename: runName,
      serverId: String(machineId),
      allServers,
    });
  }, [
    allServers,
    canLoadLogs,
    logFilename,
    machineId,
    runName,
    setLogSelection,
  ]);

  const logWindow = useLogWindow({
    fetchPage: fetchWindowPage,
    windowKey,
    disabled: !canLoadLogs || !isLogSelected,
  });

  const download = useLogDownload({
    name: runName ?? 'runtime',
    timeGte,
    timeLt,
    fetchPage: fetchLogPage,
  });

  if (!appDetail) return null;

  return (
    <InfiniteLogsPanel
      title={t('title')}
      description={t('subtitle')}
      source={
        runName && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex h-9 max-w-56 items-center gap-2 rounded-md border bg-background px-3 text-sm"
              title={runName}
            >
              <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{runName}</span>
            </span>
            {servers.length > 1 && (
              <Select value={logServerFilter} onValueChange={selectServer}>
                <SelectTrigger
                  aria-label={t('serverFilter')}
                  className="h-9 w-auto min-w-44 max-w-64 gap-2 bg-background text-sm"
                >
                  <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('allServers', { count: servers.length })}
                  </SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.hostname || `#${server.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )
      }
      window={logWindow}
      windowKey={windowKey}
      pageSize={lineLimit}
      fallbackSource={runName ?? t('runtime')}
      nowMs={fetchedAt}
      download={{
        progress: download.progress,
        canDownloadAll: canDownloadAllLogs(
          logWindow.total,
          allServers ? LOG_MERGED_MAX_LINES : undefined,
        ),
        onDownloadLoaded: (entries) => download.downloadPage(entries, 1),
        onDownloadAll: download.downloadAll,
        onCancel: download.cancel,
      }}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      emptyTitle={t('emptyLog')}
      emptyDescription={t('emptyHint')}
      unavailableTitle={t('unavailable')}
      onRefresh={refreshLog}
      onTimeRangeChange={selectTimeRange}
    />
  );
}
