import { cn } from '@/shared/libs/tailwind/cn';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../../../-model/events';

function Shimmer(props: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border/60', props.className)}
    />
  );
}

function Loading() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="grid h-28 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border bg-background/50 p-3"
        >
          <div className="grid gap-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-6 w-20" />
            <Shimmer className="h-3 w-24" />
          </div>
          <Shimmer className="h-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function Failed() {
  const emit = useEmit();

  return (
    <div className="relative">
      <div className="opacity-50">
        <Loading />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-1/2">
        <FailedState.BannerRetryable
          classNameWrapper="shadow-lg"
          onClickRetry={() => {
            emit('@servers::detail/server-stats-refresh', null);
          }}
        />
      </div>
    </div>
  );
}

export const LiveUsageStates = {
  Loading,
  Failed,
};
