import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useAppLogsModel } from '../-model/app-logs';

export default function useLogsDownloadUsecase() {
  const [logFilename, logLines] = useAppLogsModel((s) => [
    s.logFilename,
    s.logLines,
  ]);

  const handleUsecase = useHandler(() => {
    if (!logFilename || logLines.length === 0) return;

    const blob = new Blob([logLines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${logFilename}.log`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  });

  return [handleUsecase] as const;
}
