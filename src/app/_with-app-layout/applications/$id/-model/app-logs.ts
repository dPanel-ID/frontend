import { useCallback, useEffect, useState } from 'react';

import type { SchemaCommon } from '@/entities/shared/rules/schema';

import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

interface AppLogsModelProps {
  applicationId: SchemaCommon.UnitId;
}

interface LogSelection {
  filename: string;
  serverId: SchemaCommon.UnitId;
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
  const timeFilterConfig = APP_LOG_TIME_FILTERS[timeFilter];
  const logMetadata = logSelection
    ? {
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
    machineId: logMetadata?.serverId,
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

  return {
    log: responseLogLines,
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
