import type { ReactNode } from 'react';

import { DownloadIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';

interface AppLogsSectionProps {
  children?: ReactNode;
  selectedLogs?: string;
  ctaLogsDisabled?: boolean;

  onClickLogs?: () => void;
  onClickDownloadLog?: () => void;
}

export default function AppLogsSection(props: AppLogsSectionProps) {
  const {
    children,
    selectedLogs,
    ctaLogsDisabled,
    onClickDownloadLog,
    onClickLogs,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const logActionLabel = selectedLogs ? t('refreshLog') : t('loadLog');

  return (
    <Card className="rounded-2xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{t('title')}</h3>
          <h6 className="text-sm text-primary/70">{t('subtitle')}</h6>
        </div>

        <div className="flex items-center gap-1">
          {selectedLogs && (
            <Button
              variant="outline"
              onClick={onClickDownloadLog}
              aria-label={t('downloadLog')}
              title={t('downloadLog')}
            >
              <DownloadIcon />
            </Button>
          )}

          <Button
            variant="outline"
            disabled={ctaLogsDisabled}
            className="flex min-w-30 max-w-40 items-center justify-between gap-2 overflow-hidden"
            onClick={onClickLogs}
            aria-label={logActionLabel}
            title={logActionLabel}
          >
            <p
              className={cn(
                'line-clamp-1 overflow-ellipsis',
                !selectedLogs && 'opacity-50',
              )}
            >
              {selectedLogs || t('placeholder')}
            </p>

            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      {children}
    </Card>
  );
}
