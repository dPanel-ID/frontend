import type { DTOs } from '@/shared/api';

import type { ChatAction, ChatEntry, ChatSecret } from '../rules/types';

const STORED_ACTION_STATUSES: ReadonlyArray<ChatAction['status']> = [
  'pending',
  'running',
  'executed',
  'rejected',
  'failed',
  'expired',
];

/**
 * Maps the changes a stored answer proposed to approval cards, so pending
 * ones can still be decided after the panel was closed or reloaded.
 */
export function toChatActions(
  actions: DTOs.AiConversationActionV1[] | null | undefined,
): ChatAction[] {
  return (actions ?? [])
    .filter((action) => action.action_id)
    .map((action) => {
      const status = STORED_ACTION_STATUSES.find(
        (known) => known === action.status,
      );
      return {
        id: action.action_id ?? '',
        tool: action.tool ?? '',
        summary: action.summary ?? '',
        status: status ?? 'expired',
        secretInputs: (action.secret_inputs ?? [])
          .filter((input) => input.name)
          .map((input) => ({
            name: input.name ?? '',
            label: input.label || input.name || '',
          })),
      };
    });
}

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
    .map((message, index) => {
      const actions = toChatActions(message.actions);
      return {
        id: message.id || `stored-${index}`,
        role: message.role as ChatEntry['role'],
        content: message.content ?? '',
        tools: message.tools ?? [],
        status: 'done' as const,
        ...(actions.length > 0 ? { actions } : {}),
      };
    });
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
