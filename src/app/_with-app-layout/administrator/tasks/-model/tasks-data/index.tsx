import { useSyncExternalStore } from 'react';

import { ApiAdmin } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { toAdminTaskRows } from '../../-lib/describe-admin-task';
import { useSubscribe } from '../events';

/** How often the list reloads while the tab is visible. */
export const TASKS_REFRESH_INTERVAL_MS = 15_000;

/** Most tasks one read returns; the API sends the oldest first. */
export const TASKS_LIMIT = 200;

export const [AdminTasksDataModelProvider, useAdminTasksDataModel] =
  buildSelector('AdminTasksDataModel')(() => {
    const visible = usePageVisible();

    const [response, refresh] = ApiAdmin.Task.Find.useGet({
      limit: TASKS_LIMIT,
      options: {
        refreshIntervalMs: visible ? TASKS_REFRESH_INTERVAL_MS : 0,
      },
    });

    useSubscribe('@admin-tasks/data--refresh', () => {
      refresh();
    });

    return {
      tasks: useAdapter(response, (raw) => {
        const list = Array.isArray(raw) ? raw : [];

        return {
          rows: toAdminTaskRows(list, Date.now()),
          limitReached: list.length >= TASKS_LIMIT,
        };
      }),
      refresh,
    };
  });

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

/** True while the tab is in front, so hidden tabs stop polling. */
function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  );
}
