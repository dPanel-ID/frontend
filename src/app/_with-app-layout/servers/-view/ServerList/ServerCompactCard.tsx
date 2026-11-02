import type { ReactNode } from 'react';

import {
  BuildingIcon,
  Clock3Icon,
  GlobeIcon,
  TerminalIcon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale } from '@/services/i18n';

import { serverSystemLabel } from '@/entities/server/lib/describeServer';
import type { ServerCard } from '@/entities/server/rules/schema';
import { ServerCreator } from '@/entities/server/ui/ServerCreator';
import { ServerIdentity } from '@/entities/server/ui/ServerIdentity';
import { ServerStatusPill } from '@/entities/server/ui/ServerStatusPill';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import { ServerActions } from './ServerActions';
import type { ServerHandlers } from './useServerHandlers';

interface ServerCompactCardProps {
  server: ServerCard;
  handlers: ServerHandlers;
}

/** The grid tile: identity, status and the facts that tell servers apart. */
export function ServerCompactCard(props: ServerCompactCardProps) {
  const { handlers, server } = props;
  const locale = useDevetekLocale();
  const status = server.state.status;

  return (
    <article
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        status === 'failed' && 'border-red-400/40',
        status === 'progress' && 'border-sky-400/40',
        status === 'deleting' && 'border-dashed border-amber-400/50',
      )}
    >
      <ServerIdentity
        server={server}
        size="md"
        onClickName={handlers.openDetails}
      />

      <ServerStatusPill
        state={server.state}
        onClick={handlers.showStatus}
        className="self-start"
      />

      <dl className="grid gap-1 text-xs">
        <Fact icon={GlobeIcon} value={server.host.address || '-'} />
        <Fact icon={TerminalIcon} value={serverSystemLabel(server) ?? '-'} />
        <Fact
          icon={server.ownership.team ? BuildingIcon : UserIcon}
          value={<OwnerLink ownership={server.ownership} preferTeam />}
        />
        {server.ownership.team && server.creator && (
          <div className="text-muted-foreground">
            <ServerCreator creator={server.creator} />
          </div>
        )}
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[0.7rem] text-muted-foreground">
          <Clock3Icon className="size-3 shrink-0" />
          <span className="truncate">
            {getDistanceFromNow(server.timestamp.updated, locale)}
          </span>
        </span>
        <ServerActions handlers={handlers} layout="menu" />
      </div>
    </article>
  );
}

function Fact(props: { icon: LucideIcon; value: ReactNode }) {
  const { icon: Icon, value } = props;

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <dd className="truncate font-medium text-primary/80">{value}</dd>
    </div>
  );
}
