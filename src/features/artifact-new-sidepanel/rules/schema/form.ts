import z from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

export const schemaArtifactNewForm = z.object({
  appConfigFile: z.string().min(1, { error: 'formErrors.required' }),
  fromBranch: z.string().min(1, { error: 'formErrors.required' }),
  workerId: SchemaCommon.unitId.min(1, { error: 'formErrors.required' }),
});
