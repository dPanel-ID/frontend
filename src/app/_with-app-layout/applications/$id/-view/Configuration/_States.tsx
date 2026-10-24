import { Spinner } from '@/shared/presentation/atoms/Spinner';

function Loading() {
  return (
    <div className="flex h-24 items-center justify-center rounded-2xl border bg-card">
      <Spinner />
    </div>
  );
}

export const ConfigurationStates = {
  Loading,
};
