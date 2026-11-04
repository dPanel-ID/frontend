import { cn } from '@/shared/libs/tailwind/cn';

function Shimmer(props: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border/60', props.className)}
    />
  );
}

/** Placeholders shaped like the mode tiles and the list. */
export default function WorkersLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="grid gap-2 sm:grid-cols-2">
        <Shimmer className="h-16 rounded-xl" />
        <Shimmer className="h-16 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b p-3 last:border-0"
          >
            <div className="grid gap-1.5">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
            <Shimmer className="ml-auto size-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
