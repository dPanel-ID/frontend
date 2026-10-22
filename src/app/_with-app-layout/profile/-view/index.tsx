import { useAuthLoggedIn } from '@/services/auth';
import { useAuthEmit } from '@/services/auth/model/events';

import { useUserEditSidepanel } from '@/features/user-edit-sidepanel';

import Layout from './-presentation/Layout';
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
        </Layout.Main>

        <Layout.Aside>
          <ProfileSidebar />
        </Layout.Aside>
      </Layout>
    </div>
  );
}
