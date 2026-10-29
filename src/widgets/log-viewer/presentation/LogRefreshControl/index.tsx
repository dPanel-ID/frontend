import {
  CheckIcon,
  ChevronDownIcon,
  RefreshCwIcon,
  TimerResetIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';

import { LOG_AUTO_REFRESH_OPTIONS } from '../../lib/auto-refresh';
import type { AutoRefreshState } from '../../usecase/use-auto-refresh';

interface LogRefreshControlProps {
  state: AutoRefreshState;
  isRefreshing: boolean;
  disabled?: boolean;
  onRefresh: () => void;
}

const SEGMENT =
  'inline-flex h-8 items-center gap-1.5 px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

/**
 * Refresh now, plus how often to refresh on its own (off by default), as one
 * split control.
 */
export default function LogRefreshControl(props: LogRefreshControlProps) {
  const { disabled, isRefreshing, onRefresh, state } = props;

  const t = useDevetekTranslations('common.logViewer.autoRefresh');
  const tCommon = useDevetekTranslations('common.dataPanel');

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-md border bg-background">
      <button
        type="button"
        className={SEGMENT}
        disabled={disabled || isRefreshing}
        onClick={onRefresh}
      >
        <RefreshCwIcon
          className={cn('size-4', isRefreshing && 'animate-spin')}
        />
        {tCommon('refresh')}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(SEGMENT, 'border-l px-2.5')}
            disabled={disabled}
            aria-label={t('aria', { value: t(`short.${state.autoRefresh}`) })}
            title={
              state.paused && state.autoRefresh !== 'off'
                ? t('paused')
                : t('label')
            }
          >
            <TimerResetIcon
              className={cn(
                'size-4',
                state.autoRefresh !== 'off' && !state.paused && 'text-sky-500',
              )}
            />
            {t(`short.${state.autoRefresh}`)}
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            {t('label')}
          </DropdownMenuLabel>
          {LOG_AUTO_REFRESH_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => state.setAutoRefresh(option.value)}
              className="justify-between"
            >
              {t(`option.${option.value}`)}
              {state.autoRefresh === option.value && (
                <CheckIcon className="size-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
