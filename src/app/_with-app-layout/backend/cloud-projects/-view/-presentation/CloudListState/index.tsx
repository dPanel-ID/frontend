import { cn } from '@/shared/libs/tailwind/cn';
import { FailedState } from '@/widgets/failed-state';

import { useFilterModel } from '../../../-model/filters';

/** Placeholders shaped like the view that is loading, so nothing jumps. */
function Loading() {
  const [viewMode] = useFilterModel((s) => [s.viewMode]);
  const mode = viewMode === 'auto' ? 'table' : viewMode;

  if (mode === 'table') {
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
            style={{ opacity: 1 - index * 0.18 }}
          >
            <Shimmer className="size-9 rounded-lg" />
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-3"
            style={{ opacity: 1 - index * 0.12 }}
          >
            <div className="flex items-center gap-3">
              <Shimmer className="size-9 rounded-lg" />
              <Shimmer className="h-4 w-32" />
            </div>
            <Shimmer className="h-6 w-24 rounded-full" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="grid gap-4 rounded-2xl border bg-card p-4 xl:grid-cols-[minmax(0,1fr)_14rem]"
          style={{ opacity: 1 - index * 0.22 }}
        >
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Shimmer className="size-11 rounded-xl" />
              <div className="grid gap-2">
                <Shimmer className="h-5 w-48" />
                <Shimmer className="h-3 w-32" />
              </div>
            </div>
            <Shimmer className="h-7 w-2/3 rounded-full" />
          </div>
          <Shimmer className="h-10 rounded-xl" />
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

function Error({ error }: { error: Error }) {
  return (
    <div className="relative">
      <div className="opacity-50">
        <Loading />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-1/2 rounded-xl border bg-card p-4 pb-2 shadow-2xl">
        <FailedState.WallCentered errorPayload={error.message} />
      </div>
    </div>
  );
}

export const CloudListState = {
  Loading,
  Error,
};
