import { useCallback, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import {
  DataPanelMeta,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import { FailedState } from '@/widgets/failed-state';
import {
  InfiniteLogTable,
  LOG_DOWNLOAD_PAGE_SIZE,
  LOG_PAGE_SIZE,
  LOG_TIME_RANGE_MAX_LOOKBACK_MS,
  LogDownloadMenu,
  LogLevelFilter,
  LogRefreshControl,
  canDownloadAllLogs,
  formatUtcOffset,
  useAutoRefresh,
  useLogDownload,
  useLogWindow,
  useWindowRows,
} from '@/widgets/log-viewer';
import type { LogEntryInput, LogPageResult } from '@/widgets/log-viewer';

import type { ArtifactLogsModalProps } from '../rules/types';

/**
 * A build reads like a terminal: its last lines at the bottom, earlier output
 * loaded while scrolling up, never more than a few pages rendered at once.
 */
export default function BuildLogOutput(props: ArtifactLogsModalProps) {
  const { applicationId, artifactId, commitHead, serverId } = props;
  const t = useDevetekTranslations('page.applicationDetail.releases');
  const tLog = useDevetekTranslations('common.logViewer');
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  // The window ends when the log was opened or refreshed; builds are kept as
  // long as any other log, so it reaches back as far as logs are kept.
  const [anchor, setAnchor] = useState(() => Date.now());
  const timeGte = new Date(
    anchor - LOG_TIME_RANGE_MAX_LOOKBACK_MS,
  ).toISOString();
  const timeLt = new Date(anchor).toISOString();
  const windowKey = [applicationId, artifactId, serverId, anchor].join('|');

  const fetchPageOf = useCallback(
    async (
      size: number,
      page: number,
      signal: AbortSignal,
    ): Promise<LogPageResult> => {
      const response = await ApiApplication.Logs.$Id.get(
        {
          applicationId,
          artifactId,
          machineId: serverId,
          line: size,
          page,
          timeGte,
          timeLt,
        },
        { signal },
      );
      if (response.$status === 'failed') throw response.error;

      return {
        entries: toLogEntryInputs(response),
        hasMore: !Array.isArray(response) && response.has_more === true,
        total: Array.isArray(response)
          ? undefined
          : (response.total ?? undefined),
      };
    },
    [applicationId, artifactId, serverId, timeGte, timeLt],
  );
  const fetchWindowPage = useCallback(
    (page: number, signal: AbortSignal) =>
      fetchPageOf(LOG_PAGE_SIZE, page, signal),
    [fetchPageOf],
  );
  const fetchDownloadPage = useCallback(
    (page: number, signal: AbortSignal) =>
      fetchPageOf(LOG_DOWNLOAD_PAGE_SIZE, page, signal),
    [fetchPageOf],
  );

  const logWindow = useLogWindow({ fetchPage: fetchWindowPage, windowKey });
  const { autoFill, filters, loadedEntries, loadedRows, visiblePages } =
    useWindowRows({
      pages: logWindow.pages,
      pageSize: LOG_PAGE_SIZE,
      fallbackSource: t('artifactLogSource'),
      nowMs: anchor,
    });

  const refresh = () => setAnchor(Date.now());
  const [following, setFollowing] = useState(true);
  const autoRefresh = useAutoRefresh(refresh, { paused: !following });

  const download = useLogDownload({
    name: `build-${commitHead.slice(0, 12) || artifactId}`,
    timeGte,
    timeLt,
    fetchPage: fetchDownloadPage,
  });

  if (logWindow.status === 'failed') {
    return <FailedState.BannerRetryable onClickRetry={refresh} />;
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <DataPanelSearch
          value={filters.search}
          placeholder={tLog('infinite.filterPlaceholder')}
          onChange={filters.setSearch}
        />
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <DataPanelMeta>
            {tLog('infinite.showing', {
              shown: filters.filteredEntries.length,
              total: loadedRows.length,
            })}
          </DataPanelMeta>
          <LogDownloadMenu
            scope="loaded"
            page={1}
            pageLines={loadedEntries.length}
            totalLines={logWindow.total}
            canDownloadAll={canDownloadAllLogs(logWindow.total)}
            progress={download.progress}
            onDownloadPage={() => download.downloadPage(loadedEntries, 1)}
            onDownloadAll={download.downloadAll}
            onCancel={download.cancel}
          />
          <LogRefreshControl
            state={autoRefresh}
            isRefreshing={logWindow.isResetting}
            onRefresh={refresh}
          />
        </div>
      </div>

      {logWindow.status === 'loading' ? (
        <DataPanelState state="loading" title={tLog('loading')} />
      ) : loadedRows.length === 0 ? (
        <DataPanelState state="empty" title={t('artifactLogEmpty')} />
      ) : (
        <>
          <LogLevelFilter filters={filters} />
          <InfiniteLogTable
            ariaLabel={t('artifactLogOutput')}
            pages={visiblePages}
            timeZoneLabel={timeZoneLabel}
            nowMs={anchor}
            hasOlder={logWindow.hasOlder}
            hasNewer={logWindow.hasNewer}
            loading={logWindow.loading}
            edgeError={logWindow.edgeError}
            windowKey={windowKey}
            autoFill={autoFill}
            entryDetails="inline"
            className="h-[65vh]"
            onLoadOlder={logWindow.loadOlder}
            onLoadNewer={logWindow.loadNewer}
            onFollowChange={setFollowing}
            onJumpToLatest={refresh}
          />
        </>
      )}
    </section>
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
