import { z } from 'zod';

/**
 * Optional name of a server added with the one-line agent install command:
 * letters, digits and hyphens, starting with a letter and ending with a
 * letter or digit, up to 63 characters (the API's hostname rule). Empty
 * means the API picks a name until the agent reports the machine's own.
 */
export const schemaAgentServerName = z
  .string()
  .trim()
  .toLowerCase()
  .max(63)
  .regex(/^([a-z][a-z0-9-]{0,61}[a-z0-9])?$/);

export type AgentServerName = z.output<typeof schemaAgentServerName>;
