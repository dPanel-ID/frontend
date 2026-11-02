import type z from 'zod';

import { AdapterOsServiceFromDto } from '@/entities/os-service/adapter';
import { createAdapter } from '@/entities/shared/lib/createAdapter';
import { resolveExecutionErrorMessage } from '@/entities/shared/lib/resolveExecutionErrorMessage';
import { personOf } from '@/entities/user/lib/person';

import type { DTOs } from '@/shared/api';
import type { KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { CicdDeployment } from '../rules/schema';
import { schemaCicdDeployment } from '../rules/schema';

export const toCicdDeployment = createAdapter<DTOs.DeployV1, CicdDeployment>(
  (raw) => {
    const machineId = String(raw.machine_id ?? raw.machine?.id ?? 'unknown');
    const hostName =
      raw.machine?.hostname ||
      raw.machine?.address ||
      (machineId !== 'unknown' ? `Server ${machineId}` : 'Unknown server');

    return schemaCicdDeployment.parse({
      id: String(raw.id ?? 'unknown'),
      pointerIds: {
        application: String(raw.application_id ?? 'unknown'),
        artifact: String(raw.artifact_id ?? 'unknown'),
        machine: machineId,
      },
      state: {
        status: raw.installer_status,
        message: resolveExecutionErrorMessage(raw),
      },
      timestamp: {
        created: raw.created_at ?? new Date(0).toISOString(),
        updated: raw.updated_at ?? raw.created_at ?? new Date(0).toISOString(),
      },
      serverSnapshot: {
        id: machineId,
        hostName,
      },
      osService: raw.service?.name
        ? {
            serviceName: raw.service.name,
            serviceState: AdapterOsServiceFromDto.toState(
              raw.service.state,
            ).unwrap(),
          }
        : undefined,
      deployer: personOf(raw.user),
    } satisfies KeysOnlyDeep<z.input<typeof schemaCicdDeployment>>);
  },
);
