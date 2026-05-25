import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import IllustProgrammingLanguages from '@/shared/assets/illust-programming-languages.jpg';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { FailedState } from '@/widgets/failed-state';

import { useEmit } from '../../-model/events';
import { useServerDataModel } from '../../-model/server-data';

function Empty() {
  const emit = useEmit();
  const [refreshModuleInventory] = useServerDataModel((s) => [
    s.refreshModuleInventory,
  ]);
  const [openToaster] = useToaster();

  const t = useDevetekTranslations();

  const handleClickDiscoverModules = () => {
    emit('@servers::detail/favorite-navigation', {
      to: 'modules-discover',
    });
  };

  const handleClickRefresh = async () => {
    const response = await refreshModuleInventory();
    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: <>Refresh failed</>,
        message:
          'message' in response.error
            ? response.error.message
            : 'Unable to refresh server modules.',
      });
      return;
    }
    openToaster({
      variant: 'success',
      message: <>Server modules refreshed.</>,
    });
  };

  return (
    <Card className="rounded-2xl">
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              {t('page.serverDetail.sectionModules.emptyState.title')}
            </h1>
            <h3 className="text-md">
              {t('page.serverDetail.sectionModules.emptyState.subtitle')}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="w-max" onClick={handleClickDiscoverModules}>
              {t('common.actions.discover')}
            </Button>
            <Button
              className="w-max"
              variant="outline"
              onClick={handleClickRefresh}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="border-2 rounded-lg overflow-hidden h-[128px] w-[128px] relative">
          <img src={IllustProgrammingLanguages} alt="Illustration" />

          <div className="absolute left-0 top-0 w-full h-full shadow-inner shadow-black/10" />
        </div>
      </div>
    </Card>
  );
}

function Loading() {
  return (
    <Card className="rounded-2xl h-40 flex items-center justify-center">
      <Spinner />
    </Card>
  );
}

function Failed() {
  const emit = useEmit();

  const handleClickRetry = () => {
    emit('@servers::detail/server-modules-refresh', null);
  };

  return (
    <Card className="rounded-2xl h-40 flex items-center justify-center">
      <FailedState.BannerRetryable
        classNameWrapper="w-max"
        onClickRetry={handleClickRetry}
      />
    </Card>
  );
}

export const MainModulesStates = {
  Empty,
  Loading,
  Failed,
};
