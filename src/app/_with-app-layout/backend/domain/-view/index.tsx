import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import Layout from './-presentation/Layout';
import Guide from './Guide';
import Header from './Header';
import MainBottomActions from './MainBottomActions';
import MainDomainsList from './MainDomainsList';
import MainFilter from './MainFilter';
import Overview from './Overview';

export default function DomainDNSView() {
  return (
    <div className="flex flex-col gap-4">
      <Header />
      <Guide />
      <Overview />

      <Layout>
        <Layout.Main>
          <MainFilter />
          <MainDomainsList />
          <MainBottomActions />
        </Layout.Main>

        <Layout.Aside>
          <Card className="rounded-2xl">
            <AsideHelpSupport.Complete topic="domain" />
          </Card>
        </Layout.Aside>
      </Layout>
    </div>
  );
}
