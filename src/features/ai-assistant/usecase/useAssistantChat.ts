import { useCallback, useEffect, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiAi } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { toChatEntries } from '../adapter/conversation';
import {
  readLastConversationId,
  writeLastConversationId,
} from '../lib/conversation-storage';
import { pollTurn } from '../lib/poll-turn';
import type { ChatAction, ChatEntry } from '../rules/types';
import { ChatInputSchema } from '../rules/types';

type HistoryState = 'loading' | 'ready';

let entrySequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++entrySequence}`;

const ACTION_STATUSES: Array<ChatAction['status']> = [
  'executed',
  'rejected',
  'failed',
];

function toActions(result: DTOs.AiChatResultV1): ChatAction[] {
  return (result.pending_actions ?? [])
    .filter((action) => action.action_id)
    .map((action) => ({
      id: action.action_id ?? '',
      tool: action.tool ?? '',
      summary: action.summary ?? '',
      status: 'pending' as const,
    }));
}

/**
 * Drives one assistant conversation: restores the last conversation of the
 * current workspace, sends messages, and approves or rejects the changes the
 * assistant proposes. Turns run asynchronously on the server and are polled.
 */
export default function useAssistantChat() {
  const t = useDevetekTranslations();
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

  /** Shows a pending answer, runs a turn, then fills or fails the answer. */
  const runTurn = useCallback(
    async (
      start: () => Promise<
        | (DTOs.AiTurnStartedV1 & { $status: 'success' })
        | { $status: 'failed'; error: unknown }
      >,
      retryText?: string,
    ) => {
      const pendingId = nextId('assistant');
      setEntries((prev) => [
        ...prev,
        {
          id: pendingId,
          role: 'assistant',
          content: '',
          tools: [],
          status: 'pending',
        },
      ]);

      const fail = (error: string) => {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === pendingId
              ? { ...entry, status: 'failed', error, retryText }
              : entry,
          ),
        );
      };

      const started = await start();
      if (started.$status !== 'success' || !started.turn_id) {
        fail(
          started.$status === 'failed'
            ? getApiErrorDetail(started.error)
            : t('sidepanel.aiAssistant.failedGeneric'),
        );
        return null;
      }
      if (started.conversation_id)
        rememberConversation(started.conversation_id);

      const outcome = await pollTurn(
        started.turn_id,
        t('sidepanel.aiAssistant.failedGeneric'),
      );
      if (!outcome.ok) {
        fail(outcome.error);
        return null;
      }

      const { result } = outcome;
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === pendingId
            ? {
                ...entry,
                content: result.message ?? '',
                tools: result.tools ?? [],
                actions: toActions(result),
                status: 'done',
              }
            : entry,
        ),
      );
      return result;
    },
    [rememberConversation, t],
  );

  const send = useCallback(
    async (text: string, retryOfId?: string) => {
      const parsed = ChatInputSchema.safeParse(text);
      if (!parsed.success || isSending) return false;
      const content = parsed.data;

      setIsSending(true);
      setEntries((prev) => {
        const withoutRetried = retryOfId
          ? prev.filter((entry) => entry.id !== retryOfId)
          : prev;
        if (retryOfId) return withoutRetried;
        return [
          ...withoutRetried,
          {
            id: nextId('user'),
            role: 'user',
            content,
            tools: [],
            status: 'done',
          },
        ];
      });

      const result = await runTurn(
        () =>
          ApiAi.Chat.doPost({
            payload: {
              content,
              conversation_id: refConversationId.current ?? undefined,
              async: true,
            },
          }),
        content,
      );
      setIsSending(false);
      return result !== null;
    },
    [isSending, runTurn],
  );

  const setActionStatus = useCallback(
    (actionId: string, status: ChatAction['status']) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.actions?.some((action) => action.id === actionId)
            ? {
                ...entry,
                actions: entry.actions.map((action) =>
                  action.id === actionId ? { ...action, status } : action,
                ),
              }
            : entry,
        ),
      );
    },
    [],
  );

  /** Approves or rejects a proposed change; the assistant then reports. */
  const decide = useCallback(
    async (action: ChatAction, approve: boolean) => {
      if (isSending || action.status !== 'pending') return;
      setIsSending(true);
      setActionStatus(action.id, 'deciding');

      const result = await runTurn(() =>
        ApiAi.Chat.Approval.doPost({
          payload: {
            action_id: action.id,
            decision: approve ? 'approve' : 'reject',
            async: true,
          },
        }),
      );

      const reported = result?.action_results?.find(
        (entry) => entry.action_id === action.id,
      )?.status as ChatAction['status'] | undefined;
      if (reported && ACTION_STATUSES.includes(reported)) {
        setActionStatus(action.id, reported);
      } else if (result) {
        setActionStatus(action.id, approve ? 'executed' : 'rejected');
      } else {
        // The decision may or may not have been recorded; let the user retry,
        // the server accepts only one decision per action.
        setActionStatus(action.id, 'pending');
      }
      setIsSending(false);
    },
    [isSending, runTurn, setActionStatus],
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
    decide,
    startNewConversation,
  };
}
