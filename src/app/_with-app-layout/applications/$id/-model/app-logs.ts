import { useCallback, useState } from 'react';

import type { SchemaCommon } from '@/entities/shared/rules/schema';

import type { DTOs } from '@/shared/api';
import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';
import {
  DEFAULT_LOG_TIME_RANGE,
  LOG_DOWNLOAD_PAGE_SIZE,
  logEntryFields,
  resolveLogTimeRange,
} from '@/widgets/log-viewer';
import type {
  LogEntryInput,
  LogPageResult,
  LogTimeRange,
} from '@/widgets/log-viewer';

import { useArtifactHistoryModel } from './artifact-history';

interface AppLogsModelProps {
  applicationId: SchemaCommon.UnitId;
}

interface LogSelection {
  filename: string;
  serverId: SchemaCommon.UnitId;
  /** Read every server the application runs on, not only `serverId`. */
  allServers?: boolean;
}

export interface AppLogEntryView {
  line: string;
  severity?: string;
  time?: string;
  attributes?: Record<string, unknown> | null;
}

interface AppLogView extends AppLogPagination {
  entries: AppLogEntryView[];
  query: string;
  queryErrors: string[];
}

export interface AppLogPagination {
  page: number;
  hasMore: boolean;
  /** Lines in the whole window, when the API reports it. */
  total?: number;
}

const EMPTY_LOG_VIEW: AppLogView = {
  entries: [],
  query: '',
  queryErrors: [],
  page: 1,
  hasMore: false,
};

export const [AppLogsModelProvider, useAppLogsModel] = buildSelector(
  'AppLogsModel',
)((props: AppLogsModelProps) => {
  const { applicationId } = props;
  const [logSelection, setLogSelection] = useState<LogSelection>();
  const [timeRange, setTimeRange] = useState<LogTimeRange>(
    DEFAULT_LOG_TIME_RANGE,
  );
  const [requestAnchor, setRequestAnchor] = useState(() => Date.now());
  // Pages are offsets into the window [timeGte, timeLt); the anchor stays put
  // while paging so new lines cannot shift them.
  const [page, setPage] = useState(1);
  const [lastDeployment] = useArtifactHistoryModel((s) => [s.lastDeployment]);
  const allServers = Boolean(logSelection?.allServers);
  // The last deployment names one server, so it only scopes a one-server view.
  const deploymentId = allServers ? undefined : lastDeployment?.id;
  const logMetadata = logSelection
    ? {
        deploymentId,
        serverId: logSelection.serverId,
      }
    : undefined;
  const { limit, timeGte, timeLt } = resolveLogTimeRange(
    timeRange,
    requestAnchor,
  );

  const selectLog = useCallback((nextSelection: LogSelection) => {
    setLogSelection(nextSelection);
    setRequestAnchor(Date.now());
    setPage(1);
  }, []);

  const selectTimeRange = useCallback((nextTimeRange: LogTimeRange) => {
    setTimeRange(nextTimeRange);
    setRequestAnchor(Date.now());
    setPage(1);
  }, []);

  const refreshLog = useCallback(() => {
    setRequestAnchor(Date.now());
    setPage(1);
  }, []);

  const machineId =
    allServers || deploymentId ? undefined : logMetadata?.serverId;

  const [responseLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    line: limit,
    page,
    deploymentId,
    machineId,
    allMachines: allServers,
    timeGte,
    timeLt,
    options: {
      skip: !logSelection?.serverId || !logSelection.filename,
    },
  });
  const responseLogView = useAdapter(responseLog, normalizeLogView);

  const logView =
    responseLogView.$status === 'success'
      ? responseLogView
      : responseLogView.$status === 'loading' && responseLogView.prevData
        ? responseLogView.prevData
        : EMPTY_LOG_VIEW;

  /** Fetches one download page of the current window, outside the view. */
  const fetchLogPage = useCallback(
    async (pageNumber: number, signal: AbortSignal): Promise<LogPageResult> => {
      const response = await ApiApplication.Logs.$Id.get(
        {
          applicationId,
          line: LOG_DOWNLOAD_PAGE_SIZE,
          page: pageNumber,
          deploymentId,
          machineId,
          allMachines: allServers,
          timeGte,
          timeLt,
        },
        { signal },
      );
      if (response.$status === 'failed') throw response.error;

      const view = normalizeLogView(response);
      return {
        entries: view.entries.map(toLogEntryInput),
        hasMore: view.hasMore,
        total: view.total,
      };
    },
    [allServers, applicationId, deploymentId, machineId, timeGte, timeLt],
  );

  return {
    log: responseLog,
    logEntries: logView.entries,
    logQuery: logView.query,
    logQueryErrors: logView.queryErrors,
    logPagination: {
      page: logView.page,
      hasMore: logView.hasMore,
      total: logView.total,
    } satisfies AppLogPagination,
    page,
    setPage,
    fetchLogPage,
    refreshLog,
    timeRange,
    selectTimeRange,
    /** When the current window was requested; "now" for relative times. */
    fetchedAt: requestAnchor,
    timeGte,
    timeLt,
    lineLimit: limit,
    logMetadata,
    logFilename: logSelection?.filename,
    setLogSelection: selectLog,
  };
});

/** An entry as the log helpers read it; the source is the host that wrote it. */
export function toLogEntryInput(entry: AppLogEntryView): LogEntryInput {
  const hostName = entry.attributes?.host_name;
  const stream = entry.attributes?.dpanel_attr_stream;

  return {
    line: entry.line,
    severity: entry.severity,
    time: entry.time,
    source: typeof hostName === 'string' ? hostName : undefined,
    stream: typeof stream === 'string' ? stream : undefined,
    fields: logEntryFields(entry.attributes),
  };
}

function normalizeLogView(raw: DTOs.ApplicationLogsResponseV1): AppLogView {
  const entries = normalizeLogEntries(raw);
  if (Array.isArray(raw)) {
    return { ...EMPTY_LOG_VIEW, entries };
  }

  return {
    entries,
    query: typeof raw.query === 'string' ? raw.query : '',
    queryErrors: Array.isArray(raw.query_errors)
      ? raw.query_errors.filter((queryError): queryError is string =>
          Boolean(queryError),
        )
      : [],
    page: typeof raw.page === 'number' && raw.page > 0 ? raw.page : 1,
    hasMore: raw.has_more === true,
    total: typeof raw.total === 'number' ? raw.total : undefined,
  };
}

function normalizeLogEntries(
  raw: DTOs.ApplicationLogsResponseV1,
): AppLogEntryView[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((line): line is string => typeof line === 'string')
      .map((line) => ({ line }));
  }

  const entries = Array.isArray(raw.entries) ? raw.entries : [];

  if (entries.length > 0) {
    return entries
      .filter((entry): entry is NonNullable<(typeof entries)[number]> =>
        Boolean(entry),
      )
      .map((entry) => ({
        line:
          typeof entry.line === 'string' && entry.line.trim()
            ? entry.line
            : ' ',
        severity: entry.severity,
        time:
          typeof entry.time === 'string' || typeof entry.time === 'number'
            ? String(entry.time)
            : undefined,
        attributes: entry.attributes ?? null,
      }));
  }

  const lines = Array.isArray(raw.lines) ? raw.lines : [];

  return lines
    .filter((line): line is string => typeof line === 'string')
    .map((line) => ({ line }));
}
