import dayjs from 'dayjs';
import { CalendarIcon, Clock3Icon, UserIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';

import type { SshKeyCard } from '../../-lib/describe-ssh-key';

import { SshKeyActions } from './SshKeyActions';
import { SshKeyAccessPill, SshKeyIdentity } from './SshKeyIdentity';
import type { SshKeyHandlers } from './useSshKeyHandlers';

interface SshKeyRowProps {
  sshKey: SshKeyCard;
  handlers: SshKeyHandlers;
}

/** The desktop row: identity, who can use it, and when it last changed. */
export function SshKeyRow(props: SshKeyRowProps) {
  const { handlers, sshKey } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <article className="group grid gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="grid min-w-0 gap-3">
        <SshKeyIdentity sshKey={sshKey} onClickName={handlers.openDetails} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SshKeyAccessPill sshKey={sshKey} />

          {sshKey.ownerName && (
            <Fact
              icon={UserIcon}
              label={t('common.terms.owner')}
              value={sshKey.ownerName}
            />
          )}
          {sshKey.createdAt && (
            <Fact
              icon={CalendarIcon}
              label={t('common.terms.createdAt')}
              value={getDistanceFromNow(sshKey.createdAt, locale)}
              showLabel
            />
          )}
          {/* A key that was never edited carries the same two timestamps, and
              two identical dates in a row read as a rendering mistake. */}
          {sshKey.updatedAt && wasEdited(sshKey) && (
            <Fact
              icon={Clock3Icon}
              label={t('common.terms.lastUpdated')}
              value={getDistanceFromNow(sshKey.updatedAt, locale)}
              showLabel
            />
          )}
        </div>
      </div>

      <SshKeyActions handlers={handlers} layout="icons" />
    </article>
  );
}

/** True when the key changed after it was created, give or take a minute. */
function wasEdited(sshKey: SshKeyCard) {
  if (!sshKey.createdAt || !sshKey.updatedAt) return true;
  return (
    Math.abs(dayjs(sshKey.updatedAt).diff(sshKey.createdAt, 'minute')) >= 1
  );
}

interface FactProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Renders the label beside the value instead of only for screen readers. */
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
