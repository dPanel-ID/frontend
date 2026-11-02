import type { DTOs } from '@/shared/api';

import type { ChatEntry, ChatSecret } from '../rules/types';

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

/** Keeps the complete secrets of an action result; drops malformed ones. */
export function toChatSecrets(
  secrets: DTOs.AiUserSecretV1[] | null | undefined,
): ChatSecret[] {
  return (secrets ?? [])
    .filter((secret) => secret.name && secret.value)
    .map((secret) => ({
      name: secret.name ?? '',
      label: secret.label || secret.name || '',
      value: secret.value ?? '',
    }));
}
