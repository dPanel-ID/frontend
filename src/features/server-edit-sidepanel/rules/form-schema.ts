import { z } from 'zod';

const port = z
  .number({ message: 'Use a port between 1 and 65535' })
  .int()
  .min(1, 'Use a port between 1 and 65535')
  .max(65535, 'Use a port between 1 and 65535');

export const schemaServerEdit = z.object({
  serverAddress: z.string().trim().min(1, 'Required'),
  ssh: z.object({
    username: z.string().trim().min(1, 'Required'),
    port,
  }),
  agent: z.object({
    httpPort: port,
    domain: z.string().trim().optional(),
  }),
});

export type SchemaServerEdit = z.infer<typeof schemaServerEdit>;
