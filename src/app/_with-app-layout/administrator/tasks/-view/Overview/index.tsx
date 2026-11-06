import {
  HourglassIcon,
  ListChecksIcon,
  LoaderIcon,
  Trash2Icon,
  UserCheckIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { summarizeAdminTasks } from '../../-lib/describe-admin-task';
import { useAdminTasksDataModel } from '../../-model/tasks-data';

/**
 * Counts across the list. The API has no status filter, so the tiles report
 * rather than filter; a tile that cannot narrow the list is not a button.
 */
export default function Overview() {
  const t = useDevetekTranslations('page.adminTasks.overview');
  const tasks = useAdminTasksDataModel((s) => s.tasks);

  const data =
    tasks.$status === 'success'
      ? tasks
      : tasks.$status === 'loading'
        ? tasks.prevData
        : undefined;
  const summary = data ? summarizeAdminTasks(data.rows) : undefined;
  const loading = !summary;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
        <StatTile
          icon={ListChecksIcon}
          tone="sky"
          label={t('total')}
          value={summary?.total ?? 0}
          hint={t('totalHint')}
          loading={loading}
        />
        <StatTile
          icon={LoaderIcon}
          tone={summary?.running ? 'sky' : 'neutral'}
          label={t('running')}
          value={summary?.running ?? 0}
          loading={loading}
        />
        <StatTile
          icon={HourglassIcon}
          tone={summary?.waitingForWorker ? 'amber' : 'neutral'}
          label={t('waiting')}
          value={summary?.waitingForWorker ?? 0}
          hint={t('waitingHint')}
          loading={loading}
        />
        <StatTile
          icon={UserCheckIcon}
          tone={summary?.claimed ? 'emerald' : 'neutral'}
          label={t('claimed')}
          value={summary?.claimed ?? 0}
          hint={t('claimedHint')}
          loading={loading}
        />
        <StatTile
          icon={Trash2Icon}
          tone={summary?.safeToDelete ? 'red' : 'neutral'}
          label={t('safeToDelete')}
          value={summary?.safeToDelete ?? 0}
          hint={t('safeToDeleteHint')}
          loading={loading}
        />
      </div>

      {data?.limitReached && (
        <p className="text-[0.7rem] text-muted-foreground">
          {t('limitNote', { limit: data.rows.length })}
        </p>
      )}
    </div>
  );
}
