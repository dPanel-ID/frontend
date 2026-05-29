import type { ReactNode } from 'react';

import {
  Clock3Icon,
  DownloadIcon,
  RefreshCwIcon,
  TerminalIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';

import type { AppLogTimeFilter } from '../../../../-model/app-logs';

interface AppLogsSectionProps {
  children?: ReactNode;
  selectedLogs?: string;
  ctaLogsDisabled?: boolean;
  activeTimeFilter: AppLogTimeFilter;
  lineCount: number;
  lineLimit: number;

  onClickLogs?: () => void;
  onClickDownloadLog?: () => void;
  onSelectTimeFilter?: (timeFilter: AppLogTimeFilter) => void;
}

const TIME_FILTERS: AppLogTimeFilter[] = ['10m', '1h'];

export default function AppLogsSection(props: AppLogsSectionProps) {
  const {
    activeTimeFilter,
    children,
    lineCount,
    lineLimit,
    selectedLogs,
    ctaLogsDisabled,
    onClickDownloadLog,
    onClickLogs,
    onSelectTimeFilter,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const logActionLabel = selectedLogs ? t('refreshLog') : t('loadLog');

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div
            className={cn(
              'inline-flex h-8 min-w-0 max-w-56 items-center gap-2 rounded-md border bg-background px-2 text-sm',
              !selectedLogs && 'text-muted-foreground',
            )}
            title={selectedLogs || t('placeholder')}
          >
            <TerminalIcon className="size-4 shrink-0" />
            <span className="truncate">{selectedLogs || t('placeholder')}</span>
          </div>

          <div
            aria-label={t('timeRangeLabel')}
            className="inline-flex h-8 items-center rounded-md border bg-background p-0.5"
            role="group"
          >
            <Clock3Icon className="mx-2 size-4 text-muted-foreground" />
            {TIME_FILTERS.map((timeFilter) => {
              const isActive = activeTimeFilter === timeFilter;

              return (
                <button
                  key={timeFilter}
                  type="button"
                  aria-pressed={isActive}
                  className={cn(
                    'h-6 rounded-sm px-2 text-xs font-medium transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => onSelectTimeFilter?.(timeFilter)}
                  title={t(timeFilter === '10m' ? 'last10Minutes' : 'lastHour')}
                >
                  {timeFilter === '10m' ? t('tenMinutes') : t('oneHour')}
                </button>
              );
            })}
          </div>

          <span className="h-8 rounded-md border bg-background px-2 text-xs font-medium leading-8 text-muted-foreground">
            {t('lineWindow', { count: lineCount, limit: lineLimit })}
          </span>

          {selectedLogs && (
            <Button
              size="icon-sm"
              buttonColor="secondary"
              buttonStyle="outline"
              onClick={onClickDownloadLog}
              aria-label={t('downloadLog')}
              title={t('downloadLog')}
            >
              <DownloadIcon />
            </Button>
          )}

          <Button
            size="icon-sm"
            buttonColor="secondary"
            buttonStyle="outline"
            disabled={ctaLogsDisabled}
            onClick={onClickLogs}
            aria-label={logActionLabel}
            title={logActionLabel}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      {children}
    </Card>
  );
}
