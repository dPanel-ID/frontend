import { z } from 'zod';

import { parseEnvText } from '../../lib/env-text';

/**
 * Environment variables as KEY_NAME="VALUE" lines. The editor lists what
 * is wrong, line by line; this only keeps a wrong text from being saved.
 */
export const schemaEnvText = z
  .string()
  .refine((text) => parseEnvText(text).errors.length === 0, {
    message: 'Fix the environment variable lines first',
  });
