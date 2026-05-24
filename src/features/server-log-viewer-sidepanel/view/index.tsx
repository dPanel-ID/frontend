import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  BracesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
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
const JSON_MESSAGE_KEYS = ['message', 'msg', 'log', 'body', 'event'] as const;
const JSON_TIME_KEYS = [
  'timestamp',
  'time',
  'ts',
  '@timestamp',
  'datetime',
] as const;
const JSON_LEVEL_KEYS = ['level', 'severity', 'status', 'priority'] as const;

type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'fatal';

interface ParsedLogLine {
  id: string;
  lineNumber: number;
  raw: string;
  message: string;
  timestamp?: string;
  level: LogLevel;
  jsonPayload?: unknown;
  sourceLabel: string;
  searchText: string;
}

const LEVEL_STYLE: Record<LogLevel, string> = {
  debug: 'border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  info: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  notice:
    'border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  warn: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  error: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300',
  fatal: 'border-red-600/30 bg-red-600/15 text-red-700 dark:text-red-200',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function coerceText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function extractTextField(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = coerceText(record[key]);
    if (value) return value;
  }

  return undefined;
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function tryParseJson(raw: string): unknown | undefined {
  const trimmed = raw.trim();

  if (!trimmed) return undefined;

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function normalizeLevel(value: unknown, raw: string): LogLevel {
  const normalized = `${coerceText(value) ?? ''} ${raw}`.toLowerCase();

  if (/\b(fatal|panic|critical|crit)\b/.test(normalized)) return 'fatal';
  if (/\b(error|err|failed|failure|denied|exception)\b/.test(normalized)) {
    return 'error';
  }
  if (/\b(warn|warning)\b/.test(normalized)) return 'warn';
  if (/\b(notice|success|succeeded|started|stopped)\b/.test(normalized)) {
    return 'notice';
  }
  if (/\b(debug|trace|verbose)\b/.test(normalized)) return 'debug';

  return 'info';
}

function parsePlainLogLine(raw: string) {
  const isoMatch = raw.match(
    /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(.*)$/,
  );

  if (isoMatch) {
    return {
      timestamp: isoMatch[1],
      message: isoMatch[2] || raw,
    };
  }

  const syslogMatch = raw.match(
    /^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^:]+):\s?(.*)$/,
  );

  if (syslogMatch) {
    return {
      timestamp: syslogMatch[1],
      message: syslogMatch[4] || raw,
      source: syslogMatch[3],
    };
  }

  return {
    message: raw,
  };
}

function parseLogLine(
  raw: string,
  lineIndex: number,
  source: ServerLogSource | undefined,
): ParsedLogLine {
  const jsonPayload = tryParseJson(raw);
  const sourceLabel = source?.label ?? 'Log';

  if (isRecord(jsonPayload)) {
    const message =
      extractTextField(jsonPayload, JSON_MESSAGE_KEYS) ??
      safeJsonStringify(jsonPayload);
    const timestamp = extractTextField(jsonPayload, JSON_TIME_KEYS);
    const levelValue = extractTextField(jsonPayload, JSON_LEVEL_KEYS);
    const level = normalizeLevel(levelValue, message);

    return {
      id: `${lineIndex}-${raw}`,
      lineNumber: lineIndex + 1,
      raw,
      message,
      timestamp,
      level,
      jsonPayload,
      sourceLabel,
      searchText: `${raw} ${message} ${timestamp ?? ''} ${level}`,
    };
  }

  if (Array.isArray(jsonPayload)) {
    const message = safeJsonStringify(jsonPayload);

    return {
      id: `${lineIndex}-${raw}`,
      lineNumber: lineIndex + 1,
      raw,
      message,
      level: normalizeLevel(undefined, raw),
      jsonPayload,
      sourceLabel,
      searchText: `${raw} ${message}`,
    };
  }

  const plain = parsePlainLogLine(raw);
  const level = normalizeLevel(undefined, plain.message);

  return {
    id: `${lineIndex}-${raw}`,
    lineNumber: lineIndex + 1,
    raw,
    message: plain.message,
    timestamp: plain.timestamp,
    level,
    sourceLabel: plain.source ?? sourceLabel,
    searchText: `${raw} ${plain.message} ${plain.timestamp ?? ''} ${plain.source ?? ''} ${level}`,
  };
}

