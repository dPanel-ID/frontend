import { z } from 'zod';

import { schemaEnvText } from '@/entities/application/rules/schema/env-text';

export const schemaBuildStep = z.object({
  name: z.string().min(1, 'Step name is required'),
  commandText: z.string(), // newline-separated commands
  archive: z.array(z.string()).optional(), // pass-through, not editable
});

export const schemaApplicationBuildEdit = z.object({
  steps: z.array(schemaBuildStep),
  envText: schemaEnvText,
});

export type SchemaApplicationBuildEdit = z.infer<
  typeof schemaApplicationBuildEdit
>;
export type SchemaBuildStep = z.infer<typeof schemaBuildStep>;
