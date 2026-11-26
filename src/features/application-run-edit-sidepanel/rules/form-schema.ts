import { z } from 'zod';

import { schemaEnvText } from '@/entities/application/rules/schema/env-text';

export const schemaApplicationRunEdit = z.object({
  command: z.string(),
  envText: schemaEnvText,
});

export type SchemaApplicationRunEdit = z.infer<typeof schemaApplicationRunEdit>;
