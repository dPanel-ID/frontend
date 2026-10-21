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
              label={t('page.sshKeys.table.created')}
              value={getDistanceFromNow(sshKey.createdAt, locale)}
            />
          )}
          {sshKey.updatedAt && (
            <Fact
              icon={Clock3Icon}
              label={t('common.terms.lastUpdated')}
              value={getDistanceFromNow(sshKey.updatedAt, locale)}
            />
          )}
        </div>
      </div>

      <SshKeyActions handlers={handlers} layout="icons" />
    </article>
  );
}

interface FactProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function Fact(props: FactProps) {
  const { icon: Icon, label, value } = props;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">{label}: </span>
      <span className="truncate font-medium text-primary/80">{value}</span>
    </span>
  );
}
