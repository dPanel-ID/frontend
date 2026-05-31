import { z } from 'zod';

export const formSchema = z.object({
  organization_id: z //
    .string()
    .min(1, 'Organization is required'),
  user_id: z //
    .string()
    .min(1, 'Select a user first'),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
});

export type FormSchema = z.infer<typeof formSchema>;
