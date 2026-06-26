import { useDevetekTranslations } from '@/services/i18n';

import { FailedState } from '@/widgets/failed-state';

import { useAppDataModel } from '../../-model/app-data';
import { useAppLogsModel } from '../../-model/app-logs';
import { useEmit } from '../../-model/events';

import AppLogsSection from './_presentation/AppLogsSection';
import LogViewer from './_presentation/LogViewer';

const LogView = () => {
  const [log, logEntries, logQuery, logQueryErrors, refreshLog, timeFilter] =
    useAppLogsModel((s) => [
    s.log,
    s.logEntries,
    s.logQuery,
    s.logQueryErrors,
    s.refreshLog,
    s.timeFilter,
    ]);
  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const logBuffer =
    log.$status === 'success'
      ? log
      : log.$status === 'loading' && log.prevData
        ? log.prevData
        : [];

  if (log.$status === 'failed') {
    return (
      <div className="p-4 pt-0">
        <FailedState.BannerRetryable onClickRetry={refreshLog} />
      </div>
    );
  }

  return (
    <div className="p-4 pt-0">
      <LogViewer
        ariaLabel={t('runtimeLogOutput')}
        emptyLabel={t('emptyLog')}
        emptyDescription="Try widening the time range or selecting another deployment. Runtime logs now follow the active deployment when available."
        entries={log.$status === 'success' ? logEntries : log.$status === 'loading' && log.prevData ? logEntries : undefined}
        query={log.$status === 'success' ? logQuery : undefined}
        queryErrors={log.$status === 'success' ? logQueryErrors : undefined}
        lines={logBuffer}
        scrollResetKey={`${timeFilter}:${logBuffer.length}:${logBuffer[0] ?? ''}`}
      />
    </div>
  );
};

export default function AppLogs() {
  const [
    lineLimit,
    logFilename,
    logLines,
    refreshLog,
    selectTimeFilter,
    setLogSelection,
    timeFilter,
  ] = useAppLogsModel((s) => [
    s.lineLimit,
    s.logFilename,
    s.logLines,
    s.refreshLog,
    s.selectTimeFilter,
    s.setLogSelection,
    s.timeFilter,
  ]);

  const [appDetailResponse] = useAppDataModel((s) => [s.appDetail]);

  const [selectedServerId] = useAppDataModel((s) => [s.selectedServerId]);
  const emit = useEmit();

  if (appDetailResponse.$status !== 'success') return null;

  const appDetail = appDetailResponse;
  const lifecycle = appDetail.configDefs.lifecycle;
  const initialServerId =
    selectedServerId || appDetail.deploymentTargets[0]?.id;
  const initialMachineID = initialServerId ? Number(initialServerId) : NaN;
  const canSelectLogs = Boolean(
    lifecycle?.run.name && Number.isFinite(initialMachineID),
  );

  const handleClickLogs = () => {
    if (!lifecycle?.run.name) return;
    if (!Number.isFinite(initialMachineID)) return;

    if (logFilename) {
      refreshLog();
      return;
    }

    setLogSelection({
      filename: lifecycle.run.name,
      serverId: String(initialMachineID),
    });
  };

  const handleClickDownloadLog = () => {
    emit('@applications::detail/logs-download', null);
  };

  return (
    <AppLogsSection
      activeTimeFilter={timeFilter}
      selectedLogs={logFilename}
      ctaLogsDisabled={!canSelectLogs}
      lineCount={logLines.length}
      lineLimit={lineLimit}
      onClickLogs={handleClickLogs}
      onClickDownloadLog={handleClickDownloadLog}
      onSelectTimeFilter={selectTimeFilter}
    >
      <LogView />
    </AppLogsSection>
  );
}
