import { z } from 'zod';

/** A value an approved change generated, shown to the user once. */
export const ChatSecretSchema = z.object({
  name: z.string(),
  label: z.string(),
  value: z.string(),
});

export type ChatSecret = z.infer<typeof ChatSecretSchema>;

/** A secret value a change needs, typed by the user when approving. */
export const ChatSecretInputSchema = z.object({
  name: z.string(),
  label: z.string(),
});

export type ChatSecretInput = z.infer<typeof ChatSecretInputSchema>;

/** A change the assistant proposed, waiting for the user's decision. */
export const ChatActionSchema = z.object({
  id: z.string(),
  tool: z.string(),
  summary: z.string(),
  status: z.enum([
    'pending',
    'deciding',
    'running',
    'executed',
    'rejected',
    'failed',
    'expired',
  ]),
  /**
   * Secrets the change generated, such as database passwords. Kept in
   * memory only: the server sends them once and they are never persisted.
   */
  secrets: z.array(ChatSecretSchema).optional(),
  /** Values the user types when approving; sent with the approval only. */
  secretInputs: z.array(ChatSecretInputSchema).optional(),
});

export type ChatAction = z.infer<typeof ChatActionSchema>;

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
  /** Changes proposed in this answer. */
  actions: z.array(ChatActionSchema).optional(),
});

export type ChatEntry = z.infer<typeof ChatEntrySchema>;

/** The message composer's input. Mirrors the backend limit. */
export const ChatInputSchema = z.string().trim().min(1).max(8000);

export const CONVERSATION_ID_PATTERN = /^aic_[0-9a-v]{20}$/;
