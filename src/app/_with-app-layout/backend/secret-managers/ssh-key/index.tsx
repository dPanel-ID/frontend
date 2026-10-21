import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

import { Card } from '@/shared/presentation/atoms/Card';
import { AsideHelpSupport } from '@/widgets/aside-help-support';

import EventController from './-EventController';
import { FilterModelProvider } from './-model/filters';
import { SshKeysOverviewModelProvider } from './-model/overview';
import { SshKeyDataModelProvider } from './-model/ssh-key-data';
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
  '/_with-app-layout/backend/secret-managers/ssh-key/',
)({
  component: SshKeyPage,
  validateSearch: zodValidator(schemaQueryString),
});

function SshKeyPage() {
  return (
    <FilterModelProvider>
      <SshKeysOverviewModelProvider>
        <SshKeyDataModelProvider>
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
                  <AsideHelpSupport.Complete topic="ssh" />
                </Card>
              </Layout.Aside>
            </Layout>
          </div>
        </SshKeyDataModelProvider>
      </SshKeysOverviewModelProvider>
    </FilterModelProvider>
  );
}
