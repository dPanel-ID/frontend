import { useEffect, useMemo, useState } from 'react';

import { RefreshCwIcon, ScrollTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  VM_LOG_SOURCES,
  VM_LOG_SOURCE_CATEGORIES,
} from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import type { ServerLogSource } from '@/features/server-log-viewer-sidepanel/rules/log-sources';
import {
  LogRow,
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

import { useServerDataModel } from '../../../-model/server-data';
import {
  TabMeta,
  TabPanel,
  TabRetry,
  TabSearch,
  TabState,
} from '../_shared/TabPanel';

/** Enough to see what just happened without a page-long scroll. */
const DEFAULT_LINE_COUNT = 20;
const LINE_OPTIONS = [20, 50, 100, 200, 500];
const DEFAULT_SOURCE_ID = 'auth';

/**
 * The newest lines of one log file. The source and line count sit in the
 * toolbar, so the tab keeps the same shape as the others.
 */
export default function LogsTab() {
  const t = useDevetekTranslations('page.serverDetail.logs');
  const tCommon = useDevetekTranslations('page.serverDetail.tabsCommon');
  const [serverId] = useServerDataModel((s) => [String(s.serverId)]);

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [filter, setFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (lineId: string) => {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  return (
    <TabPanel
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
              onValueChange={(value) => {
                setSelectedSourceId(value);
                setExpandedRows(new Set());
              }}
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

            <TabSearch
              value={filter}
              placeholder={t('filterPlaceholder')}
              onChange={setFilter}
            />
          </div>
          <TabMeta>
            {discovery.isLoading
              ? t('discovering')
              : t('showing', {
                  shown: filteredLines.length,
                  total: parsedLines.length,
                })}
          </TabMeta>
        </>
      }
      footer={
        <TabMeta>
          <span className="font-mono">
            {selectedSource?.path ?? t('allLogs')}
          </span>
        </TabMeta>
      }
    >
      {isLoading ? (
        <TabState state="loading" title={t('loading')} />
      ) : logResponse.$status === 'failed' &&
        isEmptyLogResponse(logResponse) ? (
        <TabState state="empty" title={t('emptyFile')} />
      ) : logResponse.$status === 'failed' ? (
        <TabState
          state="failed"
          title={t('failed')}
          description={getResponseErrorMessage(logResponse)}
          action={<TabRetry onClick={handleRefresh} />}
        />
      ) : parsedLines.length === 0 ? (
        <TabState state="empty" title={t('emptyFile')} />
      ) : filteredLines.length === 0 ? (
        <TabState
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
          <div className="min-w-[780px]">
            <div className="sticky top-0 z-10 grid grid-cols-[44px_160px_72px_120px_minmax(0,1fr)] gap-3 border-b bg-background/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              <span>{t('table.n')}</span>
              <span>{t('table.time')}</span>
              <span>{t('table.level')}</span>
              <span>{t('table.source')}</span>
              <span>{t('table.message')}</span>
            </div>
            {filteredLines.map((entry) => (
              <LogRow
                key={entry.id}
                entry={entry}
                expanded={expandedRows.has(entry.id)}
                onToggle={() => toggleExpanded(entry.id)}
              />
            ))}
          </div>
        </div>
      )}
    </TabPanel>
  );
}
