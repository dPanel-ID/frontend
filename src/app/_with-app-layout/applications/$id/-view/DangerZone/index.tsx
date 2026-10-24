import { Trash2Icon, TriangleAlertIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Button } from '@/shared/presentation/atoms/Button';

import { useAppDataModel } from '../../-model/app-data';
import { useEmit } from '../../-model/events';

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: () => null,
  fallbackError: () => null,
})(couple(useAppDataModel, (s: any) => s.appDetail));

/**
 * Last block on the page. It states what dNocs removes and what it leaves
 * behind, because "this cannot be undone" on its own does not tell someone
 * whether their server or their repository is about to go with it.
 */
export default guard(function DangerZone() {
  const t = useDevetekTranslations('page.applicationDetail.dangerZone');
  const emit = useEmit();

  const [appId, appName] = useAppDetail((s) => [s.id, s.identity.name]);

  const handleDelete = () => {
    emit('@applications::detail/application-delete', {
      applicationId: appId,
      applicationName: appName,
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/30 bg-card">
      <div className="flex items-center gap-2 border-b border-red-500/30 bg-red-500/5 px-4 py-3">
        <TriangleAlertIcon className="size-4 text-red-500" />
        <h2 className="text-base font-bold text-red-600 dark:text-red-400">
          {t('title')}
        </h2>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-semibold">{t('deleteThisApp')}</p>

          <ul className="flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground">
            <li>{t('consequences.removes')}</li>
            <li>{t('consequences.stops')}</li>
            <li>{t('consequences.keeps')}</li>
          </ul>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="shrink-0"
          onClick={handleDelete}
        >
          <Trash2Icon className="size-4" />
          {t('deleteThisApp')}
        </Button>
      </div>
    </section>
  );
});
