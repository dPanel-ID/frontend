import { createFileRoute } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import GithubSessionBanner from '../-view/GithubSessionBanner';

import { FormStoreProvider } from './-model/store/form';
import { GithubReposStoreProvider } from './-model/store/github-repos';
import { ServersStoreProvider } from './-model/store/servers';
import { ApplicationsCreateLayout as Layout } from './-presentation/Layout';
import Hero from './-view/Hero';
import MainFlow from './-view/MainFlow';

export const Route = createFileRoute('/_with-app-layout/applications/create/')({
  head: () => ({
    meta: [{ title: 'Create an application | dnocs' }],
  }),
  component: ApplicationsCreatePage,
});

export default function ApplicationsCreatePage() {
  const t = useDevetekTranslations();

  return (
    <Layout>
      <Hero
        title={t('page.applicationsCreate.headerTitle')}
        description={t('page.applicationsCreate.headerDesc')}
      />

      <GithubSessionBanner />

      <ServersStoreProvider>
        <GithubReposStoreProvider>
          <FormStoreProvider>
            <Layout.Main>
              <MainFlow />
            </Layout.Main>
          </FormStoreProvider>
        </GithubReposStoreProvider>
      </ServersStoreProvider>
    </Layout>
  );
}
