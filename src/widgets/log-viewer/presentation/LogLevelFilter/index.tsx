import { useDevetekTranslations } from '@/services/i18n';

import type { LogLevel } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';

import type { LogFilters } from '../../usecase/use-log-filters';

const LEVEL_DOT: Record<LogLevel, string> = {
  debug: 'bg-sky-500',
  info: 'bg-emerald-500',
  notice: 'bg-violet-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
  fatal: 'bg-red-700',
};

/**
 * One chip per level present, with its count, so errors and warnings are a
 * click away. Hidden when every line has the same level.
 */
export default function LogLevelFilter(props: { filters: LogFilters }) {
  const { filters } = props;
  const t = useDevetekTranslations('common.logViewer');

  if (filters.presentLevels.length <= 1) return null;

  return (
    <div
      role="group"
      aria-label={t('levelFilter')}
      className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2"
    >
      <LevelChip
        active={filters.activeLevel === 'all'}
        count={filters.entries.length}
        label={t('allLevels')}
        onClick={() => filters.setLevelFilter('all')}
      />
      {filters.presentLevels.map((level) => (
        <LevelChip
          key={level}
          active={filters.activeLevel === level}
          count={filters.levelCounts.get(level) ?? 0}
          label={level}
          level={level}
          onClick={() => filters.setLevelFilter(level)}
        />
      ))}
    </div>
  );
}

function LevelChip(props: {
  active: boolean;
  count: number;
  label: string;
  level?: LogLevel;
  onClick: () => void;
}) {
  const { active, count, label, level, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium capitalize transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-sky-400/40 bg-background text-primary shadow-sm'
          : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-primary',
      )}
    >
      {level && (
        <span className={cn('size-2 rounded-full', LEVEL_DOT[level])} />
      )}
      {label}
      <span className="font-mono text-[11px] text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
