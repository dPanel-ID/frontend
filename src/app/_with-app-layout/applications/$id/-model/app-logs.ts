import { useCallback, useEffect, useState } from 'react';

import type { SchemaCommon } from '@/entities/shared/rules/schema';

import type { DTOs } from '@/shared/api';
import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import {
  DEFAULT_LOG_TIME_RANGE,
  isLiveLogTimeRange,
  resolveLogTimeRange,
} from '../-lib/log-time-range';
import type { LogTimeRange } from '../-lib/log-time-range';

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

export const [AppLogsModelProvider, useAppLogsModel] = buildSelector(
  'AppLogsModel',
)((props: AppLogsModelProps) => {
  const { applicationId } = props;
  const [logSelection, setLogSelection] = useState<LogSelection>();
  const [timeRange, setTimeRange] = useState<LogTimeRange>(
    DEFAULT_LOG_TIME_RANGE,
  );
  const [requestAnchor, setRequestAnchor] = useState(() => Date.now());
  const [lastDeployment] = useArtifactHistoryModel((s) => [s.lastDeployment]);
  const deploymentId = lastDeployment?.id;
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
  const isLive = isLiveLogTimeRange(timeRange);

  const selectLog = useCallback((nextSelection: LogSelection) => {
    setLogSelection(nextSelection);
    setRequestAnchor(Date.now());
  }, []);

  const selectTimeRange = useCallback((nextTimeRange: LogTimeRange) => {
    setTimeRange(nextTimeRange);
    setRequestAnchor(Date.now());
  }, []);

  const refreshLog = useCallback(() => {
    setRequestAnchor(Date.now());
  }, []);

  // Only short, rolling windows tail on a timer; wider or fixed ranges are
  // refreshed by hand.
  useEffect(() => {
    if (!isLive) return;
    if (!logSelection?.filename || !logSelection.serverId) return;

    const interval = window.setInterval(() => {
      setRequestAnchor(Date.now());
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLive, logSelection?.filename, logSelection?.serverId]);

  const [responseLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    line: limit,
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
    timeRange,
    selectTimeRange,
    /** When the current window was requested; "now" for relative times. */
    fetchedAt: requestAnchor,
    lineLimit: limit,
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
    ? raw.query_errors.filter((queryError): queryError is string =>
        Boolean(queryError),
      )
    : [];

  return {
    entries: normalizeLogEntries(raw),
    query,
    queryErrors,
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
