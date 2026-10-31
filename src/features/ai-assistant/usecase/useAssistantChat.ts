import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiAi } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { toChatEntries } from '../adapter/conversation';
import {
  readLastConversationId,
  writeLastConversationId,
} from '../lib/conversation-storage';
import type { ChatEntry } from '../rules/types';
import { ChatInputSchema } from '../rules/types';

type HistoryState = 'loading' | 'ready';

let entrySequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++entrySequence}`;

/**
 * Drives one assistant conversation: restores the last conversation of the
 * current workspace, sends messages and keeps the visible history.
 */
export default function useAssistantChat() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // The stored conversation is read once, at mount.
  const [initialConversationId] = useState(readLastConversationId);
  const [history, setHistory] = useState<HistoryState>(
    initialConversationId ? 'loading' : 'ready',
  );
  const [isSending, setIsSending] = useState(false);
  const refConversationId = useRef<string | null>(null);

  const rememberConversation = useCallback((id: string | null) => {
    refConversationId.current = id;
    setConversationId(id);
    writeLastConversationId(id);
  }, []);

  useEffect(() => {
    if (!initialConversationId) return;
    let cancelled = false;

    void ApiAi.Conversations.$Id
      .fetchGet({
        conversationId: initialConversationId,
      })
      .then((response) => {
        if (cancelled) return;
        if (response.$status === 'success') {
          refConversationId.current = initialConversationId;
          setConversationId(initialConversationId);
          setEntries(toChatEntries(response));
        } else {
          // Gone or not in this workspace any more: start fresh.
          writeLastConversationId(null);
        }
        setHistory('ready');
      });

    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  const send = useCallback(
    async (text: string, retryOfId?: string) => {
      const parsed = ChatInputSchema.safeParse(text);
      if (!parsed.success || isSending) return false;
      const content = parsed.data;

      const pendingId = nextId('assistant');
      setIsSending(true);
      setEntries((prev) => {
        const withoutRetried = retryOfId
          ? prev.filter((entry) => entry.id !== retryOfId)
          : prev;
        const userEntry: ChatEntry | null = retryOfId
          ? null
          : {
              id: nextId('user'),
              role: 'user',
              content,
              tools: [],
              status: 'done',
            };
        return [
          ...withoutRetried,
          ...(userEntry ? [userEntry] : []),
          {
            id: pendingId,
            role: 'assistant',
            content: '',
            tools: [],
            status: 'pending',
          },
        ];
      });

      const response = await ApiAi.Chat.doPost({
        payload: {
          content,
          conversation_id: refConversationId.current ?? undefined,
          stream: false,
        },
      });

      setIsSending(false);

      if (response.$status === 'success') {
        if (response.conversation_id) {
          rememberConversation(response.conversation_id);
        }
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === pendingId
              ? {
                  ...entry,
                  content: response.message ?? '',
                  tools: response.tools ?? [],
                  status: 'done',
                }
              : entry,
          ),
        );
        return true;
      }

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === pendingId
            ? {
                ...entry,
                status: 'failed',
                retryText: content,
                error: getApiErrorDetail(response.error),
              }
            : entry,
        ),
      );
      return false;
    },
    [isSending, rememberConversation],
  );

  const retry = useCallback(
    (entry: ChatEntry) =>
      entry.retryText
        ? send(entry.retryText, entry.id)
        : Promise.resolve(false),
    [send],
  );

  const startNewConversation = useCallback(() => {
    if (isSending) return;
    rememberConversation(null);
    setEntries([]);
  }, [isSending, rememberConversation]);

  return {
    entries,
    conversationId,
    isLoadingHistory: history === 'loading',
    isSending,
    send,
    retry,
    startNewConversation,
  };
}
