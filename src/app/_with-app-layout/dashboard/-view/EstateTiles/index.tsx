import { Link } from '@tanstack/react-router';
import {
  AppWindowIcon,
  Globe2Icon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';
import type { StatTileTone } from '@/shared/presentation/molecules/StatTile';

export interface EstateCount {
  value?: number;
  hint?: string;
  tone?: StatTileTone;
}

export interface EstateTilesProps {
  servers: EstateCount;
  applications: EstateCount;
  loadBalancers: EstateCount;
  domains: EstateCount;
}

interface TileSpec {
  key: keyof EstateTilesProps;
  icon: LucideIcon;
  to: string;
  search?: Record<string, unknown>;
}

/**
 * What this workspace contains, as the product's standard stat tiles.
 *
 * Same block as the servers list uses above its table: separate bordered
 * tiles with an icon, a count and a status line, rather than a layout of
 * this page's own invention.
 */
const TILES: TileSpec[] = [
  { key: 'servers', icon: ServerIcon, to: '/servers' },
  { key: 'applications', icon: AppWindowIcon, to: '/applications' },
  { key: 'loadBalancers', icon: NetworkIcon, to: '/backend/load-balancers' },
  { key: 'domains', icon: Globe2Icon, to: '/backend/domain' },
];

export default function EstateTiles(props: EstateTilesProps) {
  const t = useDevetekTranslations('page.dashboard.estate');

  // One row of four on wide screens, matching the servers list. Cloud
  // projects and SSH keys have their own panels and pages, so the estate
  // shows what runs: servers, applications, load balancers and domains.
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {TILES.map(({ icon, key, search, to }) => {
        const count = props[key];

        return (
          <Link
            key={key}
            to={to}
            search={search}
            className="min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            <StatTile
              icon={icon}
              tone={count.tone ?? 'neutral'}
              label={t(key)}
              value={count.value ?? 0}
              hint={count.hint}
              loading={count.value == null}
              className="h-full transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5"
            />
          </Link>
        );
      })}
    </div>
  );
}
