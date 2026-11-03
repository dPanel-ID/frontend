import { RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useEmit } from '../../-model/events';
import {
  TASKS_REFRESH_INTERVAL_MS,
  useAdminTasksDataModel,
} from '../../-model/tasks-data';

/**
 * The strip above the table. The API offers no search or filter, so the
 * strip only says how fresh the list is and offers a labelled refresh.
 */
export default function MainToolbar() {
  const t = useDevetekTranslations();
  const emit = useEmit();
  const refetching = useAdminTasksDataModel(
    (s) => s.tasks.$status === 'loading',
  );

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 rounded-xl border bg-card/40 p-1.5">
      <p className="truncate px-2 text-xs text-muted-foreground">
        {t('page.adminTasks.toolbar.autoRefresh', {
          seconds: TASKS_REFRESH_INTERVAL_MS / 1000,
        })}
      </p>

      <Button
        size="sm"
        buttonColor="secondary"
        buttonStyle="ghost"
        disabled={refetching}
        onClick={() => emit('@admin-tasks/data--refresh', null)}
      >
        <RefreshCwIcon className={refetching ? 'animate-spin' : undefined} />
        {t('common.actions.refresh')}
      </Button>
    </div>
  );
}
