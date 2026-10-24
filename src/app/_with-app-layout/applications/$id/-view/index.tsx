import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import Guard from './_Guard';
import Layout from './_presentation/Layout';
import AppLogs from './AppLogs';
import BannerGithubLogin from './BannerGithubLogin';
import Configuration from './Configuration';
import DangerZone from './DangerZone';
import Hero from './Hero';
import NextSteps from './NextSteps';
import Overview from './Overview';
import Releases from './Releases';

/**
 * The detail anatomy from the house standard: hero, the numbers, what you
 * can do next, the resource's own sections, and the danger zone last. The
 * aside carries help only — everything the page needs is in the main column.
 */
export default function ApplicationsDetailView() {
  return (
    <Guard>
      <div className="flex flex-col gap-4">
        <Hero />
        <BannerGithubLogin />
        <Overview />
        <NextSteps />

        <Layout.Content>
          <Layout.Main>
            <Releases />
            <AppLogs />
            <Configuration />
            <DangerZone />
          </Layout.Main>

          <Layout.Aside>
            <Card className="rounded-2xl">
              <AsideHelpSupport.Complete topic="application" />
            </Card>
          </Layout.Aside>
        </Layout.Content>
      </div>
    </Guard>
  );
}
