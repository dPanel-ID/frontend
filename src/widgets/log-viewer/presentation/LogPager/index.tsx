import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanelMeta,
  DataPanelPagination,
} from '@/shared/presentation/organisms/DataPanel';

export interface LogPagerProps {
  page: number;
  pageSize: number;
  pageLines: number;
  hasMore: boolean;
  /** Lines in the whole window, when the API reports it. */
  totalLines?: number;
  /** The deepest page the log store can reach. */
  maxPage: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Where this page sits in the time range, newest lines first. With a known
 * total it shows numbered pages; without one, newer/older steps.
 */
export default function LogPager(props: LogPagerProps) {
  const {
    disabled,
    hasMore,
    maxPage,
    onPageChange,
    page,
    pageLines,
    pageSize,
    totalLines,
  } = props;

  const t = useDevetekTranslations('common.logViewer.pager');

  const first = pageLines === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = (page - 1) * pageSize + pageLines;
  const totalPage =
    totalLines === undefined
      ? undefined
      : Math.min(Math.max(1, Math.ceil(totalLines / pageSize)), maxPage);

  return (
    <>
      <DataPanelMeta>
        {totalLines === undefined
          ? t('rangeUnknown', { first, last })
          : t('range', { first, last, total: totalLines })}
      </DataPanelMeta>

      {totalPage !== undefined ? (
        <div className="flex items-center gap-3">
          <DataPanelPagination
            page={page}
            totalPage={totalPage}
            onPageChange={(next) => !disabled && onPageChange(next)}
          />
        </div>
      ) : (
        (page > 1 || hasMore) && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              buttonColor="secondary"
              buttonStyle="outline"
              disabled={disabled || page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeftIcon />
              {t('newer')}
            </Button>
            <DataPanelMeta>{t('page', { page })}</DataPanelMeta>
            <Button
              size="sm"
              buttonColor="secondary"
              buttonStyle="outline"
              disabled={disabled || !hasMore || page >= maxPage}
              onClick={() => onPageChange(page + 1)}
            >
              {t('older')}
              <ChevronRightIcon />
            </Button>
          </div>
        )
      )}
    </>
  );
}
