import { useEffect, useMemo, useRef, useState } from 'react';

import {
  FileTextIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SearchIcon,
} from 'lucide-react';

import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ApiFolder } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { VM_LOG_SOURCES, VM_LOG_SOURCE_CATEGORIES } from '../rules/log-sources';
import type { ServerLogSource } from '../rules/log-sources';
import type { ServerLogViewerSidepanelProps as Props } from '../rules/types';

const DEFAULT_LINE_COUNT = 100;
const DEFAULT_SOURCE_ID = 'auth';
const CUSTOM_SOURCE_ID = 'custom';

const LINE_OPTIONS = [50, 100, 200, 500];

export default function ServerLogViewerSidepanel(props: Props) {
  const { serverId, serverName } = props;

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [customFilePath, setCustomFilePath] = useState('');
  const [activeCustomFilePath, setActiveCustomFilePath] = useState('');
  const logViewportRef = useRef<HTMLDivElement>(null);

  const [watchResponse, fetchWatch] =
    ApiFolder.Origin.$ServerId.Watch.useGetLazy();

  const selectedSource = useMemo<ServerLogSource | undefined>(() => {
    if (selectedSourceId === CUSTOM_SOURCE_ID && activeCustomFilePath) {
      return {
        id: CUSTOM_SOURCE_ID,
        label: 'Custom',
        path: activeCustomFilePath,
        category: 'overview',
      };
    }
    return VM_LOG_SOURCES.find((source) => source.id === selectedSourceId);
  }, [activeCustomFilePath, selectedSourceId]);

  useEffect(() => {
    if (!selectedSource || selectedSourceId === CUSTOM_SOURCE_ID) return;
    fetchWatch({
      serverId,
      filePath: selectedSource.path,
      line: lineCount,
    });
  }, [fetchWatch, lineCount, selectedSource, selectedSourceId, serverId]);

  const logLines =
    watchResponse.$status === 'success' ? [...watchResponse] : [];
  const activePath = selectedSource?.path ?? 'All VM logs';
  const latestLogLine =
    logLines.length > 0 ? logLines[logLines.length - 1] : '';

  useEffect(() => {
    if (watchResponse.$status !== 'success') return;

    const viewport = logViewportRef.current;
    if (!viewport) return;

    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [
    activePath,
    latestLogLine,
    lineCount,
    logLines.length,
    watchResponse.$status,
  ]);

  const handleClickSource = (source: ServerLogSource) => {
    setSelectedSourceId(source.id);
    setActiveCustomFilePath('');
  };

  const handleApplyCustomPath = () => {
    const nextPath = customFilePath.trim();
    if (!nextPath) return;
    setSelectedSourceId(CUSTOM_SOURCE_ID);
    setActiveCustomFilePath(nextPath);
    fetchWatch({
      serverId,
      filePath: nextPath,
      line: lineCount,
    });
  };

  const handleRefresh = () => {
    if (!selectedSource) return;
    fetchWatch({
      serverId,
      filePath: selectedSource.path,
      line: lineCount,
    });
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[980px]">
      <Layout.Title
        className="bg-background"
        title="Log Viewer"
        subtitle={serverName || `Server ID: ${serverId}`}
        hasCloseButton
      />

      <div className="grid h-full min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden border-t">
        <aside className="flex min-h-0 flex-col overflow-hidden border-r bg-background">
          <div className="space-y-3 border-b p-3">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">Sources</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                inputSize="sm"
                value={customFilePath}
                placeholder="/var/log/..."
                onChange={(event) => setCustomFilePath(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleApplyCustomPath();
                  }
                }}
              />
              <Button
                className="h-8 px-2"
                buttonColor="secondary"
                size="icon-sm"
                onClick={handleApplyCustomPath}
                title="Open custom source"
              >
                <SearchIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2">
            {VM_LOG_SOURCE_CATEGORIES.map((category) => {
              const sources = VM_LOG_SOURCES.filter(
                (source) => source.category === category.id,
              );
              if (sources.length === 0) return null;

              return (
                <section key={category.id} className="space-y-1">
                  <p className="px-2 text-[11px] font-medium uppercase text-muted-foreground">
                    {category.label}
                  </p>
                  {sources.map((source) => {
                    const isSelected =
                      selectedSourceId === source.id &&
                      selectedSourceId !== CUSTOM_SOURCE_ID;

                    return (
                      <button
                        key={source.id}
                        title={source.path ?? source.label}
                        onClick={() => handleClickSource(source)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted/60',
                        )}
                      >
                        <ScrollTextIcon
                          className={cn(
                            'size-3.5 shrink-0',
                            isSelected
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            {source.label}
                          </span>
                          {source.path ? (
                            <span
                              className={cn(
                                'block truncate text-[11px]',
                                isSelected
                                  ? 'text-primary-foreground/75'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {source.path}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </section>
              );
            })}

            {activeCustomFilePath ? (
              <section className="space-y-1">
                <p className="px-2 text-[11px] font-medium uppercase text-muted-foreground">
                  Custom
                </p>
                <button
                  title={activeCustomFilePath}
                  onClick={() => setSelectedSourceId(CUSTOM_SOURCE_ID)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-2 text-left transition-colors',
                    selectedSourceId === CUSTOM_SOURCE_ID
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted/60',
                  )}
                >
                  <ScrollTextIcon className="size-3.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">Custom</span>
                    <span className="block truncate text-[11px] opacity-75">
                      {activeCustomFilePath}
                    </span>
                  </span>
                </button>
              </section>
            ) : null}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden bg-zinc-950 dark:bg-zinc-950">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <ScrollTextIcon className="size-3.5 shrink-0 text-zinc-400" />
              <span
                className="truncate text-xs text-zinc-400"
                title={activePath}
              >
                {activePath}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Select
                value={String(lineCount)}
                onValueChange={(value) => setLineCount(Number(value))}
              >
                <SelectTrigger className="h-8 w-[96px] border-zinc-700 bg-zinc-800 text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} lines
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                className="cursor-pointer rounded p-2 transition-colors hover:bg-zinc-700 disabled:cursor-default disabled:opacity-40"
                disabled={
                  !selectedSource || watchResponse.$status === 'loading'
                }
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCwIcon
                  className={cn(
                    'size-3.5 text-zinc-400',
                    watchResponse.$status === 'loading' && 'animate-spin',
                  )}
                />
              </button>
            </div>
          </div>

          <div
            ref={logViewportRef}
            className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs leading-5"
          >
            {watchResponse.$status === 'initial' ||
            watchResponse.$status === 'loading' ? (
              <div className="flex justify-center pt-8">
                <Spinner />
              </div>
            ) : watchResponse.$status === 'failed' ? (
              <p className="text-red-400">
                Failed to load logs: {watchResponse.error.message}
              </p>
            ) : logLines.length === 0 ? (
              <p className="text-zinc-500">No log lines found.</p>
            ) : (
              <div className="flex min-h-full flex-col justify-end">
                <table className="w-full border-collapse">
                  <tbody>
                    {logLines.map((line, i) => (
                      <tr
                        key={`${i}-${line}`}
                        className="group transition-colors hover:bg-zinc-800/50"
                      >
                        <td className="w-10 shrink-0 select-none py-0 pr-4 text-right align-top text-zinc-600 group-hover:text-zinc-500">
                          {i + 1}
                        </td>
                        <td className="break-all py-0 align-top text-zinc-200 whitespace-pre-wrap">
                          {line || ' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
