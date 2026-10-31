import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { MessageSquarePlusIcon, SendHorizontalIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import Shimmer from '@/shared/presentation/atoms/Shimmer';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

import type { ChatEntry } from '../rules/types';
import useAssistantChat from '../usecase/useAssistantChat';

import EmptyIntro from './-presentation/EmptyIntro';
import MessageBubble from './-presentation/MessageBubble';

const MAX_LENGTH = 8000;
const COUNTER_FROM = 7000;

/** The conversation itself; mounted only for a signed-in user when the assistant is reachable. */
export default function ChatBody() {
  const t = useDevetekTranslations();
  const chat = useAssistantChat();
  const [draft, setDraft] = useState('');
  const refScroll = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    refScroll.current?.scrollTo({
      top: refScroll.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chat.entries]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  const canSend =
    draft.trim().length > 0 && draft.length <= MAX_LENGTH && !chat.isSending;

  const submit = async (text: string) => {
    if (chat.isSending) return;
    setDraft('');
    const sent = await chat.send(text);
    if (!sent) refInput.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    if (canSend) void submit(draft);
  };

  const handleRetry = (entry: ChatEntry) => {
    void chat.retry(entry);
  };

  return (
    <>
      {chat.entries.length > 0 && (
        <div className="flex justify-end px-4 pb-2">
          <Button
            size="xs"
            buttonColor="secondary"
            disabled={chat.isSending}
            onClick={chat.startNewConversation}
            aria-label={t('sidepanel.aiAssistant.newConversation')}
            title={t('sidepanel.aiAssistant.newConversation')}
          >
            <MessageSquarePlusIcon aria-hidden />
            {t('sidepanel.aiAssistant.newConversation')}
          </Button>
        </div>
      )}

      <Layout.Content>
        <div
          ref={refScroll}
          className="flex h-full flex-col gap-4 overflow-y-auto pb-2"
          aria-live="polite"
        >
          {chat.isLoadingHistory && (
            <div className="flex flex-col gap-3" aria-busy>
              <Shimmer className="ml-auto h-9 w-2/3 rounded-xl" />
              <Shimmer className="h-16 w-full rounded-xl" />
            </div>
          )}

          {!chat.isLoadingHistory && chat.entries.length === 0 && (
            <EmptyIntro
              onPick={(prompt) => void submit(prompt)}
              disabled={chat.isSending}
            />
          )}

          {chat.entries.map((entry) => (
            <MessageBubble
              key={entry.id}
              entry={entry}
              onRetry={handleRetry}
              retryDisabled={chat.isSending}
            />
          ))}
        </div>
      </Layout.Content>

      <Layout.Cta className="gap-2 border-t pt-3">
        <label htmlFor="ai-assistant-input" className="sr-only">
          {t('sidepanel.aiAssistant.inputLabel')}
        </label>
        <div className="flex items-end gap-2">
          <TextArea
            id="ai-assistant-input"
            ref={refInput}
            rows={2}
            maxLength={MAX_LENGTH}
            value={draft}
            disabled={chat.isLoadingHistory}
            placeholder={t('sidepanel.aiAssistant.inputPlaceholder')}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            className="max-h-40 min-h-[44px] resize-none"
          />
          <Button
            size="icon"
            disabled={!canSend}
            onClick={() => void submit(draft)}
            aria-label={t('sidepanel.aiAssistant.send')}
            title={t('sidepanel.aiAssistant.send')}
          >
            <SendHorizontalIcon aria-hidden />
          </Button>
        </div>
        <p className="flex justify-between text-xs text-muted-foreground">
          <span>{t('sidepanel.aiAssistant.inputHint')}</span>
          {draft.length >= COUNTER_FROM && (
            <span>
              {draft.length}/{MAX_LENGTH}
            </span>
          )}
        </p>
      </Layout.Cta>
    </>
  );
}
