import type { ReactNode } from 'react';


import { CalendarIcon, UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { UserLink } from '@/entities/user/ui/UserLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import type { CloudProjectCard } from '../../-lib/describe-cloud-project';
import { cloudStatusBucket } from '../../-lib/describe-cloud-project';

import { CloudProjectActions } from './CloudProjectActions';
import {
  CloudProjectAccessPill,
  CloudProjectIdentity,
  CloudProjectStatusPill,
} from './CloudProjectIdentity';
import type { CloudProjectHandlers } from './useCloudProjectHandlers';

interface CloudProjectRowProps {
  cloudProject: CloudProjectCard;
  handlers: CloudProjectHandlers;
}

/** The desktop row: identity, state, who can use it, and when it changed. */
export function CloudProjectRow(props: CloudProjectRowProps) {
  const { cloudProject, handlers } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const bucket = cloudStatusBucket(cloudProject.status);

  return (
    <article
      className={cn(
        'group grid gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center',
        bucket === 'failed' && 'border-red-400/40',
        bucket === 'progress' && 'border-sky-400/40',
      )}
    >
      <div className="grid min-w-0 gap-3">
        <CloudProjectIdentity
          cloudProject={cloudProject}
          onClickName={handlers.openDetails}
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <CloudProjectStatusPill cloudProject={cloudProject} />
          <CloudProjectAccessPill cloudProject={cloudProject} />

          {cloudProject.owner && (
            <Fact
              icon={UserIcon}
              label={t('common.terms.owner')}
              value={<UserLink {...cloudProject.owner} />}
            />
          )}
          {cloudProject.updatedAt && (
            <Fact
              icon={CalendarIcon}
              label={t('common.terms.lastUpdated')}
              value={getDistanceFromNow(cloudProject.updatedAt, locale)}
              showLabel
            />
          )}
        </div>
      </div>

      <CloudProjectActions handlers={handlers} layout="icons" />
    </article>
  );
}

interface FactProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  showLabel?: boolean;
}

function Fact(props: FactProps) {
  const { icon: Icon, label, showLabel = false, value } = props;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {showLabel ? (
        <span className="shrink-0">{label}</span>
      ) : (
        <span className="sr-only">{label}: </span>
      )}
      <span className="truncate font-medium text-primary/80">{value}</span>
    </span>
  );
}
