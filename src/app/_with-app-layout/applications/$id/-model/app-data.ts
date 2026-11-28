import { useAuthLoggedIn } from '@/services/auth';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

import { ApiApplication, ApiGitRepository } from '@/shared/api';
import type { RecipeParams } from '@/shared/api/git-repository.detail.$repoOrg.$repoName';
import { useAdapter } from '@/shared/libs/api-client';
import type { WithApiGetOptions } from '@/shared/libs/api-client/rules/types';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

interface AppDataModelProps {
  applicationId: SchemaCommon.UnitId;
}

export const [AppDataModelProvider, useAppDataModel] = buildSelector(
  'AppDataModel',
)((props: AppDataModelProps) => {
  const { applicationId } = props;

  const { gitProfile } = useAuthLoggedIn();

  const [appDetailResponse, refreshAppDetailResponse] =
    ApiApplication.Detail.$Id.useGet({
      applicationId,
    });

  const paramsGitRepositoryDetail: WithApiGetOptions<RecipeParams> = {
    repoName: '',
    repoOrganization: '',
    options: {
      skip: true,
    },
  };

  let latestServerId: string | undefined;

  if (appDetailResponse.$status === 'success') {
    paramsGitRepositoryDetail.options!.skip = gitProfile == null;
    paramsGitRepositoryDetail.repoName = appDetailResponse.repo_name!;
    paramsGitRepositoryDetail.repoOrganization = appDetailResponse.repo_org!;

    if (appDetailResponse.deploys?.[0]?.machine_id) {
      latestServerId = String(appDetailResponse.deploys[0].machine_id);
    }
  }

  const [gitDetailReponse, refreshGitDetailReponse] =
    ApiGitRepository.Detail.$RepoOrg.$RepoName.useGet(
      paramsGitRepositoryDetail,
    );

  useSubscribe('@applications::detail/app-detail-refresh', () =>
    refreshAppDetailResponse(),
  );

  useSubscribe('@applications::detail/git-detail-refresh', () =>
    refreshGitDetailReponse(),
  );

  return {
    appDetail: useAdapter(appDetailResponse, (raw) =>
      AdapterApplicationFromDto.toApplicationDetail(raw).unwrap(),
    ),
    gitDetail: gitDetailReponse,
    rawAppDefinition:
      appDetailResponse.$status === 'success'
        ? appDetailResponse.app_definition
        : undefined,
    rawWorkdir:
      appDetailResponse.$status === 'success'
        ? (appDetailResponse.workdir ??
          appDetailResponse.app_definition?.build?.target?.machine?.workdir ??
          appDetailResponse.app_definition?.build?.target?.machine?.workir ??
          '')
        : '',

    // The branch the application builds: its newest build's, else the one
    // it was created from.
    rawBranch:
      appDetailResponse.$status === 'success'
        ? appDetailResponse.artifacts?.[0]?.branch ||
          appDetailResponse.default_branch ||
          ''
        : '',

    // The framework saved with the application; framework-specific
    // helpers also accept the one detected in its repository.
    rawFramework:
      appDetailResponse.$status === 'success'
        ? (appDetailResponse.framework ?? '')
        : '',

    applicationId,
    selectedServerId: latestServerId,
  };
});
