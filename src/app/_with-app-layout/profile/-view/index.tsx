import { useNavigate, useSearch } from '@tanstack/react-router';
import { BotIcon, ServerCogIcon, UserRoundIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useAuthEmit } from '@/services/auth/model/events';
import { useDevetekTranslations } from '@/services/i18n';

import { ServiceAccountsPanel } from '@/features/service-accounts';
import { useUserEditSidepanel } from '@/features/user-edit-sidepanel';
import { WorkersCard } from '@/features/workspace-workers';

import { PERSONAL_WORKSPACE_ID } from '@/shared/libs/api-client/config';
import { SectionTabs } from '@/shared/presentation/organisms/SectionTabs';

import type { ProfileTab } from '../-rules/qs';

import Layout from './-presentation/Layout';
import AdminAccess from './AdminAccess';
import { Header } from './Header';
import Overview from './Overview';
import { Personal, ProfileSidebar } from './Personal';

export default function ProfileView() {
  const { userProfile } = useAuthLoggedIn();
  const authEmit = useAuthEmit();
  const [openUserEdit] = useUserEditSidepanel();
  const t = useDevetekTranslations('page.profile.tabs');
  const navigate = useNavigate({ from: '/profile' });
  const { tab = 'profile' } = useSearch({
    from: '/_with-app-layout/profile/',
  });

  const handleSelectTab = (next: ProfileTab) => {
    void navigate({
      search: { tab: next === 'profile' ? undefined : next },
      replace: true,
    });
  };

  const handleEditProfile = () => {
    openUserEdit({
      action: 'update',
      user: {
        id: userProfile.id,
        fullname: userProfile.fullname,
        email: userProfile.email,
        username: userProfile.username,
        avatar_url: userProfile.avatarSrc,
      },
      onSubmitSuccess: () => {
        authEmit('%%auth/refresh', null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Header onEditProfile={handleEditProfile} />
      <Overview />

      <SectionTabs<ProfileTab>
        ariaLabel={t('ariaLabel')}
        active={tab}
        onSelect={handleSelectTab}
        items={[
          { id: 'profile', label: t('profile'), icon: UserRoundIcon },
          { id: 'workers', label: t('workers'), icon: ServerCogIcon },
          {
            id: 'service-accounts',
            label: t('serviceAccounts'),
            icon: BotIcon,
          },
        ]}
      />

      {tab === 'profile' && (
        <Layout>
          <Layout.Main>
            <Personal onEditProfile={handleEditProfile} />
            <AdminAccess />
          </Layout.Main>

          <Layout.Aside>
            <ProfileSidebar />
          </Layout.Aside>
        </Layout>
      )}

      {/* The profile always acts on the personal workspace, whichever
          workspace the app shell has selected. */}
      {tab === 'workers' && (
        <WorkersCard
          workspaceId={PERSONAL_WORKSPACE_ID}
          canManage
          accent="sky"
        />
      )}

      {tab === 'service-accounts' && (
        <ServiceAccountsPanel workspaceId={PERSONAL_WORKSPACE_ID} />
      )}
    </div>
  );
}
