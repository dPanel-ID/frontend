import { useEffect, useMemo, useState } from 'react';

import { TerminalIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { toParsedLogLines } from '../../-lib/log-entries';
import type { LogEntryInput } from '../../-lib/log-entries';
import { formatUtcOffset, logTimeRangeKey } from '../../-lib/log-time-range';
import { useAppDataModel } from '../../-model/app-data';
import { useAppLogsModel } from '../../-model/app-logs';
import type { AppLogEntryView } from '../../-model/app-logs';
import { useEmit } from '../../-model/events';

import LogsPanel, { toLogsPanelStatus } from './_presentation/LogsPanel';

export default function AppLogs() {
  const [
    fetchedAt,
    lineLimit,
    log,
    logEntries,
    logFilename,
    logQuery,
    logQueryErrors,
    refreshLog,
    selectTimeRange,
    setLogSelection,
    timeRange,
  ] = useAppLogsModel((s) => [
    s.fetchedAt,
    s.lineLimit,
    s.log,
    s.logEntries,
    s.logFilename,
    s.logQuery,
    s.logQueryErrors,
    s.refreshLog,
    s.selectTimeRange,
    s.setLogSelection,
    s.timeRange,
  ]);
  const [appDetailResponse] = useAppDataModel((s) => [s.appDetail]);
  const [selectedServerId] = useAppDataModel((s) => [s.selectedServerId]);
  const emit = useEmit();
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

  const entries = useMemo(
    () =>
      toParsedLogLines(logEntries.map(toLogEntryInput), {
        fallbackSource: runName ?? t('runtime'),
        locale,
        nowMs: fetchedAt,
      }),
    [fetchedAt, locale, logEntries, runName, t],
  );

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
      lineLimit={lineLimit}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      query={log.$status === 'success' ? logQuery : undefined}
      queryErrors={log.$status === 'success' ? logQueryErrors : undefined}
      isRefreshing={log.$status === 'loading'}
      emptyTitle={t('emptyLog')}
      emptyDescription={t('emptyHint')}
      unavailableTitle={t('unavailable')}
      scrollResetKey={logTimeRangeKey(timeRange)}
      onRefresh={refreshLog}
      onTimeRangeChange={selectTimeRange}
      onDownload={() => emit('@applications::detail/logs-download', null)}
    />
  );
}

function toLogEntryInput(entry: AppLogEntryView): LogEntryInput {
  const hostName = entry.attributes?.host_name;

  return {
    line: entry.line,
    severity: entry.severity,
    time: entry.time,
    source: typeof hostName === 'string' ? hostName : undefined,
  };
}
