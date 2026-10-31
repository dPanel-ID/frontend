import { z } from 'zod';

/** One visible line of the conversation. */
export const ChatEntrySchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  /** dPanel tools the assistant used to produce this answer. */
  tools: z.array(z.string()),
  status: z.enum(['done', 'pending', 'failed']),
  /** Safe, user-facing reason when status is failed. */
  error: z.string().optional(),
  /** The user message to resend when a failed answer is retried. */
  retryText: z.string().optional(),
});

export type ChatEntry = z.infer<typeof ChatEntrySchema>;

/** The message composer's input. Mirrors the backend limit. */
export const ChatInputSchema = z.string().trim().min(1).max(8000);

export const CONVERSATION_ID_PATTERN = /^aic_[0-9a-v]{20}$/;
