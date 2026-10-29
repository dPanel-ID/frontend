import { DownloadIcon, FileTextIcon, FilesIcon, XIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { LOG_DOWNLOAD_MAX_LINES } from '../../../../-lib/log-download';
import type { LogDownloadProgress } from '../../../../-lib/log-download';

export interface LogDownloadMenuProps {
  page: number;
  pageLines: number;
  /** Lines in the whole window, when the API reports it. */
  totalLines?: number;
  canDownloadAll: boolean;
  /** Set while every page is being fetched. */
  progress: LogDownloadProgress | null;
  onDownloadPage: () => void;
  onDownloadAll: () => void;
  onCancel: () => void;
}

/**
 * Saves the page on screen or every line in the time range. While the whole
 * range downloads it turns into a progress counter that can be cancelled.
 */
export default function LogDownloadMenu(props: LogDownloadMenuProps) {
  const {
    canDownloadAll,
    onCancel,
    onDownloadAll,
    onDownloadPage,
    page,
    pageLines,
    progress,
    totalLines,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs.download');

  if (progress) {
    return (
      <div
        role="status"
        className="inline-flex h-8 items-center gap-2 rounded-md border bg-background pl-2.5 pr-1 text-xs font-medium"
      >
        <Spinner className="size-3.5" />
        <span className="tabular-nums">
          {progress.totalLines === undefined
            ? t('progressUnknown', { fetched: progress.fetchedLines })
            : t('progress', {
                fetched: progress.fetchedLines,
                total: progress.totalLines,
              })}
        </span>
        <Button
          size="icon-xs"
          buttonColor="secondary"
          buttonStyle="ghost"
          onClick={onCancel}
          aria-label={t('cancel')}
          title={t('cancel')}
        >
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          buttonColor="secondary"
          buttonStyle="outline"
          disabled={pageLines === 0}
        >
          <DownloadIcon />
          {t('label')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('menuTitle')}
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={onDownloadPage} className="items-start">
          <FileTextIcon className="mt-0.5" />
          <span className="grid gap-0.5">
            <span className="font-medium">{t('page')}</span>
            <span className="text-xs text-muted-foreground">
              {t('pageHint', { page, lines: pageLines })}
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDownloadAll}
          disabled={!canDownloadAll}
          className="items-start"
        >
          <FilesIcon className="mt-0.5" />
          <span className="grid gap-0.5">
            <span className="font-medium">{t('all')}</span>
            <span className="text-xs text-muted-foreground">
              {!canDownloadAll
                ? t('allTooLarge', { max: LOG_DOWNLOAD_MAX_LINES })
                : totalLines === undefined
                  ? t('allHintUnknown')
                  : t('allHint', { lines: totalLines })}
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
