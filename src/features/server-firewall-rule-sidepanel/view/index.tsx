import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ServerFirewallRuleModelProvider as ModelProvider } from '../model';
import type { ServerFirewallRuleSidepanelProps as Props } from '../rules/types';
import useFormBhvGuardUsecase from '../usecase/form-bhv-guard';
import useFormSubmissionUsecase from '../usecase/form-submission';

import Actions from './Actions';
import Forms from './Forms';

const Controller = () => {
  useFormBhvGuardUsecase();
  useFormSubmissionUsecase();

  return null;
};

/** Adds one stored rule; nothing changes on the server until the next apply. */
export default function ServerFirewallRuleSidepanel(props: Props) {
  const { serverId, serverName } = props;
  const t = useDevetekTranslations('sidepanel.firewallRule');

  return (
    <ModelProvider {...props}>
      <Controller />

      <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[480px]">
        <Layout.Title
          title={t('title')}
          subtitle={serverName || `Id: ${serverId}`}
          hasCloseButton
        />

        <Layout.Content>
          <Forms />
        </Layout.Content>

        <Layout.Cta className="gap-y-2">
          <p className="text-xs text-muted-foreground">{t('nextApply')}</p>

          <Actions />
        </Layout.Cta>
      </Layout>
    </ModelProvider>
  );
}
