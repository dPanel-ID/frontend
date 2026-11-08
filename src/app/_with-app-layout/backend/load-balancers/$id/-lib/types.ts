import type { ComponentType } from 'react';

import type { LucideProps } from 'lucide-react';

import type {
  ApplicationAddressMode,
  ApplicationUpstream,
} from '@/entities/load-balancer/rules/schema/parts';

import type { DTOs } from '@/shared/api';

export type IconComponent = ComponentType<LucideProps>;
export type LoadBalancerTab = 'graph' | 'upstreams' | 'logs' | 'config';
export type AddBackendMode = 'application' | 'address';
export type RawLoadBalancerDetailsDto = DTOs.RouterV1 | DTOs.LoadBalancerV2;

export interface UpstreamDraft {
  /** Stored address mode of an application route; empty for new rows. */
  addressMode?: ApplicationAddressMode;
  /** Stored custom upstreams of an application route, sent back on save. */
  applicationUpstreams?: ApplicationUpstream[];
  /** Where an application route went at the last apply (read-only). */
  resolvedUpstreams?: ApplicationUpstream[];
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
