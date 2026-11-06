import type { ServerCard as ServerCardModel } from '@/entities/server/rules/schema';

import type { AdminServerStats } from '@/shared/api/admin.server.find';

// The servers page's own card, read-only: an administrator sees the same
// card the owner sees, with live usage, but no actions.
import { WorkspaceBadge } from '../-presentation/WorkspaceBadge';
import ServerCard from '../../../../servers/-view/ServerList/ServerCard';

interface AdminServerCardsProps {
  servers: ServerCardModel[];
  /** Keyed by server ID. */
  stats: Record<string, AdminServerStats>;
}

export default function AdminServerCards(props: AdminServerCardsProps) {
  const { servers, stats } = props;

  return (
    <div className="flex flex-col gap-3">
      {servers.map((server) => {
        const isTeam = Boolean(
          server.ownership.teamId || server.ownership.team,
        );
        return (
          <ServerCard
            key={server.id}
            server={server}
            applicationCount={stats[server.id]?.applications ?? 0}
            loadBalancerCount={stats[server.id]?.load_balancers ?? 0}
            badge={
              <WorkspaceBadge
                type={isTeam ? 'team' : 'personal'}
                name={server.ownership.team}
                id={server.ownership.teamId}
              />
            }
          />
        );
      })}
    </div>
  );
}
