import { PageHeaderShimmer } from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../-model/events';

function Loading() {
  return <PageHeaderShimmer hasHeadnote hasRightAppend hasStatuses />;
}

function Failed({ error }: { error: Error }) {
  const emit = useEmit();

  return (
    <div className="relative">
      <div className="opacity-35 pointer-events-none select-none">
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

export const HeaderStates = {
  Loading,
  Failed,
};
