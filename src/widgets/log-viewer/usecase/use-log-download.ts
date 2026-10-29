import { useEffect, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import {
  LogDownloadTooLargeError,
  fetchAllLogPages,
  formatLogFile,
  logFileName,
  saveLogFile,
} from '../lib/log-download';
import type { LogDownloadProgress, LogPageResult } from '../lib/log-download';
import type { LogEntryInput } from '../lib/log-entries';

interface UseLogDownloadParams {
  /** Names the file, e.g. the service or domain. */
  name: string;
  timeGte: string;
  timeLt: string;
  fetchPage: (page: number, signal: AbortSignal) => Promise<LogPageResult>;
}

/**
 * Saves log lines as a file: the page on screen, or every page of the window
 * fetched one request at a time, with progress and a way to stop.
 */
export function useLogDownload(params: UseLogDownloadParams) {
  const { fetchPage, name, timeGte, timeLt } = params;

  const t = useDevetekTranslations('common.logViewer.download');
  const [openToaster] = useToaster();
  const [progress, setProgress] = useState<LogDownloadProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Leaving the view stops a download in flight.
  useEffect(() => () => abortRef.current?.abort(), []);

  const downloadPage = (entries: LogEntryInput[], page: number) => {
    saveLogFile(
      logFileName({ name, timeGte, timeLt, page }),
      formatLogFile(entries),
    );
  };

  const downloadAll = async () => {
    if (abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setProgress({ fetchedLines: 0 });

    try {
      const entries = await fetchAllLogPages({
        fetchPage,
        signal: controller.signal,
        onProgress: setProgress,
      });
      saveLogFile(
        logFileName({ name, timeGte, timeLt }),
        formatLogFile(entries),
      );
    } catch (error) {
      if (controller.signal.aborted) return;

      openToaster(
        error instanceof LogDownloadTooLargeError
          ? {
              variant: 'error',
              title: t('tooLargeTitle'),
              message: t('tooLarge', { lines: error.lines }),
            }
          : {
              variant: 'error',
              title: t('failedTitle'),
              message: error instanceof Error ? error.message : String(error),
            },
      );
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
  };

  return { progress, downloadPage, downloadAll, cancel };
}
