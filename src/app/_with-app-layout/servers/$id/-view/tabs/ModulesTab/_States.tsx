import type { ReactNode } from 'react';

import { PlusIcon, PuzzleIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../../-model/events';

function Empty(props: {
  adoptButton?: ReactNode;
  isRefreshing: boolean;
  onClickAdd: () => void;
  onClickRefresh: () => void;
}) {
  const { adoptButton, isRefreshing, onClickAdd, onClickRefresh } = props;
  const t = useDevetekTranslations('page.serverDetail.modules');

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />
      <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl border',
            FLOW_ACCENTS.sky.icon,
          )}
        >
          <PuzzleIcon className="size-7" />
        </span>
        <div>
          <h3 className="text-xl font-bold">{t('empty.title')}</h3>
          <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t('empty.message')}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={flowCtaClassName('sky')}
            onClick={onClickAdd}
          >
            <PlusIcon className="size-4" />
            {t('add')}
          </button>
          {adoptButton}
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isRefreshing}
            onClick={onClickRefresh}
          >
            <RefreshCwIcon className={cn(isRefreshing && 'animate-spin')} />
            {t('refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center rounded-2xl border bg-card">
      <Spinner />
    </div>
  );
}

function Failed() {
  const emit = useEmit();

  return (
    <div className="flex h-40 items-center justify-center rounded-2xl border bg-card">
      <FailedState.BannerRetryable
        classNameWrapper="w-max"
        onClickRetry={() =>
          emit('@servers::detail/server-modules-refresh', null)
        }
      />
    </div>
  );
}

export const ModulesTabStates = {
  Empty,
  Loading,
  Failed,
};
