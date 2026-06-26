import { useCallback, useEffect, useState } from 'react';

import type { DTOs } from '@/shared/api';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useArtifactHistoryModel } from './artifact-history';

interface AppLogsModelProps {
  applicationId: SchemaCommon.UnitId;
}

interface LogSelection {
  filename: string;
  serverId: SchemaCommon.UnitId;
}

export interface AppLogEntryView {
  line: string;
  severity?: string;
  time?: string;
  attributes?: Record<string, unknown> | null;
}

interface AppLogView {
  entries: AppLogEntryView[];
  query: string;
  queryErrors: string[];
}

export type AppLogTimeFilter = '10m' | '1h';

export const APP_LOG_TIME_FILTERS = {
  '10m': {
    durationMs: 10 * 60 * 1000,
    limit: 10,
  },
  '1h': {
    durationMs: 60 * 60 * 1000,
    limit: 100,
  },
} satisfies Record<
  AppLogTimeFilter,
  {
    durationMs: number;
    limit: number;
  }
>;

export const [AppLogsModelProvider, useAppLogsModel] = buildSelector(
  'AppLogsModel',
)((props: AppLogsModelProps) => {
  const { applicationId } = props;
  const [logSelection, setLogSelection] = useState<LogSelection>();
  const [timeFilter, setTimeFilter] = useState<AppLogTimeFilter>('10m');
  const [requestAnchor, setRequestAnchor] = useState(() => Date.now());
  const [lastDeployment] = useArtifactHistoryModel((s) => [s.lastDeployment]);
  const timeFilterConfig = APP_LOG_TIME_FILTERS[timeFilter];
  const deploymentId = lastDeployment?.id;
  const logMetadata = logSelection
    ? {
        deploymentId,
        serverId: logSelection.serverId,
      }
    : undefined;
  const timeGte = new Date(
    requestAnchor - timeFilterConfig.durationMs,
  ).toISOString();
  const timeLt = new Date(requestAnchor).toISOString();

  const selectLog = useCallback((nextSelection: LogSelection) => {
    setLogSelection(nextSelection);
    setRequestAnchor(Date.now());
  }, []);

  const selectTimeFilter = useCallback((nextTimeFilter: AppLogTimeFilter) => {
    setTimeFilter(nextTimeFilter);
    setRequestAnchor(Date.now());
  }, []);

  const refreshLog = useCallback(() => {
    setRequestAnchor(Date.now());
  }, []);

  useEffect(() => {
    if (!logSelection?.filename || !logSelection.serverId) return;

    const interval = window.setInterval(() => {
      setRequestAnchor(Date.now());
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [logSelection?.filename, logSelection?.serverId]);

  const [responseLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    line: timeFilterConfig.limit,
    deploymentId,
    machineId: deploymentId ? undefined : logMetadata?.serverId,
    timeGte,
    timeLt,
    options: {
      skip: !logSelection?.serverId || !logSelection.filename,
    },
  });
  const responseLogLines = useAdapter(
    responseLog,
    ApiApplication.Logs.$Id.normalizeLogLines,
  );

  const responseLogView = useAdapter(responseLog, normalizeLogView);

  const logView =
    responseLogView.$status === 'success'
      ? responseLogView
      : responseLogView.$status === 'loading' && responseLogView.prevData
        ? responseLogView.prevData
        : { entries: [], query: '', queryErrors: [] };

  return {
    log: responseLogLines,
    logEntries: logView.entries,
    logQuery: logView.query,
    logQueryErrors: logView.queryErrors,
    refreshLog,
    timeFilter,
    selectTimeFilter,
    lineLimit: timeFilterConfig.limit,
    logMetadata,
    logFilename: logSelection?.filename,
    logLines:
      responseLogLines.$status === 'success'
        ? responseLogLines
        : responseLogLines.$status === 'loading' && responseLogLines.prevData
          ? responseLogLines.prevData
          : [],
    setLogSelection: selectLog,
  };
});

function normalizeLogView(raw: DTOs.ApplicationLogsResponseV1): AppLogView {
  const query = typeof raw.query === 'string' ? raw.query : '';
  const queryErrors = Array.isArray(raw.query_errors)
    ? raw.query_errors.filter((queryError): queryError is string => Boolean(queryError))
    : [];

  return {
    entries: normalizeLogEntries(raw),
    query,
    queryErrors,
  };
}

function normalizeLogEntries(raw: DTOs.ApplicationLogsResponseV1): AppLogEntryView[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((line): line is string => typeof line === 'string')
      .map((line) => ({ line }));
  }

  const entries = Array.isArray(raw.entries) ? raw.entries : [];

  if (entries.length > 0) {
    return entries
      .filter((entry): entry is NonNullable<(typeof entries)[number]> => Boolean(entry))
      .map((entry) => ({
        line: typeof entry.line === 'string' && entry.line.trim() ? entry.line : ' ',
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
