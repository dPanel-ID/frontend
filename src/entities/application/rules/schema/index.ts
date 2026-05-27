import { z } from 'zod';

import { schemaServerMinimal } from '@/entities/server/rules/schema';
import { SchemaCommon } from '@/entities/shared/rules/schema';

import { configDefs, identity, state } from './parts';

export * as SchemaApplicationParts from './parts';

export type ApplicationCard = z.infer<typeof schemaApplicationCard>;
export const schemaApplicationCard = z.object({
  id: SchemaCommon.unitId,
  identity,
  configDefs,
  state,
  ownership: SchemaCommon.ownership,
  timestamp: SchemaCommon.timestamp,
  additionalInfo: z.object({
    domain: z.string().optional(),
    workdir: z.string().optional(),
    defaultBranch: z.string().optional(),
    repoUrl: z.string().optional(),
    latestArtifactBranch: z.string().optional(),
    servers: z.array(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        deployStatus: z.string().optional(),
        serviceName: z.string().optional(),
        serviceState: z.string().optional(),
      }),
    ),
  }),
});

export type ApplicationDetail = z.infer<typeof schemaApplicationDetail>;
export const schemaApplicationDetail = z.object({
  id: SchemaCommon.unitId,
  identity,
  configDefs,
  deploymentTargets: z.array(schemaServerMinimal),
  ownership: SchemaCommon.ownership,
  timestamp: SchemaCommon.timestamp,
});
