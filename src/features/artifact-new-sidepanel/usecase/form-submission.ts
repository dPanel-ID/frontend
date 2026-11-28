import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { useDeployPreflightGuard } from '@/entities/deploy-preflight';

import { ApiApplication, ApiArtifact, ApiDeploy } from '@/shared/api';
import type { ExplicitTarget } from '@/shared/rules/host-group';

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

/**
 * The deployment request for "Build and release". It never sets no_deploy:
 * the build is released onto the target as soon as it is ready.
 */
export function buildReleaseRequest(params: {
  applicationId: string;
  artifactId: string;
  target: ReturnType<typeof resolveDeploymentRequestTarget>;
  /** Deploy despite a blocking pre-flight result. */
  skipPreflight?: boolean;
}) {
  return {
    applicationId: params.applicationId,
    artifactId: params.artifactId,
    workerId: params.target.workerId,
    isPrimary: true,
    target: params.target.explicitTarget,
    ...(params.skipPreflight ? { skipPreflight: true } : {}),
  };
}

export default function useFormSubmissionUsecase() {
  const { form, props } = useArtifactNewGeneralModel();
  const t = useDevetekTranslations('sidepanel.artifactNew.toaster');

  const [openToaster] = useToaster();
  const sidepanelEmit = useEmit();
  const guardPreflight = useDeployPreflightGuard();

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

      const currentBranchResponse = await ApiApplication.Branch.$Id.fetchGet({
        applicationId: String(props.applicationId),
        branch: fromBranch,
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

      // Creating the artifact only records the build. The deployment request
      // builds it and releases it onto the chosen server or group, the same
      // server the application already runs on included.
      const release = async (skipPreflight: boolean) => {
        const responseDeployCreation = await ApiDeploy.Create.doPost(
          buildReleaseRequest({
            applicationId: props.applicationId,
            artifactId: String(createdArtifactId),
            target: deploymentTarget,
            skipPreflight,
          }),
        );

        // Refused on pre-flight checks: nothing was deployed. The dialog
        // offers to release anyway; the sidepanel stays open meanwhile.
        if (
          !skipPreflight &&
          guardPreflight(responseDeployCreation, () => release(true))
        ) {
          return;
        }

        if (responseDeployCreation.$status !== 'success') {
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
      };

      await release(false);
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
