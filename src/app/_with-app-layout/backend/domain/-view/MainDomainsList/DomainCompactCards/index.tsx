import { Clock3Icon } from 'lucide-react';

import { useDevetekLocale } from '@/services/i18n';

import type { DomainCard } from '@/entities/domain/rules/schema';

import { getDistanceFromNow } from '@/shared/libs/browser/date';

import { DomainActions } from '../DomainActions';
import { DomainIdentity, DomainProviderPill } from '../DomainIdentity';

import type { DomainCompactCardsProps as Props } from './types';

export default function DomainCompactCards(props: Props) {
  const { list } = props;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((domain) => (
        <DomainCompactCard key={domain.id} domain={domain} />
      ))}
    </div>
  );
}

/** The grid tile: identity, who answers DNS, and when it last changed. */
function DomainCompactCard(props: { domain: DomainCard }) {
  const { domain } = props;
  const locale = useDevetekLocale();

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5">
      <DomainIdentity domain={domain} size="sm" />

      <DomainProviderPill domain={domain} className="self-start" />

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
          <Clock3Icon className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {getDistanceFromNow(domain.timestamp.updated, locale)}
          </span>
        </span>
        <DomainActions domain={domain} layout="menu" />
      </div>
    </article>
  );
}
