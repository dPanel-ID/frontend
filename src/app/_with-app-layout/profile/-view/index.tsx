import { useAuthLoggedIn } from '@/services/auth';
import { useAuthEmit } from '@/services/auth/model/events';

import { useUserEditSidepanel } from '@/features/user-edit-sidepanel';
import { WorkersCard } from '@/features/workspace-workers';

import { PERSONAL_WORKSPACE_ID } from '@/shared/libs/api-client/config';

import Layout from './-presentation/Layout';
import AdminAccess from './AdminAccess';
import { Header } from './Header';
import Overview from './Overview';
import { Personal, ProfileSidebar } from './Personal';

export default function ProfileView() {
  const { userProfile } = useAuthLoggedIn();
  const authEmit = useAuthEmit();
  const [openUserEdit] = useUserEditSidepanel();

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

      <Layout>
        <Layout.Main>
          <Personal onEditProfile={handleEditProfile} />
          {/* The profile always acts on the personal workspace, whichever
              workspace the app shell has selected. */}
          <WorkersCard
            workspaceId={PERSONAL_WORKSPACE_ID}
            canManage
            accent="sky"
          />
          <AdminAccess />
        </Layout.Main>

        <Layout.Aside>
          <ProfileSidebar />
        </Layout.Aside>
      </Layout>
    </div>
  );
}
