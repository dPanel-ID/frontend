import {
  AppWindowIcon,
  DatabaseIcon,
  Globe2Icon,
  KeyRoundIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatCard } from '../../-presentation';

export default function SummaryGrid(props: {
  totalServers?: number;
  totalApplications?: number;
  totalLoadBalancers?: number;
  totalDomains?: number;
  totalDatabases?: number;
  totalSshKeys?: number;
  readyServers: number;
  riskyResources: number;
}) {
  const t = useDevetekTranslations('page.dashboard.summary');
  const {
    readyServers,
    riskyResources,
    totalApplications,
    totalDatabases,
    totalDomains,
    totalLoadBalancers,
    totalServers,
    totalSshKeys,
  } = props;

  const stats = [
    {
      label: t('servers'),
      value: totalServers,
      helper: t('readyServers', { count: readyServers }),
      icon: ServerIcon,
      to: '/servers',
      tone: 'blue' as const,
    },
    {
      label: t('applications'),
      value: totalApplications,
      helper: t('attention', { count: riskyResources }),
      icon: AppWindowIcon,
      to: '/applications',
      tone: riskyResources > 0 ? ('amber' as const) : ('green' as const),
    },
    {
      label: t('loadBalancers'),
      value: totalLoadBalancers,
      helper: t('trafficEntry'),
      icon: NetworkIcon,
      to: '/backend/load-balancers',
      tone: 'violet' as const,
    },
    {
      label: t('domains'),
      value: totalDomains,
      helper: t('dnsZones'),
      icon: Globe2Icon,
      to: '/backend/domain',
      tone: 'green' as const,
    },
    {
      label: t('databases'),
      value: totalDatabases,
      helper: t('statefulData'),
      icon: DatabaseIcon,
      to: '/backend/database',
      tone: 'blue' as const,
    },
    {
      label: t('secrets'),
      value: totalSshKeys,
      helper: t('sshKeys'),
      icon: KeyRoundIcon,
      to: '/backend/secret-managers/ssh-key',
      tone: 'slate' as const,
    },
  ];

  return (
    <section
      aria-label={t('ariaLabel')}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}
