import { Link } from '@tanstack/react-router';
import {
  AppWindowIcon,
  CloudIcon,
  DatabaseIcon,
  Globe2Icon,
  KeyRoundIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';
import type { StatTileTone } from '@/shared/presentation/molecules/StatTile';

export interface EstateCount {
  value?: number;
  /** The count could not be read, so it is shown as unknown rather than loading. */
  unavailable?: boolean;
  hint?: string;
  tone?: StatTileTone;
}

export interface EstateTilesProps {
  servers: EstateCount;
  applications: EstateCount;
  loadBalancers: EstateCount;
  cloudProjects: EstateCount;
  domains: EstateCount;
  databases: EstateCount;
  sshKeys: EstateCount;
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
  {
    key: 'cloudProjects',
    icon: CloudIcon,
    to: '/backend/cloud-projects',
    search: { page: 1, viewMode: 'auto' },
  },
  { key: 'domains', icon: Globe2Icon, to: '/backend/domain' },
  { key: 'databases', icon: DatabaseIcon, to: '/backend/database' },
  {
    key: 'sshKeys',
    icon: KeyRoundIcon,
    to: '/backend/secret-managers/ssh-key',
  },
];

export default function EstateTiles(props: EstateTilesProps) {
  const t = useDevetekTranslations('page.dashboard.estate');

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-7">
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
              // A count that will never arrive reads as unknown; one still on
              // its way keeps the shimmer.
              value={count.unavailable ? '—' : (count.value ?? 0)}
              hint={count.hint}
              loading={!count.unavailable && count.value == null}
              className="h-full transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5"
            />
          </Link>
        );
      })}
    </div>
  );
}
