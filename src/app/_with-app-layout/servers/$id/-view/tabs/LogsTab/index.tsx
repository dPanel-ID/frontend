import { useEffect, useMemo, useState } from 'react';

import { RefreshCwIcon, ScrollTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  VM_LOG_SOURCES,
  VM_LOG_SOURCE_CATEGORIES,
} from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import type { ServerLogSource } from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import {
  getLogViewerLines,
  getResponseErrorMessage,
  isEmptyLogResponse,
  parseLogLine,
  useServerLogSourceDiscovery,
} from '@/features/server-log-viewer-sidepanel/view';

import { ApiServer } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import { LogResults, useLogFilters } from '@/widgets/log-viewer';

import { useServerDataModel } from '../../../-model/server-data';

/** Enough to see what just happened without a page-long scroll. */
const DEFAULT_LINE_COUNT = 20;
const LINE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_SOURCE_ID = 'auth';

/**
 * The newest lines of one log file. Each row is one line; the full entry
 * opens in a side panel so the table itself never grows.
 */
export default function LogsTab() {
  const t = useDevetekTranslations('page.serverDetail.logs');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const [serverId] = useServerDataModel((s) => [String(s.serverId)]);

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);

  const [logResponse, fetchLog] = ApiServer.Origin.$Id.Log.useGetLazy();
  const discovery = useServerLogSourceDiscovery(serverId);

  const catalog = useMemo<ServerLogSource[]>(() => {
    if (discovery.sources.length === 0) return VM_LOG_SOURCES;
    const overview = VM_LOG_SOURCES.filter((source) => !source.path);
    return [...overview, ...discovery.sources];
  }, [discovery.sources]);

  const selectedSource = useMemo(() => {
    return (
      catalog.find((source) => source.id === selectedSourceId) ??
      catalog.find((source) => source.id === DEFAULT_SOURCE_ID) ??
      catalog.find((source) => source.path) ??
      catalog[0]
    );
  }, [catalog, selectedSourceId]);

  useEffect(() => {
    if (!selectedSource) return;
    fetchLog({ serverId, file: selectedSource.path, line: lineCount });
  }, [fetchLog, lineCount, selectedSource, serverId]);

  const parsedLines = useMemo(() => {
    const lines =
      logResponse.$status === 'success' ? getLogViewerLines(logResponse) : [];
    return lines.map((line, index) =>
      parseLogLine(line, index, selectedSource),
    );
  }, [logResponse, selectedSource]);

  const filters = useLogFilters(parsedLines);

  const isLoading =
    logResponse.$status === 'initial' || logResponse.$status === 'loading';

  const handleRefresh = () => {
    if (!selectedSource) return;
    fetchLog({ serverId, file: selectedSource.path, line: lineCount });
  };

  return (
    <DataPanel
      icon={ScrollTextIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          disabled={isLoading || !selectedSource}
          onClick={handleRefresh}
        >
          <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
          {tCommon('refresh')}
        </Button>
      }
      toolbar={
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={selectedSource?.id ?? ''}
              onValueChange={setSelectedSourceId}
            >
              <SelectTrigger
                className="h-9 w-full sm:w-64"
                aria-label={t('source')}
              >
                <SelectValue placeholder={t('source')} />
              </SelectTrigger>
              <SelectContent>
                {VM_LOG_SOURCE_CATEGORIES.map((category) => {
                  const sources = catalog.filter(
                    (source) => source.category === category.id,
                  );
                  if (sources.length === 0) return null;

                  return (
                    <SelectGroup key={category.id}>
                      <SelectLabel>{category.label}</SelectLabel>
                      {sources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>

            <Select
              value={String(lineCount)}
              onValueChange={(value) => setLineCount(Number(value))}
            >
              <SelectTrigger className="h-9 w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {t('lines', { count: value })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DataPanelSearch
              value={filters.search}
              placeholder={t('filterPlaceholder')}
              onChange={filters.setSearch}
            />
          </div>
          <DataPanelMeta>
            {discovery.isLoading
              ? t('discovering')
              : t('showing', {
                  shown: filters.filteredEntries.length,
                  total: parsedLines.length,
                })}
          </DataPanelMeta>
        </>
      }
      footer={
        <DataPanelMeta>
          <span className="font-mono">
            {selectedSource?.path ?? t('allLogs')}
          </span>
        </DataPanelMeta>
      }
    >
      {isLoading ? (
        <DataPanelState state="loading" title={t('loading')} />
      ) : logResponse.$status === 'failed' &&
        isEmptyLogResponse(logResponse) ? (
        <DataPanelState state="empty" title={t('emptyFile')} />
      ) : logResponse.$status === 'failed' ? (
        <DataPanelState
          state="failed"
          title={t('failed')}
          description={getResponseErrorMessage(logResponse)}
          action={<DataPanelRetry onClick={handleRefresh} />}
        />
      ) : parsedLines.length === 0 ? (
        <DataPanelState state="empty" title={t('emptyFile')} />
      ) : (
        <LogResults
          ariaLabel={t('title')}
          filters={filters}
          filePath={selectedSource?.path}
          scrollResetKey={selectedSource?.id}
        />
      )}
    </DataPanel>
  );
}
