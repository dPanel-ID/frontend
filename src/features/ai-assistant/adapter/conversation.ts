import type { DTOs } from '@/shared/api';

import type { ChatEntry } from '../rules/types';

/** Maps stored messages to chat entries; tolerates missing fields. */
export function toChatEntries(
  detail: DTOs.AiConversationDetailV1 | null | undefined,
): ChatEntry[] {
  const messages = detail?.messages ?? [];

  return messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim() !== '',
    )
    .map((message, index) => ({
      id: message.id || `stored-${index}`,
      role: message.role as ChatEntry['role'],
      content: message.content ?? '',
      tools: message.tools ?? [],
      status: 'done' as const,
    }));
}
