import { useAuthLoggedIn } from '@/services/auth';
import { useAuthEmit } from '@/services/auth/model/events';

import { useUserFormModal } from '@/features/user-form-modal';

import Layout from './-presentation/Layout';
import { Header } from './Header';
import { Personal, ProfileSidebar } from './Personal';

export default function ProfileView() {
  const { userProfile } = useAuthLoggedIn();
  const authEmit = useAuthEmit();
  const [userForm] = useUserFormModal();

  const handleEditProfile = () => {
    userForm({
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
    <>
      <Header onEditProfile={handleEditProfile} />

      <Layout>
        <Layout.Main>
          <Personal onEditProfile={handleEditProfile} />
        </Layout.Main>

        <Layout.Aside>
          <ProfileSidebar />
        </Layout.Aside>
      </Layout>
    </>
  );
}
