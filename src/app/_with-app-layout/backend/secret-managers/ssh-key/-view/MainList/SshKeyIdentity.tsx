import { BuildingIcon, KeyRoundIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { sshKeyAlgorithmLabel } from '../../-lib/describe-ssh-key';
import type { SshKeyCard } from '../../-lib/describe-ssh-key';

interface SshKeyIdentityProps {
  sshKey: SshKeyCard;
  size?: 'sm' | 'md';
  onClickName: () => void;
}

/** Icon tile, name and what the key is — the same row in every view. */
export function SshKeyIdentity(props: SshKeyIdentityProps) {
  const { onClickName, size = 'md', sshKey } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl border',
          size === 'md' ? 'size-11' : 'size-9',
          FLOW_ACCENTS.sky.icon,
        )}
        aria-hidden
      >
        <KeyRoundIcon className={size === 'md' ? 'size-5' : 'size-4'} />
      </span>

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
          title={sshKey.name}
        >
          {sshKey.name}
        </button>
        <p className="truncate text-xs text-muted-foreground">
          {describeKey(sshKey, t)}
        </p>
      </div>
    </div>
  );
}

interface SshKeyAccessPillProps {
  sshKey: SshKeyCard;
  className?: string;
}

/** Who can use the key, in the same pill language as server status. */
export function SshKeyAccessPill(props: SshKeyAccessPillProps) {
  const { className, sshKey } = props;
  const t = useDevetekTranslations();

  if (sshKey.sharedWithTeam) {
    return (
      <StatusPill
        tone="info"
        icon={BuildingIcon}
        label={t('page.sshKeys.card.team', {
          name: sshKey.teamName ?? t('common.terms.team'),
        })}
        className={className}
      />
    );
  }

  return (
    <StatusPill
      tone="neutral"
      icon={UserIcon}
      label={t('page.sshKeys.card.personal')}
      className={className}
    />
  );
}

type Translate = ReturnType<typeof useDevetekTranslations>;

/**
 * "Ed25519 · pat@example.com". The algorithm is what a person can act on; the
 * secret type ("ssh-key") only appears for a key whose algorithm is unknown.
 */
export function describeKey(sshKey: SshKeyCard, t: Translate) {
  return [
    sshKeyAlgorithmLabel(sshKey) ??
      sshKey.type ??
      t('page.sshKeys.card.noType'),
    sshKey.comment,
  ]
    .filter(Boolean)
    .join(' · ');
}
