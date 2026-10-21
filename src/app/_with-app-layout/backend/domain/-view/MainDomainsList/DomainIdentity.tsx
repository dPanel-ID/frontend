import { BuildingIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DomainCard } from '@/entities/domain/rules/schema';
import {
  DOMAIN_PROVIDER_BRANDS,
  getDomainProviderLabel,
} from '@/entities/domain/ui/constants/provider';

import { cn } from '@/shared/libs/tailwind/cn';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { useEmit } from '../../-models/events';

interface DomainIdentityProps {
  domain: DomainCard;
  size?: 'sm' | 'md';
}

/** Provider mark, hostname and description — the same row in every view. */
export function DomainIdentity(props: DomainIdentityProps) {
  const { domain, size = 'md' } = props;
  const t = useDevetekTranslations();
  const emit = useEmit();

  const ProviderIcon = DOMAIN_PROVIDER_BRANDS[domain.provider].icon;
  const hostname = domain.domain.hostname;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl border bg-background/75',
          size === 'md' ? 'size-11' : 'size-9',
        )}
        aria-hidden
      >
        <ProviderIcon className={size === 'md' ? 'size-6' : 'size-5'} />
      </span>

      <div className="min-w-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            emit('@domain-dns/open--details', domain.id);
          }}
          className={cn(
            'block max-w-full truncate text-left font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
            size === 'md' ? 'text-base' : 'text-sm',
          )}
          title={t('page.domain.openDetails', { domain: hostname })}
        >
          {hostname}
        </button>
        <p className="truncate text-xs text-muted-foreground">
          {domain.description || t('page.domain.noDescription')}
        </p>
      </div>
    </div>
  );
}

/** Which service answers DNS for the domain. */
export function DomainProviderPill(props: {
  domain: DomainCard;
  className?: string;
}) {
  const { className, domain } = props;
  const t = useDevetekTranslations();

  const label = getDomainProviderLabel(
    domain.provider,
    t('page.domain.providerUnknown'),
  );

  return (
    <StatusPill
      tone="info"
      icon={DOMAIN_PROVIDER_BRANDS[domain.provider].icon}
      label={label}
      className={className}
    />
  );
}

/** Who can use the domain, in the same pill language as the provider. */
export function DomainAccessPill(props: {
  domain: DomainCard;
  className?: string;
}) {
  const { className, domain } = props;
  const t = useDevetekTranslations();

  if (domain.ownership.team) {
    return (
      <StatusPill
        tone="neutral"
        icon={BuildingIcon}
        label={t('page.domain.card.team', { name: domain.ownership.team })}
        className={className}
      />
    );
  }

  return (
    <StatusPill
      tone="neutral"
      icon={UserIcon}
      label={t('page.domain.card.personal')}
      className={className}
    />
  );
}
