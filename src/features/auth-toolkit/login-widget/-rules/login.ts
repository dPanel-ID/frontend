import { z } from 'zod';

export type LoginTraditional = z.output<typeof schemaLoginTraditional>;
export const schemaLoginTraditional = z.object({
  username: z.string().min(1, 'formErrors.usernameMustBeFilled'),
  password: z.string().min(1, 'formErrors.passwordMustBeFilled'),
});
