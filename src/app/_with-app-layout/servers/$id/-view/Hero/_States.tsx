import { cn } from '@/shared/libs/tailwind/cn';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../-model/events';

function Shimmer(props: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border/60', props.className)}
    />
  );
}

function Loading() {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <Shimmer className="h-4 w-40" />
      <div className="mt-4 flex items-center gap-3">
        <Shimmer className="size-12 rounded-xl" />
        <div className="grid gap-2">
          <Shimmer className="h-6 w-56" />
          <Shimmer className="h-3 w-72" />
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <Shimmer className="h-3 w-40" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-32" />
      </div>
    </div>
  );
}

function Failed({ error }: { error: Error }) {
  const emit = useEmit();

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-35">
        <Loading />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-1/2">
        <FailedState.WallCentered.Retryable
          withCard
          errorPayload={error.message}
          onClickRetry={() => {
            emit('@servers::detail/server-detail-refresh', null);
          }}
        />
      </div>
    </div>
  );
}

export const HeroStates = {
  Loading,
  Failed,
};
