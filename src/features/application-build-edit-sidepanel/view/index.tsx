import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ApplicationBuildEditModelProvider as ModelProvider } from '../model';
import type { ApplicationBuildEditSidepanelProps as Props } from '../rules/types';
import useFormSubmissionUsecase from '../usecase/form-submission';

import Actions from './Actions';
import Forms from './Forms';

const Controller = () => {
  useFormSubmissionUsecase();

  return null;
};

export default function ApplicationBuildEditSidepanel(props: Props) {
  const { applicationName, applicationId } = props;

  return (
    <ModelProvider {...props}>
      <Controller />

      <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[880px]">
        <Layout.Title
          title="Edit Build Configuration"
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
