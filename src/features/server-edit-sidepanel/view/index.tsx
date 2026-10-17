import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { DisclaimersLabel } from '@/widgets/disclaimers-label';

import { ServerEditModelProvider as ModelProvider } from '../model';
import type { ServerEditSidepanelProps as Props } from '../rules/types';
import useFormBhvGuardUsecase from '../usecase/form-bhv-guard';
import useFormSubmissionUsecase from '../usecase/form-submission';

import Actions from './Actions';
import Forms from './Forms';

const Controller = () => {
  useFormBhvGuardUsecase();
  useFormSubmissionUsecase();

  return null;
};

export default function ServerEditSidepanel(props: Props) {
  const { serverId, serverName } = props;
  const t = useDevetekTranslations('sidepanel.serverEdit');

  return (
    <ModelProvider {...props}>
      <Controller />

      <Layout>
        <Layout.Title
          title={t('title')}
          subtitle={serverName || `Id: ${serverId}`}
          hasCloseButton
        />

        <Layout.Content>
          <Forms />
        </Layout.Content>

        <Layout.Cta className="gap-y-2">
          <DisclaimersLabel.ImmediatelyCommitOnSave />

          <Actions />
        </Layout.Cta>
      </Layout>
    </ModelProvider>
  );
}
