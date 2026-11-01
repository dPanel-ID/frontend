import type { ComponentType } from 'react';

import type { LucideProps } from 'lucide-react';

import type { DTOs } from '@/shared/api';

export type IconComponent = ComponentType<LucideProps>;
export type LoadBalancerTab = 'graph' | 'upstreams' | 'logs' | 'config';
export type AddBackendMode = 'application' | 'address';
export type RawLoadBalancerDetailsDto = DTOs.RouterV1 | DTOs.LoadBalancerV2;

export interface UpstreamDraft {
  applicationId?: string;
  destination: string;
  href?: string;
  id: string;
  kind: 'application' | 'address' | 'static';
  match: string;
  order: number;
  port: string;
  protocol: string;
}

export interface RuntimeConfigDraft {
  cloudflareProxied: boolean;
  protocol: string;
  sslEnabled: boolean;
}
