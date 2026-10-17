import { z } from 'zod';

/** /servers/create?mode=manual opens the bring-your-own-server form. */
export const schemaCreateServerSearch = z.object({
  mode: z.enum(['manual']).optional().catch(undefined),
});

export type CreateServerSearch = z.output<typeof schemaCreateServerSearch>;
