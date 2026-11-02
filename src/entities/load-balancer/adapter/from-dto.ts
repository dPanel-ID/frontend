import type { z } from 'zod';

import { createAdapter } from '@/entities/shared/lib/createAdapter';
import {
  resolveOwnershipOwner,
  resolveOwnershipPerson,
} from '@/entities/shared/lib/resolveOwnershipOwner';
import { resolveOwnershipTeamId } from '@/entities/shared/lib/resolveOwnershipTeamId';

import type { DTOs } from '@/shared/api';
import type { KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import {
  schemaLoadBalancerCard,
  schemaLoadBalancerDetails,
} from '../rules/schema';
import type { LoadBalancerCard, LoadBalancerDetails } from '../rules/schema';

import {
  ctorConfiguration,
  ctorFeatures,
  ctorGateway,
  ctorState,
  ctorWebserver,
} from './ctors';

type LoadBalancerDto = DTOs.RouterV1 | DTOs.LoadBalancerV2;

export const toLoadBalancerCard = createAdapter<
  LoadBalancerDto,
  LoadBalancerCard
>((raw) => {
  return schemaLoadBalancerCard.parse({
    id: String(raw.id),
    state: ctorState(raw),
    domain: ctorDomain(raw),
    description: raw.name,
    ownership: {
      owner: resolveOwnershipOwner(raw),
      ...resolveOwnershipPerson(raw),
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
    gateway: ctorGateway(raw),
    webserver: ctorWebserver(raw),
    features: ctorFeatures(raw),
    configuration: ctorConfiguration(raw),
  } as KeysOnlyDeep<z.input<typeof schemaLoadBalancerCard>>);
});

export const toLoadBalancerDetails = createAdapter<
  LoadBalancerDto,
  LoadBalancerDetails
>((raw) => {
  return schemaLoadBalancerDetails.parse({
    id: String(raw.id),
    state: ctorState(raw),
    domain: ctorDomain(raw),
    description: raw.name,
    ownership: {
      owner: resolveOwnershipOwner(raw),
      ...resolveOwnershipPerson(raw),
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
    gateway: ctorGateway(raw),
    webserver: ctorWebserver(raw),
    features: ctorFeatures(raw),
    configuration: ctorConfiguration(raw),
  } as KeysOnlyDeep<z.input<typeof schemaLoadBalancerDetails>>);
});

function ctorDomain(raw: LoadBalancerDto) {
  const explicitDomain = raw.domain?.trim();
  if (explicitDomain) return explicitDomain;

  const l4Domain = raw.domain_l4?.trim();
  const l4Port = raw.port_l4?.trim();

  if (l4Domain && l4Port && !l4Domain.includes(':')) {
    return `${l4Domain}:${l4Port}`;
  }

  return l4Domain || 'localhost';
}
