import type { ReactNode } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { FileTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button as HeaderButton } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { FormStoreProvider } from './-model/store/form';
import { GithubReposStoreProvider } from './-model/store/github-repos';
import { ServersStoreProvider } from './-model/store/servers';
import { ApplicationsCreateLayout as Layout } from './-presentation/Layout';
import GithubSessionBanner from '../-view/GithubSessionBanner';
import { AsideProgress } from './-view/AsideProgress';
import { MainWizard } from './-view/MainWizard';

export const Route = createFileRoute('/_with-app-layout/applications/create/')({
  component: ApplicationsPage,
});

export default function ApplicationsPage() {
  const t = useDevetekTranslations();

  return (
    <>
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.applications'),
                url: '/applications',
              },
            ]}
          />
        }
        title={t('page.applicationsCreate.headerTitle')}
        description={t('page.applicationsCreate.headerDesc')}
        rightAppend={
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.applicationsCreate.docs')}
            href={LINK__DOCUMENTATION}
          />
        }
      />
      <GithubSessionBanner />
      <ServersStoreProvider>
        <GithubReposStoreProvider>
          <FormStoreProvider>
            <Layout>
              <AsideProgress />
              <Layout.Main>
                <MainWizard />
              </Layout.Main>
            </Layout>
          </FormStoreProvider>
        </GithubReposStoreProvider>
      </ServersStoreProvider>
    </>
  );
}

function HeaderHelpAction(props: {
  icon: IconComponent;
  label: string;
  href: string;
}) {
  const { href, icon: Icon, label } = props;

  return (
    <HeaderButton variant="outline" size="sm" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noreferrer"
      >
        <Icon className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </HeaderButton>
  );
}

type IconComponent = (props: { className?: string }) => ReactNode;
