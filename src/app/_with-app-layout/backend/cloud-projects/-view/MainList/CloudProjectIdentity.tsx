import { BuildingIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { CloudProviderLogo } from '@/shared/presentation/molecules/CloudProviderLogo';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import type { CloudProjectCard } from '../../-lib/describe-cloud-project';
import {
  cloudStatusKey,
  cloudStatusTone,
  isCloudStatusMoving,
} from '../../-lib/describe-cloud-project';

interface CloudProjectIdentityProps {
  cloudProject: CloudProjectCard;
  size?: 'sm' | 'md';
  onClickName: () => void;
}

/** Provider logo, account name and provider — the same row in every view. */
export function CloudProjectIdentity(props: CloudProjectIdentityProps) {
  const { cloudProject, onClickName, size = 'md' } = props;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <CloudProviderLogo
        provider={cloudProject.provider ?? undefined}
        fallbackLabel={cloudProject.providerLabel}
        className={size === 'md' ? 'size-11' : 'size-9'}
      />

      <div className="min-w-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClickName();
          }}
          className={cn(
            'block max-w-full truncate text-left font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
            size === 'md' ? 'text-base' : 'text-sm',
          )}
          title={cloudProject.name}
        >
          {cloudProject.name}
        </button>
        <p className="truncate text-xs text-muted-foreground">
          {cloudProject.providerLabel}
        </p>
      </div>
    </div>
  );
}

/** The account's connection state, in the product's status language. */
export function CloudProjectStatusPill(props: {
  cloudProject: CloudProjectCard;
  className?: string;
}) {
  const { className, cloudProject } = props;
  const t = useDevetekTranslations();

  return (
    <StatusPill
      tone={cloudStatusTone(cloudProject.status)}
      pulse={isCloudStatusMoving(cloudProject.status)}
      label={t(cloudStatusKey(cloudProject.status))}
      className={className}
    />
  );
}

/** Who can use the account, in the same pill language as the status. */
export function CloudProjectAccessPill(props: {
  cloudProject: CloudProjectCard;
  className?: string;
}) {
  const { className, cloudProject } = props;
  const t = useDevetekTranslations();

  if (cloudProject.sharedWithTeam) {
    return (
      <StatusPill
        tone="info"
        icon={BuildingIcon}
        label={t('page.cloudProjects.card.team', {
          name: cloudProject.teamName ?? t('common.terms.team'),
        })}
        className={className}
      />
    );
  }

  return (
    <StatusPill
      tone="neutral"
      icon={UserIcon}
      label={t('page.cloudProjects.card.personal')}
      className={className}
    />
  );
}
