import z from 'zod';

export type MigrateOwnershipForm = z.output<typeof schemaMigrateOwnershipForm>;
export const schemaMigrateOwnershipForm = z.object({
  /** "personal" or a Casdoor workspace group ID. */
  target: z.string().min(1),
  includeDependencies: z.boolean(),
});
