import type { SchemaLoadBalancerParts } from '@/entities/load-balancer/rules/schema';

export interface L7RuleRowProps {
  upstreamRule: SchemaLoadBalancerParts.L7RuleUpstream;
}

export interface SubheadingProps {
  upstreamType: 'proxy-pass' | 'proxy-pass-app' | 'static-file' | 'redirect';
  trafficPercentage: string;
  priority: number;
}
