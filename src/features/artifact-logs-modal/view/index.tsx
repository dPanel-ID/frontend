import { useMemo, useState } from 'react';

import { DownloadIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanelMeta,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import { FailedState } from '@/widgets/failed-state';
import {
  LogRefreshControl,
  LogResults,
  formatLogFile,
  formatUtcOffset,
  saveLogFile,
  toParsedLogLines,
  useAutoRefresh,
  useLogFilters,
} from '@/widgets/log-viewer';
import type { LogEntryInput } from '@/widgets/log-viewer';

import type { ArtifactLogsModalProps } from '../rules/types';

/** Enough for a whole typical build; older output is a scroll away. */
const BUILD_LOG_LINE_LIMIT = 500;

const Content = (props: ArtifactLogsModalProps) => {
  const { applicationId, artifactId, commitHead, serverId } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases');
  const tLog = useDevetekTranslations('common.logViewer');
  const locale = useDevetekLocale();
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const [responseLog, refreshLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    artifactId,
    line: BUILD_LOG_LINE_LIMIT,
    machineId: serverId,
  });
  const autoRefresh = useAutoRefresh(refreshLog);

  const data =
    responseLog.$status === 'success'
      ? responseLog
      : responseLog.$status === 'loading' && responseLog.prevData
        ? responseLog.prevData
        : undefined;

  const entryInputs = useMemo(() => toLogEntryInputs(data), [data]);
  // Times read relative to when the modal opened ("Today 14:02:11").
  const [nowMs] = useState(() => Date.now());
  const entries = useMemo(
    () =>
      toParsedLogLines(entryInputs, {
        fallbackSource: t('artifactLogSource'),
        locale,
        nowMs,
      }),
    [entryInputs, locale, nowMs, t],
  );
  const filters = useLogFilters(entries);

  if (responseLog.$status === 'failed') {
    return <FailedState.BannerRetryable onClickRetry={refreshLog} />;
  }

  const handleDownload = () => {
    const shortCommit = commitHead.slice(0, 12) || 'build';
    saveLogFile(`build-${shortCommit}.log`, formatLogFile(entryInputs));
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <DataPanelSearch
          value={filters.search}
          placeholder={tLog('filterPlaceholder')}
          onChange={filters.setSearch}
        />
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <DataPanelMeta>
            {t('artifactLogLineWindow', {
              count: entries.length,
              limit: BUILD_LOG_LINE_LIMIT,
            })}
          </DataPanelMeta>
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            disabled={entries.length === 0}
            onClick={handleDownload}
          >
            <DownloadIcon />
            {tLog('download.label')}
          </Button>
          <LogRefreshControl
            state={autoRefresh}
            isRefreshing={responseLog.$status === 'loading'}
            onRefresh={refreshLog}
          />
        </div>
      </div>

      {!data ? (
        <DataPanelState state="loading" title={tLog('loading')} />
      ) : entries.length === 0 ? (
        <DataPanelState state="empty" title={t('artifactLogEmpty')} />
      ) : (
        <LogResults
          ariaLabel={t('artifactLogOutput')}
          filters={filters}
          timeZoneLabel={timeZoneLabel}
          entryDetails="inline"
          className="max-h-[65vh]"
        />
      )}
    </section>
  );
};

export default function ArtifactLogsModal(props: ArtifactLogsModalProps) {
  const { commitHead } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <ModalLayoutGeneral maxWidth="1280px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('artifactLogsTitle')}
        description={t('artifactLogsDescription', { commit: commitHead })}
      />

      <ModalLayoutGeneral.Content className="min-h-0 overflow-hidden">
        <Content {...props} />
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}

function toLogEntryInputs(
  data: DTOs.ApplicationLogsResponseV1 | undefined,
): LogEntryInput[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .filter((line): line is string => typeof line === 'string')
      .map((line) => ({ line }));
  }

  const entries = (data.entries ?? []).filter(
    (entry): entry is DTOs.ApplicationLogEntryV1 => Boolean(entry),
  );
  if (entries.length > 0) {
    return entries.map((entry) => {
      const hostName = entry.attributes?.host_name;
      const stream = entry.attributes?.dpanel_attr_stream;
      return {
        line: entry.line ?? '',
        severity: entry.severity,
        time: entry.time == null ? undefined : String(entry.time),
        source: typeof hostName === 'string' ? hostName : undefined,
        stream: typeof stream === 'string' ? stream : undefined,
      };
    });
  }

  return (data.lines ?? [])
    .filter((line): line is string => typeof line === 'string')
    .map((line) => ({ line }));
}
