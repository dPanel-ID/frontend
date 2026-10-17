import { Spinner } from '@/shared/presentation/atoms/Spinner';

/** Shown while a lazily loaded tab panel downloads. */
export function PanelFallback() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border bg-card">
      <Spinner />
    </div>
  );
}
