import { useDevetekTranslations } from '@/services/i18n';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { FailedState } from '@/widgets/failed-state';

import { useAppDataModel } from '../../-model/app-data';
import { useAppLogsModel } from '../../-model/app-logs';
import { useEmit } from '../../-model/events';

import AppLogsSection from './_presentation/AppLogsSection';
import LogViewer from './_presentation/LogViewer';

const LogError = () => {
  const [refreshLog] = useAppLogsModel((s) => [s.refreshLog]);

  return (
    <div className="p-4 pt-0">
      <FailedState.BannerRetryable onClickRetry={refreshLog} />
    </div>
  );
};

const [guardLogs, useLogs] = guardedSelects({
  fallbackError: LogError,
})(couple(useAppLogsModel, (s) => s.log));

const LogView = guardLogs(() => {
  const logBuffer = useLogs((s) => s);
  const t = useDevetekTranslations('page.applicationDetail.appLogs');

  return (
    <div className="p-4 pt-0">
      <LogViewer
        ariaLabel={t('runtimeLogOutput')}
        logs={logBuffer.join('\n')}
      />
    </div>
  );
});

const [guardAppDetail, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: () => null,
  fallbackError: () => null,
})(couple(useAppDataModel, (s) => s.appDetail));

export default guardAppDetail(function AppLogs() {
  const [logFilename, setLogSelection] = useAppLogsModel((s) => [
    s.logFilename,
    s.setLogSelection,
  ]);

  const appDetail = useAppDetail((s) => s);

  const [selectedServerId] = useAppDataModel((s) => [s.selectedServerId]);

  const emit = useEmit();
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
      selectedLogs={logFilename}
      ctaLogsDisabled={!canSelectLogs}
      onClickLogs={handleClickLogs}
      onClickDownloadLog={handleClickDownloadLog}
    >
      <LogView />
    </AppLogsSection>
  );
});
