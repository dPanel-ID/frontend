import { KeyRoundIcon, RotateCwIcon, Trash2Icon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { formatLastSeen } from '../../lib/workers';
import type { WorkerRow } from '../../rules/types';

import WorkerTypeBadge from './WorkerTypeBadge';

interface WorkerListProps {
  workers: WorkerRow[];
  canManage: boolean;
  onRotate: (worker: WorkerRow) => void;
  onRemove: (worker: WorkerRow) => void;
}

/** One line per private worker: what it is, where it runs, when last seen. */
export default function WorkerList(props: WorkerListProps) {
  const { canManage, onRemove, onRotate, workers } = props;
  const t = useDevetekTranslations('widget.workers.list');
  const locale = useDevetekLocale();

  return (
    <ul className="divide-y overflow-hidden rounded-xl border">
      {workers.map((worker) => {
        const lastSeen = formatLastSeen(worker.lastSeenAt, locale);

        return (
          <li
            key={worker.id}
            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="truncate text-sm font-semibold"
                  title={worker.name}
                >
                  {worker.name}
                </span>
                <WorkerTypeBadge kind={worker.kind} />
              </div>
              <span
                className="truncate font-mono text-xs text-primary/80"
                title={worker.target ?? undefined}
              >
                {worker.target ?? '—'}
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span
                  title={
                    worker.lastSeenAt
                      ? new Date(worker.lastSeenAt).toLocaleString(locale)
                      : undefined
                  }
                >
                  {lastSeen
                    ? t('lastSeen', { time: lastSeen })
                    : t('neverSeen')}
                </span>
                {worker.kind === 'vm' && worker.tokenHint && (
                  <span className="inline-flex items-center gap-1">
                    <KeyRoundIcon className="size-3" aria-hidden />
                    {t('tokenHint', { hint: worker.tokenHint })}
                  </span>
                )}
              </span>
            </div>

            {canManage && (
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                {worker.kind === 'vm' && (
                  <Button
                    size="sm"
                    buttonStyle="outline"
                    buttonColor="secondary"
                    aria-label={t('rotateAria', { name: worker.name })}
                    title={t('rotateAria', { name: worker.name })}
                    onClick={() => onRotate(worker)}
                  >
                    <RotateCwIcon />
                    {t('rotate')}
                  </Button>
                )}
                <Button
                  size="icon-sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  danger
                  aria-label={t('removeAria', { name: worker.name })}
                  title={t('removeAria', { name: worker.name })}
                  onClick={() => onRemove(worker)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
