import { useAppDataModel } from '../../-model/app-data';
import GithubSessionBanner from '../../../-view/GithubSessionBanner';

export default function BannerGithubLogin() {
  const [appDetail, gitDetail] = useAppDataModel((s) => [
    s.appDetail,
    s.gitDetail,
  ]);

  if (
    appDetail.$status !== 'success' ||
    appDetail.identity.source !== 'repository'
  )
    return null;

  return <GithubSessionBanner extraResponses={[gitDetail]} />;
}
