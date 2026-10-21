import { Clock3Icon, SignpostIcon, UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { DomainCard } from '@/entities/domain/rules/schema';

import { getDistanceFromNow } from '@/shared/libs/browser/date';

import { DomainActions } from './DomainActions';
import {
  DomainAccessPill,
  DomainIdentity,
  DomainProviderPill,
} from './DomainIdentity';

interface DomainRowProps {
  domain: DomainCard;
}

/** The desktop row: identity, who answers DNS, ownership and last change. */
export function DomainRow(props: DomainRowProps) {
  const { domain } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <article className="group grid gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="grid min-w-0 gap-3">
        <DomainIdentity domain={domain} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <DomainProviderPill domain={domain} />
          <DomainAccessPill domain={domain} />

          <Fact
            icon={SignpostIcon}
            label={t('page.domain.wildcardRecord')}
            value={`*.${domain.domain.hostname}`}
          />
          {domain.ownership.owner && (
            <Fact
              icon={UserIcon}
              label={t('common.terms.owner')}
              value={domain.ownership.owner}
            />
          )}
          <Fact
            icon={Clock3Icon}
            label={t('common.terms.lastUpdated')}
            value={getDistanceFromNow(domain.timestamp.updated, locale)}
            showLabel
          />
        </div>
      </div>

      <DomainActions domain={domain} layout="icons" />
    </article>
  );
}

interface FactProps {
  icon: LucideIcon;
  label: string;
  value: string;
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
