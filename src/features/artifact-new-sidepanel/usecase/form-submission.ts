import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiArtifact, ApiDeploy, ApiGitBranch } from '@/shared/api';
import { iife } from '@/shared/libs/browser/fn';

import { useEmit, useSubscribe } from '../model/events';
import { useArtifactNewGeneralModel } from '../model/general';

export default function useFormSubmissionUsecase() {
  const { form, props } = useArtifactNewGeneralModel();
  const t = useDevetekTranslations('sidepanel.artifactNew.toaster');

  const [openToaster] = useToaster();
  const sidepanelEmit = useEmit();

  const handleSubmit = form.handleSubmit(
    async (values) => {
      const { fromBranch, workerId } = values;

      if (!workerId) {
        openToaster({
          message: t('missingWorker'),
          variant: 'error',
        });
        return;
      }

      const currentBranchResponse =
        await ApiGitBranch.Detail.$RepoOrg.$RepoName.fetchGet({
          branch: fromBranch,
          repoName: props.repoName,
          repoOrganization: props.repoOrganization,
        });

      if (
        currentBranchResponse.$status === 'failed' ||
        !currentBranchResponse.commit?.sha ||
        !currentBranchResponse.commit.message
      ) {
        openToaster({
          message: t('branchDetailsFailed', { branch: fromBranch }),
          variant: 'error',
        });
        return;
      }

      const responseArtifactCreation = await ApiArtifact.Create.doPost({
        appDefinition: undefined,
        applicationId: props.applicationId,
        workerId,
        appConfigFile: 'default',
        fromBranch,
        commit: {
          message: currentBranchResponse.commit.message,
          sha: currentBranchResponse.commit.sha,
        },
      });

      if (responseArtifactCreation.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('createFailedTitle'),
          message: responseArtifactCreation.error.message,
        });
        return;
      }

      const createdArtifactId = responseArtifactCreation.id;

      if (createdArtifactId == null) {
        openToaster({
          variant: 'error',
          title: t('createFailedTitle'),
          message: t('missingArtifactId'),
        });
        return;
      }

      const responseDeployCreation = await iife(() => {
        if (workerId === props.currentServerId) return Promise.resolve(null);

        // Create deployment with artifact ID, on worker is not the same as selected worker
        // It expect to create new deployment with status pending
        // status will "pending" when no_deploy set true
        return ApiDeploy.Create.doPost({
          applicationId: props.applicationId,
          workerId,
          artifactId: String(createdArtifactId),
          isPrimary: true,
          noDeploy: true,
        });
      });

      if (
        responseDeployCreation != null &&
        responseDeployCreation.$status !== 'success'
      ) {
        openToaster({
          variant: 'warning',
          message: t('deployCreateWarning'),
        });
      } else {
        openToaster({
          variant: 'success',
          message: t('success'),
        });
      }

      sidepanelEmit('#artifact-new-sidepanel/sidepanel-close', {
        bypass: true,
      });

      props.onSuccess?.(workerId);
    },
    (errors) => {
      if (errors.workerId) {
        openToaster({
          message: t('missingWorker'),
          variant: 'error',
        });
      }
    },
  );

  useSubscribe('#artifact-new-sidepanel/form-submit', () => handleSubmit());
}
