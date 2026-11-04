import {
  CpuIcon,
  EyeIcon,
  PlusIcon,
  RefreshCwIcon,
  ServerCogIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import SpinnerOverlay from '@/shared/presentation/atoms/SpinnerOverlay';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';

import { isWorkersUnavailable } from '../lib/workers';
import { WorkersModelProvider, useWorkersModel } from '../model';
import type { WorkersCardProps } from '../rules/types';
import useAddWorkerUsecase from '../usecase/use-add-worker';
import useChangeModeUsecase from '../usecase/use-change-mode';
import useRemoveWorkerUsecase from '../usecase/use-remove-worker';
import useRotateTokenUsecase from '../usecase/use-rotate-token';

import ModeSelector from './-presentation/ModeSelector';
import WorkerList from './-presentation/WorkerList';
import WorkersLoading from './-presentation/WorkersLoading';

/**
 * Where a workspace's jobs run: dPanel's shared workers, or the workspace's
 * own (VM or GitHub workflow). Shown on the profile for the personal
 * workspace and on a team page for that team.
 */
export default function WorkersCard(props: WorkersCardProps) {
  return (
    <WorkersModelProvider key={props.workspaceId} {...props}>
      <WorkersCardBody />
    </WorkersModelProvider>
  );
}

function WorkersCardBody() {
  const t = useDevetekTranslations('widget.workers');
  const { accent, canManage, refresh, workers, workspaceId } =
    useWorkersModel();

  const usecaseParams = { workspaceId, onSuccess: () => refresh() };
  const [handleChangeMode, pendingMode] = useChangeModeUsecase(usecaseParams);
  const [handleAdd] = useAddWorkerUsecase(usecaseParams);
  const [handleRemove] = useRemoveWorkerUsecase(usecaseParams);
  const [handleRotate] = useRotateTokenUsecase(usecaseParams);

  // Fail closed: no card where the API has no workers yet or denies access.
  if (workers.$status === 'failed' && isWorkersUnavailable(workers)) {
    return null;
  }

  const view =
    workers.$status === 'success'
      ? workers
      : workers.$status === 'loading'
        ? workers.prevData
        : undefined;
  const isRefetching = workers.$status === 'loading' && Boolean(view);

  return (
    <section
      className="overflow-hidden rounded-2xl border bg-card"
      aria-labelledby="workspace-workers-title"
    >
      <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            id="workspace-workers-title"
            className="flex items-center gap-2 text-base font-bold"
          >
            <ServerCogIcon
              className="size-4 text-muted-foreground"
              aria-hidden
            />
            {t('title')}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('refresh')}
            title={t('refresh')}
            onClick={() => refresh()}
          >
            <RefreshCwIcon />
          </Button>
          {canManage && view && view.workers.length > 0 && (
            <button
              type="button"
              className={flowCtaClassName(accent, 'px-3 py-1.5')}
              onClick={handleAdd}
            >
              <PlusIcon className="size-4" aria-hidden />
              {t('addWorker')}
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 p-5">
        {!canManage && view && (
          <p className="flex items-start gap-2 rounded-lg border bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <EyeIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t('readOnly')}
          </p>
        )}

        {workers.$status === 'failed' && !view ? (
          <div className="relative">
            <div className="opacity-50">
              <WorkersLoading />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 rounded-xl border bg-card p-4 pb-2 shadow-2xl">
              <FailedState.WallCentered.Retryable
                errorPayload={getApiErrorDetail(workers.error)}
                onClickRetry={() => refresh()}
              />
            </div>
          </div>
        ) : !view ? (
          <WorkersLoading />
        ) : (
          <SpinnerOverlay loading={isRefetching}>
            <div className="flex flex-col gap-4">
              <ModeSelector
                mode={view.mode}
                accent={accent}
                canManage={canManage}
                hasWorkers={view.workers.length > 0}
                pendingMode={pendingMode}
                onSelect={handleChangeMode}
              />

              {view.workers.length > 0 ? (
                <WorkerList
                  workers={view.workers}
                  canManage={canManage}
                  onRotate={handleRotate}
                  onRemove={handleRemove}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl border',
                      FLOW_ACCENTS[accent].icon,
                    )}
                    aria-hidden
                  >
                    <CpuIcon className="size-5" />
                  </span>
                  <div className="flex max-w-md flex-col gap-1">
                    <p className="text-sm font-semibold">{t('empty.title')}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('empty.description')}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      className={flowCtaClassName(accent, 'px-3 py-1.5')}
                      onClick={handleAdd}
                    >
                      <PlusIcon className="size-4" aria-hidden />
                      {t('addWorker')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </SpinnerOverlay>
        )}
      </div>
    </section>
  );
}
