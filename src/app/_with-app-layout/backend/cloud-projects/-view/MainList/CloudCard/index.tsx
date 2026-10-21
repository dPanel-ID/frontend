import { Clock3Icon } from 'lucide-react';

import { useDevetekLocale } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import type { CloudProjectCard } from '../../../-lib/describe-cloud-project';
import { cloudStatusBucket } from '../../../-lib/describe-cloud-project';
import { CloudProjectActions } from '../CloudProjectActions';
import {
  CloudProjectIdentity,
  CloudProjectStatusPill,
} from '../CloudProjectIdentity';
import type { CloudProjectHandlers } from '../useCloudProjectHandlers';

export interface CloudCardProps {
  cloudProject: CloudProjectCard;
  handlers: CloudProjectHandlers;
}

/** The grid tile: identity, state, and when the account last changed. */
export default function CloudCard(props: CloudCardProps) {
  const { cloudProject, handlers } = props;
  const locale = useDevetekLocale();
  const bucket = cloudStatusBucket(cloudProject.status);

  return (
    <article
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        bucket === 'failed' && 'border-red-400/40',
        bucket === 'progress' && 'border-sky-400/40',
      )}
    >
      <CloudProjectIdentity
        cloudProject={cloudProject}
        size="sm"
        onClickName={handlers.openDetails}
      />

      <CloudProjectStatusPill
        cloudProject={cloudProject}
        className="self-start"
      />

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
          <Clock3Icon className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {cloudProject.updatedAt
              ? getDistanceFromNow(cloudProject.updatedAt, locale)
              : '—'}
          </span>
        </span>
        <CloudProjectActions handlers={handlers} layout="menu" />
      </div>
    </article>
  );
}
