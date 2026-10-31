import { CloudOffIcon, LogInIcon, RotateCcwIcon } from 'lucide-react';

import { useAuthBase } from '@/services/auth/usecase';
import { useDevetekTranslations } from '@/services/i18n';
import { useSidepanelEmit } from '@/services/sidepanel/model/event';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ApiAi } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import PanelNotice from './-presentation/PanelNotice';
import ChatBody from './ChatBody';

/**
 * The assistant sidepanel. The launcher is on every page, so the panel
 * decides what to show: a sign-in prompt for visitors, an "unavailable"
 * notice when the backend has no assistant, otherwise the conversation.
 */
export default function AssistantSidepanel() {
  const t = useDevetekTranslations();
  const emit = useSidepanelEmit();
  const auth = useAuthBase();
  const isLoggedIn = auth.$status === 'success' && auth.isLoggedIn;
  const [availability, checkAvailability] = ApiAi.Conversations.useGet({
    options: { skip: !isLoggedIn },
  });

  const handleSignIn = () => {
    emit('%%sidepanel/close', null);
    window.location.assign('/');
  };

  const body = (() => {
    if (
      auth.$status === 'loading' ||
      (isLoggedIn &&
        (availability.$status === 'initial' ||
          availability.$status === 'loading'))
    ) {
      return (
        <Layout.Content>
          <div className="flex flex-col gap-3 pt-2" aria-busy>
            <Shimmer className="h-24 w-full rounded-2xl" />
            <Shimmer className="h-10 w-full rounded-lg" />
          </div>
        </Layout.Content>
      );
    }

    if (!isLoggedIn) {
      return (
        <Layout.Content>
          <PanelNotice
            icon={LogInIcon}
            title={t('sidepanel.aiAssistant.signInTitle')}
            body={t('sidepanel.aiAssistant.signInBody')}
            action={
              <Button onClick={handleSignIn}>
                <LogInIcon aria-hidden />
                {t('sidepanel.aiAssistant.signIn')}
              </Button>
            }
          />
        </Layout.Content>
      );
    }

    if (availability.$status !== 'success') {
      return (
        <Layout.Content>
          <PanelNotice
            icon={CloudOffIcon}
            title={t('sidepanel.aiAssistant.unavailableTitle')}
            body={t('sidepanel.aiAssistant.unavailableBody')}
            action={
              <Button
                buttonColor="secondary"
                onClick={() => checkAvailability({ abortInFlight: true })}
              >
                <RotateCcwIcon aria-hidden />
                {t('sidepanel.aiAssistant.checkAgain')}
              </Button>
            }
          />
        </Layout.Content>
      );
    }

    return <ChatBody />;
  })();

  return (
    <Layout classNameFrame="w-[92vw] max-w-[440px]">
      <Layout.Title
        title={t('sidepanel.aiAssistant.title')}
        subtitle={t('sidepanel.aiAssistant.subtitle')}
        hasCloseButton
      />
      {body}
    </Layout>
  );
}
