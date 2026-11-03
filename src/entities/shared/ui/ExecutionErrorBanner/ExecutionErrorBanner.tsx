import type { MouseEvent } from 'react';

import { CircleAlertIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import type { ExecutionErrorState } from '../../lib/execution-error-detail';
import { getExecutionErrorSummary } from '../../lib/execution-error-detail';

interface ExecutionErrorBannerProps {
  /** What failed, for example "Server setup failed". */
  title: string;
  state: ExecutionErrorState;
  /** Said when the API gave no reason; defaults to a generic line. */
  emptyMessage?: string;
  /** Opens the full error detail. */
  onClickDetail: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/**
 * The red banner a failed resource shows: what failed, the first useful line
 * of why, and a button to the full detail. Servers and load balancers share
 * it so every failure reads the same way.
 */
export function ExecutionErrorBanner(props: ExecutionErrorBannerProps) {
  const { className, emptyMessage, onClickDetail, state, title } = props;
  const t = useDevetekTranslations('common.executionError');

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-300" />
        <div className="min-w-0">
          <p className="font-bold text-red-700 dark:text-red-200">{title}</p>
          <p className="mt-0.5 line-clamp-2 break-words text-red-700/80 dark:text-red-100/75">
            {getExecutionErrorSummary(state) || emptyMessage || t('noDetail')}
          </p>
        </div>
      </div>

      <Button
        buttonStyle="outline"
        buttonColor="secondary"
        size="sm"
        className="shrink-0 border-red-400/30 text-red-700 hover:bg-red-500/15 dark:text-red-100"
        onClick={onClickDetail}
      >
        {t('viewDetail')}
      </Button>
    </div>
  );
}
