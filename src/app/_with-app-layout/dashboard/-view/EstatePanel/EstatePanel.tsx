import { Link } from '@tanstack/react-router';
import {
  AppWindowIcon,
  ArrowRightIcon,
  DatabaseIcon,
  Globe2Icon,
  KeyRoundIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import type { EstateStatus } from '../../-lib/stats';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

export interface EstatePanelProps {
  servers: EstateStatus;
  applications: EstateStatus;
  loadBalancers: EstateStatus;
  totalDomains?: number;
  totalDatabases?: number;
  totalSshKeys?: number;
}

/**
 * What the workspace contains. It sits below the status panels because a
 * count is context, not news: each tile reports its own type's health and
 * nothing else's.
 */
export default function EstatePanel(props: EstatePanelProps) {
  const {
    applications,
    loadBalancers,
    servers,
    totalDatabases,
    totalDomains,
    totalSshKeys,
  } = props;
  const t = useDevetekTranslations('page.dashboard.estate');

  return (
    <DashboardSection title={t('title')} description={t('description')}>
      <div
        aria-label={t('ariaLabel')}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <EstateTile
          label={t('servers')}
          value={servers.total}
          helper={statusHelper(servers, t)}
          tone={statusTone(servers)}
          icon={ServerIcon}
          to="/servers"
        />
        <EstateTile
          label={t('applications')}
          value={applications.total}
          helper={statusHelper(applications, t)}
          tone={statusTone(applications)}
          icon={AppWindowIcon}
          to="/applications"
        />
        <EstateTile
          label={t('loadBalancers')}
          value={loadBalancers.total}
          helper={statusHelper(loadBalancers, t)}
          tone={statusTone(loadBalancers)}
          icon={NetworkIcon}
          to="/backend/load-balancers"
        />
        <EstateTile
          label={t('domains')}
          value={totalDomains}
          helper={t('dnsZones')}
          tone="slate"
          icon={Globe2Icon}
          to="/backend/domain"
        />
        <EstateTile
          label={t('databases')}
          value={totalDatabases}
          helper={t('statefulData')}
          tone="slate"
          icon={DatabaseIcon}
          to="/backend/database"
        />
        <EstateTile
          label={t('secrets')}
          value={totalSshKeys}
          helper={t('sshKeys')}
          tone="slate"
          icon={KeyRoundIcon}
          to="/backend/secret-managers/ssh-key"
        />
      </div>
    </DashboardSection>
  );
}

function EstateTile(props: {
  label: string;
  value?: number;
  helper: string;
  icon: LucideIcon;
  to: string;
  tone: Tone;
}) {
  const { helper, icon: Icon, label, to, tone, value } = props;

  return (
    <Link
      to={to}
      className="group min-w-0 rounded-xl border bg-background p-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-primary">
        {label}
      </p>
      {value == null ? (
        <>
          <Shimmer className="mt-1 h-5 w-14" />
          <Shimmer className="mt-1.5 h-3 w-24 max-w-full" />
        </>
      ) : (
        <>
          <p className="mt-1 text-lg font-bold tabular-nums leading-tight text-primary">
            {value}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {helper}
          </p>
        </>
      )}
    </Link>
  );
}

/** "11 ready · 1 failed", naming only the states this type actually has. */
function statusHelper(
  status: EstateStatus,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  if (status.total === 0) return t('none');
  if (!status.counted) return t('statusUnknown');

  const parts: string[] = [];
  if (status.ready > 0) parts.push(t('statusReady', { count: status.ready }));
  if (status.working > 0) {
    parts.push(t('statusWorking', { count: status.working }));
  }
  if (status.attention > 0) {
    parts.push(t('statusAttention', { count: status.attention }));
  }
  if (status.unknown > 0) {
    parts.push(t('statusNoStatus', { count: status.unknown }));
  }

  if (!parts.length) return t('statusUnknown');

  const summary = parts.join(' · ');
  const isSample = status.total != null && status.total > status.counted;

  return isSample
    ? `${summary} · ${t('sampleSuffix', { counted: status.counted })}`
    : summary;
}

/** The tile's own health, never another resource type's. */
function statusTone(status: EstateStatus): Tone {
  if (status.attention > 0) return 'amber';
  if (status.working > 0) return 'blue';
  if (status.counted > 0 && status.ready === status.counted) return 'green';
  return 'slate';
}