function StructuredValue(props: {
  label?: string;
  value: unknown;
  depth?: number;
}) {
  const { label, value, depth = 0 } = props;

  const labelNode =
    label != null ? (
      <span className="mr-2 text-muted-foreground">{label}:</span>
    ) : null;

  if (Array.isArray(value)) {
    return (
      <div className="space-y-1" style={{ marginLeft: depth ? 16 : 0 }}>
        {labelNode}
        <span className="text-muted-foreground">Array[{value.length}]</span>
        <div className="space-y-1 border-l pl-3">
          {value.map((item, index) => (
            <StructuredValue
              key={index}
              label={String(index)}
              value={item}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);

    return (
      <div className="space-y-1" style={{ marginLeft: depth ? 16 : 0 }}>
        {labelNode}
        <span className="text-muted-foreground">Object</span>
        <div className="space-y-1 border-l pl-3">
          {entries.map(([key, item]) => (
            <StructuredValue
              key={key}
              label={key}
              value={item}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  const valueNode = (() => {
    if (value == null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'string') {
      return (
        <span className="text-emerald-600 dark:text-emerald-300">
          "{value}"
        </span>
      );
    }

    if (typeof value === 'number') {
      return <span className="text-sky-600 dark:text-sky-300">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className="text-violet-600 dark:text-violet-300">
          {String(value)}
        </span>
      );
    }

    return <span>{String(value)}</span>;
  })();

  return (
    <div style={{ marginLeft: depth ? 16 : 0 }}>
      {labelNode}
      {valueNode}
    </div>
  );
}

function ToolbarIconButton(props: {
  children: ReactNode;
  disabled?: boolean;
  title: string;
  onClick: () => void;
}) {
  const { children, disabled, title, onClick } = props;

  return (
    <button
      type="button"
      className="flex size-8 cursor-pointer items-center justify-center rounded-md border bg-card text-primary/70 transition-colors hover:bg-border/60 disabled:cursor-default disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function LogLevelBadge(props: { level: LogLevel }) {
  const { level } = props;

  return (
    <span
      className={cn(
        'inline-flex w-14 items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
        LEVEL_STYLE[level],
      )}
    >
      {level}
    </span>
  );
}

function LogRow(props: {
  entry: ParsedLogLine;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { entry, expanded, onToggle } = props;
  const canExpand = entry.jsonPayload !== undefined;
  const rowClassName =
    'grid w-full grid-cols-[44px_160px_72px_120px_minmax(0,1fr)] items-start gap-3 px-3 py-2 text-left transition-colors';
  const rowContent = (
    <>
      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        {canExpand ? (
          expanded ? (
            <ChevronDownIcon className="size-3" />
          ) : (
            <ChevronRightIcon className="size-3" />
          )
        ) : (
          <span className="size-3" />
        )}
        {entry.lineNumber}
      </span>
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        {entry.timestamp ?? '-'}
      </span>
      <LogLevelBadge level={entry.level} />
      <span className="truncate text-xs text-muted-foreground">
        {entry.sourceLabel}
      </span>
      <span className="min-w-0 break-words font-mono text-xs leading-5 text-primary">
        {entry.message || ' '}
      </span>
    </>
  );

  return (
    <div className="border-b last:border-b-0">
      {canExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          className={cn(rowClassName, 'cursor-pointer hover:bg-border/40')}
          onClick={onToggle}
        >
          {rowContent}
        </button>
      ) : (
        <div className={rowClassName}>{rowContent}</div>
      )}

      {canExpand && expanded ? (
        <div className="border-t bg-background/60 px-3 py-3">
          <div className="grid grid-cols-[44px_1fr] gap-3">
            <span />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <BracesIcon className="size-4 text-muted-foreground" />
                Structured payload
              </div>
              <div className="max-h-80 overflow-auto rounded-md border bg-card p-3 font-mono text-xs leading-5">
                <StructuredValue value={entry.jsonPayload} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ServerLogViewerSidepanel(props: Props) {
  const { serverId, serverName } = props;

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [customFilePath, setCustomFilePath] = useState('');
  const [activeCustomFilePath, setActiveCustomFilePath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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

  const logLines = useMemo(
    () => (watchResponse.$status === 'success' ? [...watchResponse] : []),
    [watchResponse],
  );

  const parsedLogLines = useMemo(
    () =>
      logLines.map((line, index) => parseLogLine(line, index, selectedSource)),
    [logLines, selectedSource],
  );

  const filteredLogLines = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return parsedLogLines;

    return parsedLogLines.filter((line) =>
      line.searchText.toLowerCase().includes(normalizedQuery),
    );
  }, [parsedLogLines, searchQuery]);

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
    setExpandedRows(new Set());
  };

  const handleApplyCustomPath = () => {
    const nextPath = customFilePath.trim();
    if (!nextPath) return;

    setSelectedSourceId(CUSTOM_SOURCE_ID);
    setActiveCustomFilePath(nextPath);
    setExpandedRows(new Set());
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

  const toggleExpanded = (lineId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);

      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }

      return next;
    });
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[1120px]">
      <Layout.Title
        className="bg-background"
        title="Log Viewer"
        subtitle={serverName || `Server ID: ${serverId}`}
        hasCloseButton
      />

      <div className="grid h-full min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden border-t bg-background">
        <aside className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden border-r">
          <div className="space-y-3 border-b p-3">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-primary">Sources</p>
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

          <div className="min-h-0 space-y-4 overflow-y-auto p-2">
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
                        type="button"
                        title={source.path ?? source.label}
                        onClick={() => handleClickSource(source)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors',
                          isSelected
                            ? 'border-border bg-card text-primary shadow-sm'
                            : 'border-transparent text-primary hover:bg-border/60',
                        )}
                      >
                        <ScrollTextIcon
                          className={cn(
                            'size-3.5 shrink-0',
                            isSelected
                              ? 'text-primary'
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
                                  ? 'text-muted-foreground'
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
                  type="button"
                  title={activeCustomFilePath}
                  onClick={() => setSelectedSourceId(CUSTOM_SOURCE_ID)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors',
                    selectedSourceId === CUSTOM_SOURCE_ID
                      ? 'border-border bg-card text-primary shadow-sm'
                      : 'border-transparent text-primary hover:bg-border/60',
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

        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-tl-xl border-l border-t bg-card">
          <div className="grid gap-3 border-b p-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ScrollTextIcon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-primary">
                    {selectedSource?.label ?? 'Logs'}
                  </p>
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {activePath}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Select
                  value={String(lineCount)}
                  onValueChange={(value) => setLineCount(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[106px]">
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

                <ToolbarIconButton
                  disabled={
                    !selectedSource || watchResponse.$status === 'loading'
                  }
                  onClick={handleRefresh}
                  title="Refresh"
                >
                  <RefreshCwIcon
                    className={cn(
                      'size-4',
                      watchResponse.$status === 'loading' && 'animate-spin',
                    )}
                  />
                </ToolbarIconButton>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <Input
                inputSize="sm"
                value={searchQuery}
                placeholder="Filter logs"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {filteredLogLines.length} / {parsedLogLines.length}
              </p>
            </div>
          </div>

          <div ref={logViewportRef} className="min-h-0 overflow-y-auto">
            {watchResponse.$status === 'initial' ||
            watchResponse.$status === 'loading' ? (
              <div className="flex justify-center pt-8">
                <Spinner />
              </div>
            ) : watchResponse.$status === 'failed' ? (
              <p className="p-4 text-sm text-red-500">
                Failed to load logs: {watchResponse.error.message}
              </p>
            ) : parsedLogLines.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No log lines found.
              </p>
            ) : filteredLogLines.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No log lines match the filter.
              </p>
            ) : (
              <div className="min-w-[780px]">
                <div className="sticky top-0 z-10 grid grid-cols-[44px_160px_72px_120px_minmax(0,1fr)] gap-3 border-b bg-card px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                  <span>#</span>
                  <span>Time</span>
                  <span>Level</span>
                  <span>Source</span>
                  <span>Message</span>
                </div>
                {filteredLogLines.map((entry) => (
                  <LogRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedRows.has(entry.id)}
                    onToggle={() => toggleExpanded(entry.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
