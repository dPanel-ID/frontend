import type { ComponentType } from 'react';

import type { LucideProps } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import type { ServerModule } from '@/entities/server-modules/model/types';

import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import type { DTOs } from '@/shared/api';

export type Form = UseFormReturn<LoadBalancerCreationFormValues>;

export type IconComponent = ComponentType<LucideProps>;

/** One runtime item the create payload asks the agent to install. */
export type LoadBalancerRuntimeItem = {
  name: string;
  title?: string;
  version?: string;
  category?: string;
  roles: string[];
  installationKey?: string;
  variables: Record<string, unknown>;
  source?: string;
  moduleRef?: string;
  moduleSourceCommit?: string;
};

export type InfrastructureModuleCatalog = {
  repository: DTOs.IACRepositorySummaryV1;
  list: ServerModule[];
};

export const SERVER_PAGE_SIZE = 6;

export const DEFAULT_VALUES: LoadBalancerCreationFormValues = {
  description: '',
  domain: '',
  internalDomainMetadata: {
    id: '',
    subdomain: '',
  },
  serverId: '',
  engine: '',
  lbKind: 'l7',
  features: {
    sslEnabled: true,
    protocol: 'http',
  },
  l7rules: [
    {
      pathMatch: '/*',
      type: 'proxy-pass',
      upstreamsIfProxyPass: [{ address: 'localhost', port: 80 }],
      applicationIdIfProxyPassApp: '',
      addressModeIfProxyPassApp: 'registered',
      customTargetsIfProxyPassApp: [],
    },
  ],
  l4rule: {
    upstreams: [{ address: '127.0.0.1', port: 5432 }],
    service: 'generic',
    listenPort: 15432,
    listenAddress: '0.0.0.0',
    allowFrom: '',
    balance: 'roundrobin',
    idleTimeout: '1h',
  },
};
