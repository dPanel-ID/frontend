import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import EventController from './-EventController';
import { CloudDataModelProvider } from './-model/cloud-data';
import { FilterModelProvider } from './-model/filters';
import { CloudOverviewModelProvider } from './-model/overview';
import { schemaQueryString } from './-rules/qs';
import {
  Guide,
  Header,
  Layout,
  MainBottomActions,
  MainFilter,
  MainList,
  Overview,
} from './-view';

export const Route = createFileRoute(
  '/_with-app-layout/backend/cloud-projects/',
)({
  head: () => ({
    meta: [{ title: 'Cloud accounts | dnocs' }],
  }),
  component: CloudProjectsPage,
  validateSearch: zodValidator(schemaQueryString),
});

function CloudProjectsPage() {
  return (
    <FilterModelProvider>
      <CloudOverviewModelProvider>
        <CloudDataModelProvider>
          <EventController />

          <div className="flex flex-col gap-4">
            <Header />
            <Guide />
            <Overview />

            <Layout>
              <Layout.Main>
                <MainFilter />
                <MainList />
                <MainBottomActions />
              </Layout.Main>

              <Layout.Aside>
                <Card className="rounded-2xl">
                  <AsideHelpSupport.Complete topic="cloud" />
                </Card>
              </Layout.Aside>
            </Layout>
          </div>
        </CloudDataModelProvider>
      </CloudOverviewModelProvider>
    </FilterModelProvider>
  );
}
