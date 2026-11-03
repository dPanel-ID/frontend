import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import type { ResponseError } from '@/shared/libs/api-client/rules/types';
import { cn } from '@/shared/libs/tailwind/cn';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../../-model/events';

/** Placeholders shaped like the table, so nothing jumps on arrival. */
function Loading() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
          style={{ opacity: 1 - index * 0.18 }}
        >
          <div className="grid gap-1.5">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-3 w-16" />
          </div>
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-4 w-24" />
          <Shimmer className="hidden h-4 w-28 sm:block" />
          <Shimmer className="ml-auto size-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function Shimmer(props: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border/60', props.className)}
    />
  );
}

function Error(props: ResponseError) {
  const emit = useEmit();

  return (
    <div className="relative">
      <div className="opacity-50">
        <Loading />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-1/2 rounded-xl border bg-card p-4 pb-2 shadow-2xl">
        <FailedState.WallCentered.Retryable
          errorPayload={getApiErrorDetail(props.error)}
          onClickRetry={() => emit('@admin-tasks/data--refresh', null)}
        />
      </div>
    </div>
  );
}

export const TaskListState = {
  Loading,
  Error,
};
