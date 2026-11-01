import { useState } from 'react';

import {
  ListTreeIcon,
  RouteIcon,
  SlidersHorizontalIcon,
  TerminalSquareIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/presentation/atoms/Tabs';
import { LoadBalancerLogs } from '@/widgets/load-balancer-logs';

import type {
  IconComponent,
  LoadBalancerTab,
  RawLoadBalancerDetailsDto,
} from '../-lib/types';

import { ConfigTab } from './ConfigTab';
import { GraphTab } from './GraphTab';
import { UpstreamsTab } from './UpstreamsTab';

export function DetailTabs(props: {
  details: LoadBalancerDetails;
  rawDetails?: RawLoadBalancerDetailsDto;
  onDetailsRefresh: () => void;
}) {
  const { details, onDetailsRefresh, rawDetails } = props;
  const t = useDevetekTranslations();
  const [activeTab, setActiveTab] = useState<LoadBalancerTab>('graph');
  const tabItems: Array<{
    icon: IconComponent;
    label: string;
    value: LoadBalancerTab;
  }> = [
    {
      value: 'graph',
      icon: RouteIcon,
      label: t('page.loadBalancersDetail.tabs.graph'),
    },
    {
      value: 'upstreams',
      icon: ListTreeIcon,
      label: t('page.loadBalancersDetail.tabs.upstreams'),
    },
    {
      value: 'logs',
      icon: TerminalSquareIcon,
      label: t('page.loadBalancersDetail.tabs.logs'),
    },
    {
      value: 'config',
      icon: SlidersHorizontalIcon,
      label: t('page.loadBalancersDetail.tabs.config'),
    },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as LoadBalancerTab)}
      className="grid gap-4"
    >
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border bg-card/40 p-1">
        {tabItems.map((tab) => (
          <DetailTabTrigger key={tab.value} {...tab} />
        ))}
      </TabsList>

      <TabsContent value="graph" className="mt-0">
        <GraphTab details={details} />
      </TabsContent>
      <TabsContent value="upstreams" className="mt-0">
        <UpstreamsTab details={details} onSaved={onDetailsRefresh} />
      </TabsContent>
      <TabsContent value="logs" className="mt-0">
        {/* The same request log as the application's Logs tab. */}
        <LoadBalancerLogs
          loadBalancerId={String(details.id)}
          domain={details.domain.fqdn}
        />
      </TabsContent>
      <TabsContent value="config" className="mt-0">
        <ConfigTab
          details={details}
          rawDetails={rawDetails}
          onSaved={onDetailsRefresh}
        />
      </TabsContent>
    </Tabs>
  );
}

export function DetailTabTrigger(props: {
  icon: IconComponent;
  label: string;
  value: LoadBalancerTab;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <TabsTrigger
      value={value}
      className="h-9 flex-none gap-2 px-3 text-sm font-semibold data-[state=active]:shadow-none"
    >
      <Icon className="size-4" />
      {label}
    </TabsTrigger>
  );
}
