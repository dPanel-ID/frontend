import {
  LS_ORGANIZATION_ID,
  normalizeWorkspaceOrganizationId,
} from '@/shared/libs/api-client/config';

import { CONVERSATION_ID_PATTERN } from '../rules/types';

const KEY_PREFIX = 'dpanel.ai.conversation.';

/** Conversations are bound to a workspace, so the last one is remembered per workspace. */
function storageKey() {
  const workspace =
    normalizeWorkspaceOrganizationId(readLocalStorage(LS_ORGANIZATION_ID)) ??
    'personal';
  return KEY_PREFIX + workspace;
}

export function readLastConversationId(): string | null {
  const value = readLocalStorage(storageKey());
  return value && CONVERSATION_ID_PATTERN.test(value) ? value : null;
}

export function writeLastConversationId(conversationId: string | null) {
  try {
    if (conversationId) {
      window.localStorage.setItem(storageKey(), conversationId);
    } else {
      window.localStorage.removeItem(storageKey());
    }
  } catch {
    // Storage can be unavailable (private mode); the chat still works.
  }
}

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
