import z from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

export const schemaArtifactNewForm = z.object({
  appConfigFile: z.string().min(1, { error: 'formErrors.required' }),
  fromBranch: z.string().min(1, { error: 'formErrors.required' }),
  hostGroupId: SchemaCommon.unitId.optional().or(z.literal('')),
  targetMode: z.enum(['server', 'hostgroup']).default('server'),
  workerId: SchemaCommon.unitId.min(1, { error: 'formErrors.required' }),
});
