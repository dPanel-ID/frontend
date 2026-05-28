import { useState } from 'react';

import type { SchemaCommon } from '@/entities/shared/rules/schema';

import { ApiApplication } from '@/shared/api';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

const APPLICATION_LOG_LINE_COUNT = 1000;

interface AppLogsModelProps {
  applicationId: SchemaCommon.UnitId;
}

interface LogSelection {
  filename: string;
  serverId: SchemaCommon.UnitId;
}

export const [AppLogsModelProvider, useAppLogsModel] = buildSelector(
  'AppLogsModel',
)((props: AppLogsModelProps) => {
  const { applicationId } = props;
  const [logSelection, setLogSelection] = useState<LogSelection>();
  const logMetadata = logSelection
    ? {
        serverId: logSelection.serverId,
      }
    : undefined;

  const [responseLog, refreshLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    machineId: logMetadata?.serverId,
    line: APPLICATION_LOG_LINE_COUNT,
    options: {
      skip: !logMetadata || !logSelection.filename,
      refreshIntervalMs: 5000,
    },
  });

  return {
    log: responseLog,
    refreshLog,
    logMetadata,
    logFilename: logSelection?.filename,
    logLines:
      responseLog.$status === 'success'
        ? responseLog
        : responseLog.$status === 'loading' && responseLog.prevData
          ? responseLog.prevData
          : [],
    setLogSelection,
  };
});
