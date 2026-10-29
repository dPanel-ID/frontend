import type { ReactNode } from 'react';

import { DownloadIcon, RefreshCwIcon, TerminalIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';

import type { LogTimeRange } from '../../../../-lib/log-time-range';
import LogTimeRangeMenu from '../LogTimeRangeMenu';

interface AppLogsSectionProps {
  children?: ReactNode;
  selectedLogs?: string;
  ctaLogsDisabled?: boolean;
  timeRange: LogTimeRange;
  lineCount: number;
  lineLimit: number;

  onClickLogs?: () => void;
  onClickDownloadLog?: () => void;
  onSelectTimeRange: (timeRange: LogTimeRange) => void;
}

export default function AppLogsSection(props: AppLogsSectionProps) {
  const {
    children,
    lineCount,
    lineLimit,
    selectedLogs,
    ctaLogsDisabled,
    onClickDownloadLog,
    onClickLogs,
    onSelectTimeRange,
    timeRange,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const logActionLabel = selectedLogs ? t('refreshLog') : t('loadLog');

  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold">{t('title')}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
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

          <LogTimeRangeMenu value={timeRange} onChange={onSelectTimeRange} />

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
