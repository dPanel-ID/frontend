import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import Layout from './-presentation/Layout';
import GithubSessionBanner from './GithubSessionBanner';
import Guide from './Guide';
import Header from './Header';
import MainAppList from './MainAppList';
import MainBottomActions from './MainBottomActions';
import MainFilter from './MainFilter';
import Overview from './Overview';

export default function ApplicationsView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <GithubSessionBanner />
      <Guide />
      <Overview />

      <Layout>
        <Layout.Main>
          <MainFilter />
          <MainAppList />
          <MainBottomActions />
        </Layout.Main>

        <Layout.Aside>
          <Card className="rounded-2xl">
            <AsideHelpSupport.Complete topic="application" />
          </Card>
        </Layout.Aside>
      </Layout>
    </div>
  );
}
