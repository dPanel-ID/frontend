import { useNavigate } from '@tanstack/react-router';

import { useArtifactNewSidepanel } from '@/features/artifact-new-sidepanel';

import { useAppDataModel } from '../-model/app-data';
import { useEmit } from '../-model/events';

type OpenState = 'loading' | 'disabled' | undefined;

interface DeployNewBuild {
  /** Opens the panel that builds the current commit and releases it. */
  open: () => void;
  /** `undefined` means the action is ready; anything else disables it. */
  state: OpenState;
}

/**
 * Building and releasing is offered in two places — the next-steps strip and
 * the releases section — so the repository lookup and the panel wiring live
 * here rather than in either view.
 */
export function useDeployNewBuild(): DeployNewBuild {
  const emit = useEmit();
  const navigate = useNavigate();

  const [appDetail, gitDetail, selectedServerId, rawBranch] = useAppDataModel(
    (s) => [s.appDetail, s.gitDetail, s.selectedServerId, s.rawBranch],
  );

  const [openArtifactNewSidepanel] = useArtifactNewSidepanel();

  const open = () => {
    if (appDetail.$status !== 'success') return;

    const identity = appDetail.identity;
    const fromDetail =
      identity.source === 'repository'
        ? {
            repoOrganization: identity.repoOrganization,
            repoName: identity.repoName,
          }
        : undefined;

    const repoOrganization =
      gitDetail.$status === 'success'
        ? gitDetail.repo_org
        : fromDetail?.repoOrganization;
    const repoName =
      gitDetail.$status === 'success'
        ? gitDetail.repo_name
        : fromDetail?.repoName;

    if (!repoOrganization || !repoName) return;

    openArtifactNewSidepanel({
      repoName,
      repoOrganization,
      applicationId: appDetail.id,
      currentServerId: selectedServerId || appDetail.deploymentTargets[0]?.id,
      // Redeploy builds the branch the application already follows.
      defaultBranch:
        rawBranch ||
        (gitDetail.$status === 'success' ? gitDetail.default_branch : ''),
      appConfig: appDetail.configDefs,
      onOperationQueued: (groupId, operationId) => {
        navigate({
          to: '/servers/groups/$id',
          params: { id: groupId },
          search: { operationId },
        });
      },
      onSuccess: () => {
        emit('@applications::detail/deployment-history-refresh', null);
        emit('@applications::detail/app-detail-refresh', null);
      },
    });
  };

  const state: OpenState = (() => {
    if (gitDetail.$status === 'success') return undefined;

    if (
      appDetail.$status === 'success' &&
      appDetail.identity.source === 'repository'
    ) {
      return undefined;
    }

    if (gitDetail.$status === 'loading') return 'loading';

    return 'disabled';
  })();

  return { open, state };
}
