import { useMemo, useState } from 'react';

import type {
  LogLevel,
  ParsedLogLine,
} from '@/features/server-log-viewer-sidepanel/view';

import { LOG_LEVEL_ORDER, countLogLevels } from '../lib/log-entries';

export type LogLevelFilterValue = LogLevel | 'all';

/** Text search and a level filter over a set of log lines. */
export function useLogFilters(entries: ParsedLogLine[]) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevelFilterValue>('all');

  const levelCounts = useMemo(() => countLogLevels(entries), [entries]);
  const presentLevels = LOG_LEVEL_ORDER.filter((level) =>
    levelCounts.has(level),
  );
  // A level that disappears after a refresh no longer filters anything out.
  const activeLevel: LogLevelFilterValue =
    levelFilter !== 'all' && levelCounts.has(levelFilter) ? levelFilter : 'all';

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (activeLevel === 'all' || entry.level === activeLevel) &&
        (!term || entry.searchText.toLowerCase().includes(term)),
    );
  }, [activeLevel, entries, search]);

  return {
    entries,
    search,
    setSearch,
    levelCounts,
    presentLevels,
    activeLevel,
    setLevelFilter,
    filteredEntries,
    clearFilters: () => {
      setSearch('');
      setLevelFilter('all');
    },
  };
}

export type LogFilters = ReturnType<typeof useLogFilters>;
