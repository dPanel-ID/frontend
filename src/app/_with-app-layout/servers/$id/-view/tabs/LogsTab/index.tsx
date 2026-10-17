import { useEffect, useMemo, useState } from 'react';

import { RefreshCwIcon, ScrollTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useServerLogEntrySidepanel } from '@/features/server-log-entry-sidepanel';
import {
  VM_LOG_SOURCES,
  VM_LOG_SOURCE_CATEGORIES,
} from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import type { ServerLogSource } from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import {
  LogLevelBadge,
  getLogViewerLines,
  getResponseErrorMessage,
  isEmptyLogResponse,
  parseLogLine,
  useServerLogSourceDiscovery,
} from '@/features/server-log-viewer-sidepanel/view';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

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
  const [openLogEntrySidepanel] = useServerLogEntrySidepanel();

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [filter, setFilter] = useState('');

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

  const filteredLines = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return parsedLines;
    return parsedLines.filter((line) =>
      line.searchText.toLowerCase().includes(query),
    );
  }, [filter, parsedLines]);

  const isLoading =
    logResponse.$status === 'initial' || logResponse.$status === 'loading';

  const handleRefresh = () => {
    if (!selectedSource) return;
    fetchLog({ serverId, file: selectedSource.path, line: lineCount });
  };

  const handleOpenEntry = (entry: ParsedLogLine) => {
    openLogEntrySidepanel({ entry, filePath: selectedSource?.path });
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
              value={filter}
              placeholder={t('filterPlaceholder')}
              onChange={setFilter}
            />
          </div>
          <DataPanelMeta>
            {discovery.isLoading
              ? t('discovering')
              : t('showing', {
                  shown: filteredLines.length,
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
      ) : filteredLines.length === 0 ? (
        <DataPanelState
          state="empty"
          title={t('noMatch')}
          action={
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              onClick={() => setFilter('')}
            >
              {tCommon('clearSearch')}
            </Button>
          }
        />
      ) : (
        <div className="max-h-[70vh] overflow-auto">
          <div className="min-w-[720px]">
            <div className="sticky top-0 z-10 grid grid-cols-[48px_160px_72px_120px_minmax(0,1fr)] gap-3 border-b bg-background/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              <span>{t('table.n')}</span>
              <span>{t('table.time')}</span>
              <span>{t('table.level')}</span>
              <span>{t('table.source')}</span>
              <span>{t('table.message')}</span>
            </div>
            {filteredLines.map((entry) => (
              <button
                key={entry.id}
                type="button"
                title={t('openEntry')}
                onClick={() => handleOpenEntry(entry)}
                className="grid w-full grid-cols-[48px_160px_72px_120px_minmax(0,1fr)] items-center gap-3 border-b px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-sky-500/5 focus-visible:bg-sky-500/10 focus-visible:outline-none"
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {entry.lineNumber}
                </span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  {entry.timestamp ?? '-'}
                </span>
                <LogLevelBadge level={entry.level} />
                <span className="truncate text-xs text-muted-foreground">
                  {entry.sourceLabel}
                </span>
                <span className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-primary">
                  {entry.jsonLabel && (
                    <span className="shrink-0 rounded border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {entry.jsonLabel}
                    </span>
                  )}
                  <span className="truncate">{entry.message || entry.raw}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </DataPanel>
  );
}
