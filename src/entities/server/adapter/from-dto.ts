import type z from 'zod';

import { createAdapter } from '@/entities/shared/lib/createAdapter';
import { resolveExecutionErrorMessage } from '@/entities/shared/lib/resolveExecutionErrorMessage';
import { resolveOwnershipOwner } from '@/entities/shared/lib/resolveOwnershipOwner';
import { resolveOwnershipTeamId } from '@/entities/shared/lib/resolveOwnershipTeamId';

import type { DTOs } from '@/shared/api';
import type { KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { ServerCard, ServerDetail, ServerMinimal } from '../rules/schema';
import {
  schemaServerCard,
  schemaServerDetail,
  schemaServerMinimal,
} from '../rules/schema';

import { ctorCloud, ctorCreator, ctorSpecs } from './ctors';

export const toMinimal = createAdapter<DTOs.MachineV1, ServerMinimal>((raw) =>
  schemaServerMinimal.parse({
    id: String(raw.id),
    hostname: raw.hostname,
  } satisfies KeysOnlyDeep<z.input<typeof schemaServerMinimal>>),
);

export const toServerCard = createAdapter<DTOs.MachineV1, ServerCard>((raw) =>
  schemaServerCard.parse({
    id: String(raw.id),
    agent: {
      version: raw.agent_version ?? raw.agent?.version,
      domain: raw.domain,
      httpPort: raw.http_port ? Number(raw.http_port) : undefined,
    },
    cloud: ctorCloud(raw),
    host: {
      address: raw.address ?? raw.domain,
      name: raw.hostname,
    },
    ownership: {
      owner: resolveOwnershipOwner(raw),
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
    },
    creator: ctorCreator(raw),
    ssh: {
      port: raw.ssh_port ? Number(raw.ssh_port) : undefined,
      defaultUser: raw.default_user,
    },
    state: {
      errorDetail: raw.error_detail,
      message: resolveExecutionErrorMessage(raw),
      status: raw.status,
    },
    system: {
      name: raw.distributor ?? raw.os_family,
      version: raw.version ?? raw.os_codename,
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
  } satisfies KeysOnlyDeep<z.input<typeof schemaServerCard>>),
);

export const toServerDetail = createAdapter<DTOs.MachineV1, ServerDetail>(
  (raw) =>
    schemaServerDetail.parse({
      id: String(raw.id),
      agent: {
        version: raw.agent_version ?? raw.agent?.version,
        domain: raw.domain,
        httpPort: raw.http_port ? Number(raw.http_port) : undefined,
      },
      hostGroupId: raw.host_group_id || undefined,
      cloud: ctorCloud(raw),
      host: {
        address: raw.address ?? raw.domain,
        name: raw.hostname,
      },
      ownership: {
        owner: resolveOwnershipOwner(raw),
        team: raw.organization?.name,
        teamId: resolveOwnershipTeamId(raw),
      },
      creator: ctorCreator(raw),
      secret: {
        id: raw.secret_id ? String(raw.secret_id) : undefined,
      },
      ssh: {
        port: raw.ssh_port ? Number(raw.ssh_port) : undefined,
        defaultUser: raw.default_user,
      },
      state: {
        errorDetail: raw.error_detail,
        message: resolveExecutionErrorMessage(raw),
        status: raw.status,
      },
      system: {
        name: raw.distributor ?? raw.os_family,
        version: raw.version ?? raw.os_codename,
      },
      timestamp: {
        created: raw.created_at,
        updated: raw.updated_at,
      },
      specs: ctorSpecs(raw),
    } satisfies KeysOnlyDeep<z.input<typeof schemaServerDetail>>),
);
