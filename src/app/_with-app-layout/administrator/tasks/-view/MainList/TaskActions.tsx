import type { MouseEvent } from 'react';

import { MoreHorizontalIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';

import type { AdminTaskRow } from '../../-lib/describe-admin-task';
import { useEmit } from '../../-model/events';
import type { AdminTaskActionPayload } from '../../-rules/usecase-types';

interface TaskActionsProps {
  task: AdminTaskRow;
}

/** The "more" menu of a task row: reclaim it, or fail it for good. */
export function TaskActions(props: TaskActionsProps) {
  const { task } = props;
  const t = useDevetekTranslations();
  const emit = useEmit();

  const stop = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  const payload: AdminTaskActionPayload = {
    executionId: task.executionId,
    type: task.type,
    serverHostname: task.serverHostname,
    workerId: task.workerId,
  };

  const menuLabel = t('page.adminTasks.actions.menu', { id: task.shortId });

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={menuLabel}
            title={menuLabel}
            onClick={stop}
            className="inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <MoreHorizontalIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64" onClick={stop}>
          <DropdownMenuItem
            disabled={!task.canReclaim}
            className="items-start"
            onClick={() => emit('@admin-tasks/task--reclaim', payload)}
          >
            <RotateCcwIcon className="mt-0.5 size-4" />
            <span className="flex min-w-0 flex-col">
              <span>{t('page.adminTasks.actions.reclaim')}</span>
              <span className="text-xs text-muted-foreground">
                {task.canReclaim
                  ? t('page.adminTasks.actions.reclaimHint')
                  : t('page.adminTasks.actions.reclaimUnavailable')}
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="items-start"
            onClick={() => emit('@admin-tasks/task--delete', payload)}
          >
            <Trash2Icon className="mt-0.5 size-4" />
            <span className="flex min-w-0 flex-col">
              <span>{t('page.adminTasks.actions.delete')}</span>
              <span className="text-xs opacity-80">
                {t('page.adminTasks.actions.deleteHint')}
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
