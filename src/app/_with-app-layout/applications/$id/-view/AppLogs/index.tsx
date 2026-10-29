import { useEffect, useMemo, useState } from 'react';

import { TerminalIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { canDownloadAllLogs } from '../../-lib/log-download';
import { toParsedLogLines } from '../../-lib/log-entries';
import { formatUtcOffset, logTimeRangeKey } from '../../-lib/log-time-range';
import { useAppDataModel } from '../../-model/app-data';
import { toLogEntryInput, useAppLogsModel } from '../../-model/app-logs';
import { useLogDownload } from '../../-usecase/log-download';

import LogsPanel, { toLogsPanelStatus } from './_presentation/LogsPanel';

export default function AppLogs() {
  const [
    fetchedAt,
    fetchLogPage,
    lineLimit,
    log,
    logEntries,
    logFilename,
    logPagination,
    logQuery,
    logQueryErrors,
    refreshLog,
    selectTimeRange,
    setLogSelection,
    setPage,
    timeGte,
    timeLt,
    timeRange,
  ] = useAppLogsModel((s) => [
    s.fetchedAt,
    s.fetchLogPage,
    s.lineLimit,
    s.log,
    s.logEntries,
    s.logFilename,
    s.logPagination,
    s.logQuery,
    s.logQueryErrors,
    s.refreshLog,
    s.selectTimeRange,
    s.setLogSelection,
    s.setPage,
    s.timeGte,
    s.timeLt,
    s.timeRange,
  ]);
  const [appDetailResponse] = useAppDataModel((s) => [s.appDetail]);
  const [selectedServerId] = useAppDataModel((s) => [s.selectedServerId]);
  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const locale = useDevetekLocale();
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const appDetail =
    appDetailResponse.$status === 'success' ? appDetailResponse : undefined;
  const runName = appDetail?.configDefs.lifecycle?.run.name;
  const serverId = selectedServerId || appDetail?.deploymentTargets[0]?.id;
  const machineId = serverId ? Number(serverId) : NaN;
  const canLoadLogs = Boolean(runName && Number.isFinite(machineId));

  // Open the tab onto the latest lines rather than an empty "load" prompt.
  useEffect(() => {
    if (!canLoadLogs || logFilename || !runName) return;
    setLogSelection({ filename: runName, serverId: String(machineId) });
  }, [canLoadLogs, logFilename, machineId, runName, setLogSelection]);

  const entryInputs = useMemo(
    () => logEntries.map(toLogEntryInput),
    [logEntries],
  );
  const entries = useMemo(
    () =>
      toParsedLogLines(entryInputs, {
        fallbackSource: runName ?? t('runtime'),
        locale,
        nowMs: fetchedAt,
      }),
    [entryInputs, fetchedAt, locale, runName, t],
  );

  const download = useLogDownload({
    name: runName ?? 'runtime',
    timeGte,
    timeLt,
    fetchPage: fetchLogPage,
  });

  if (!appDetail) return null;

  return (
    <LogsPanel
      title={t('title')}
      description={t('subtitle')}
      source={
        runName && (
          <span
            className="inline-flex h-9 max-w-56 items-center gap-2 rounded-md border bg-background px-3 text-sm"
            title={runName}
          >
            <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{runName}</span>
          </span>
        )
      }
      status={canLoadLogs ? toLogsPanelStatus(log) : 'unavailable'}
      entries={entries}
      pagination={{
        page: logPagination.page,
        pageSize: lineLimit,
        hasMore: logPagination.hasMore,
        totalLines: logPagination.total,
        onPageChange: setPage,
      }}
      download={{
        progress: download.progress,
        canDownloadAll: canDownloadAllLogs(logPagination.total),
        onDownloadPage: () =>
          download.downloadPage(entryInputs, logPagination.page),
        onDownloadAll: download.downloadAll,
        onCancel: download.cancel,
      }}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      query={log.$status === 'success' ? logQuery : undefined}
      queryErrors={log.$status === 'success' ? logQueryErrors : undefined}
      isRefreshing={log.$status === 'loading'}
      emptyTitle={t('emptyLog')}
      emptyDescription={t('emptyHint')}
      unavailableTitle={t('unavailable')}
      scrollResetKey={`${logTimeRangeKey(timeRange)}:${logPagination.page}`}
      onRefresh={refreshLog}
      onTimeRangeChange={selectTimeRange}
    />
  );
}
