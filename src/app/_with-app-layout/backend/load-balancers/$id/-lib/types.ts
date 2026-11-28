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
  /** Address mode of an application route: as stored, as chosen in the
   * editor, or empty to let the API choose. */
  addressMode?: ApplicationAddressMode;
  /** Stored custom upstreams of an application route, sent back on save. */
  applicationUpstreams?: ApplicationUpstream[];
  /** Where an application route went at the last apply (read-only). */
  resolvedUpstreams?: ApplicationUpstream[];
  applicationId?: string;
  destination: string;
  href?: string;
  id: string;
  kind: 'application' | 'address' | 'static' | 'redirect';
  /** Sends a redirect that goes to the destination exactly, without the path. */
  redirectDropPath?: boolean;
  match: string;
  order: number;
  port: string;
  protocol: string;
}

export interface RuntimeConfigDraft {
  cloudflareProxied: boolean;
  /** Gateway limits (config.http); an empty field keeps the default. */
  http: HttpSettingsDraft;
  protocol: string;
  sslEnabled: boolean;
}

export interface HttpSettingsDraft {
  healthInterval: string;
  healthPath: string;
  healthTimeout: string;
  readBodyTimeout: string;
  requestBodyMax: string;
  responseTimeout: string;
}
