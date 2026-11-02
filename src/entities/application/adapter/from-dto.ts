import type z from 'zod';

import { createAdapter } from '@/entities/shared/lib/createAdapter';
import {
  resolveOwnershipOwner,
  resolveOwnershipPerson,
} from '@/entities/shared/lib/resolveOwnershipOwner';
import { resolveOwnershipTeamId } from '@/entities/shared/lib/resolveOwnershipTeamId';

import type { DTOs } from '@/shared/api';
import type { KeysOnly, KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { ApplicationCard, ApplicationDetail } from '../rules/schema';
import {
  schemaApplicationCard,
  schemaApplicationDetail,
} from '../rules/schema';

import {
  ctorConfigDefs,
  ctorDeploymentTargets,
  ctorIdentity,
  ctorState,
} from './ctors';

export const toApplicationCard = createAdapter<
  DTOs.ApplicationV1,
  ApplicationCard
>((raw) => {
  return schemaApplicationCard.parse({
    id: String(raw.id),
    identity: ctorIdentity(raw),
    configDefs: ctorConfigDefs(raw),
    state: ctorState(raw),
    ownership: {
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
      owner: resolveOwnershipOwner(raw),
      ...resolveOwnershipPerson(raw),
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
    additionalInfo: {
      domain: raw.domain,
      workdir:
        raw.workdir ??
        raw.app_definition?.build?.target?.machine?.workdir ??
        raw.app_definition?.build?.target?.machine?.workir,
      defaultBranch: raw.default_branch,
      repoUrl: raw.repo_url,
      latestArtifactBranch: raw.artifacts?.[0]?.branch,
      deploymentCount: raw.deploys?.length ?? 0,
      servers: (raw.deploys ?? [])
        .filter((d) => d.machine?.id != null)
        .map((d) => ({
          id: String(d.machine!.id),
          name: d.machine!.hostname,
          address: d.machine!.address,
          deployStatus: d.installer_status,
          serviceName: d.service?.name,
          serviceState: d.service?.state,
          serviceInstallerStatus: d.service?.installer_status,
        })),
    },
  } satisfies KeysOnlyDeep<z.input<typeof schemaApplicationCard>>);
});

export const toApplicationDetail = createAdapter<
  DTOs.ApplicationV1,
  ApplicationDetail
>((raw) => {
  return schemaApplicationDetail.parse({
    id: String(raw.id),
    identity: ctorIdentity(raw),
    configDefs: ctorConfigDefs(raw),
    deploymentTargets: ctorDeploymentTargets(raw),
    ownership: {
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
      owner: resolveOwnershipOwner(raw),
      ...resolveOwnershipPerson(raw),
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
  } satisfies KeysOnly<z.input<typeof schemaApplicationDetail>>);
});
