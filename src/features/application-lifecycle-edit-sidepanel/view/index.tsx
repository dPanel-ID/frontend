import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ApplicationLifecycleEditModelProvider as ModelProvider } from '../model';
import type { ApplicationLifecycleEditSidepanelProps as Props } from '../rules/types';
import useFormBhvGuardUsecase from '../usecase/form-bhv-guard';
import useFormSubmissionUsecase from '../usecase/form-submission';

import Actions from './Actions';
import Forms from './Forms';

const Controller = () => {
  useFormBhvGuardUsecase();
  useFormSubmissionUsecase();

  return null;
};

export default function ApplicationLifecycleEditSidepanel(props: Props) {
  const { applicationName, applicationId } = props;
  const t = useDevetekTranslations('sidepanel.applicationLifecycleEdit');

  return (
    <ModelProvider {...props}>
      <Controller />

      <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[880px]">
        <Layout.Title
          title={t('title')}
          subtitle={applicationName || `Id: ${applicationId}`}
          hasCloseButton
        />

        <Layout.Content>
          <Forms />
        </Layout.Content>

        <Layout.Cta className="gap-y-2">
          <Actions />
        </Layout.Cta>
      </Layout>
    </ModelProvider>
  );
}
