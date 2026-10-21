import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import Layout from './-presentation/Layout';
import Guide from './Guide';
import Header from './Header';
import MainBottomActions from './MainBottomActions';
import MainFilter from './MainFilter';
import MainLbList from './MainLbList';
import Overview from './Overview';

export default function LoadBalancersView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <Guide />
      <Overview />

      <Layout>
        <Layout.Main>
          <MainFilter />
          <MainLbList />
          <MainBottomActions />
        </Layout.Main>

        <Layout.Aside>
          <Card className="rounded-2xl">
            <AsideHelpSupport.Complete topic="loadBalancer" />
          </Card>
        </Layout.Aside>
      </Layout>
    </div>
  );
}
