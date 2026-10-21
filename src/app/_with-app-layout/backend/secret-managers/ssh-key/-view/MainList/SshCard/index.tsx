import { Clock3Icon } from 'lucide-react';

import { useDevetekLocale } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';

import type { SshKeyCard } from '../../../-lib/describe-ssh-key';
import { SshKeyActions } from '../SshKeyActions';
import { SshKeyAccessPill, SshKeyIdentity } from '../SshKeyIdentity';
import type { SshKeyHandlers } from '../useSshKeyHandlers';

export interface SshCardProps {
  sshKey: SshKeyCard;
  handlers: SshKeyHandlers;
}

/** The grid tile: identity, who can use the key, and when it changed. */
export default function SshCard(props: SshCardProps) {
  const { handlers, sshKey } = props;
  const locale = useDevetekLocale();

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5">
      <SshKeyIdentity
        sshKey={sshKey}
        size="sm"
        onClickName={handlers.openDetails}
      />

      <SshKeyAccessPill sshKey={sshKey} className="self-start" />

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
          <Clock3Icon className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {sshKey.updatedAt
              ? getDistanceFromNow(sshKey.updatedAt, locale)
              : '—'}
          </span>
        </span>
        <SshKeyActions handlers={handlers} layout="menu" />
      </div>
    </article>
  );
}
