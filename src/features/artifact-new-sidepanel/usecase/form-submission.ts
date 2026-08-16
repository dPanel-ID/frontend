import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { ExplicitTarget } from '@/shared/rules/host-group';

import { ApiArtifact, ApiDeploy, ApiGitBranch } from '@/shared/api';
import { iife } from '@/shared/libs/browser/fn';

import { useEmit, useSubscribe } from '../model/events';
import { useArtifactNewGeneralModel } from '../model/general';

export function resolveDeploymentRequestTarget(params: {
  hostGroupId?: string;
  targetMode: 'server' | 'hostgroup';
  workerId: string;
}) {
  const explicitTarget: ExplicitTarget | undefined =
    params.targetMode === 'hostgroup' && params.hostGroupId
      ? {
          type: 'hostgroup',
          id: params.hostGroupId,
        }
      : undefined;

  return {
    explicitTarget,
    workerId: explicitTarget ? '' : params.workerId,
  } as const;
}

export default function useFormSubmissionUsecase() {
  const { form, props } = useArtifactNewGeneralModel();
  const t = useDevetekTranslations('sidepanel.artifactNew.toaster');

  const [openToaster] = useToaster();
  const sidepanelEmit = useEmit();

  const handleSubmit = form.handleSubmit(
    async (values) => {
      const { appConfigFile, fromBranch, hostGroupId, targetMode, workerId } =
        values;

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

      const deploymentTarget = resolveDeploymentRequestTarget({
        hostGroupId,
        targetMode,
        workerId,
      });

      const responseArtifactCreation = await ApiArtifact.Create.doPost({
        appDefinition: undefined,
        applicationId: props.applicationId,
        workerId,
        appConfigFile,
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
        if (targetMode === 'server' && workerId === props.currentServerId) {
          return Promise.resolve(null);
        }

        // Create deployment with artifact ID, on worker is not the same as selected worker
        // It expect to create new deployment with status pending
        // status will "pending" when no_deploy set true
        return ApiDeploy.Create.doPost({
          applicationId: props.applicationId,
          workerId: deploymentTarget.workerId,
          artifactId: String(createdArtifactId),
          isPrimary: true,
          noDeploy: true,
          target: deploymentTarget.explicitTarget,
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

      if (
        deploymentTarget.explicitTarget?.type === 'hostgroup' &&
        responseDeployCreation != null &&
        responseDeployCreation.$status === 'success' &&
        'operation_id' in responseDeployCreation &&
        responseDeployCreation.operation_id
      ) {
        props.onOperationQueued?.(
          deploymentTarget.explicitTarget.id,
          responseDeployCreation.operation_id,
        );
      }

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
