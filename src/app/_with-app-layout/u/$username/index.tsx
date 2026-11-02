import { createFileRoute } from '@tanstack/react-router';

import ProfileView from './-view';

export const Route = createFileRoute('/_with-app-layout/u/$username/')({
  head: () => ({
    meta: [{ title: 'Profile | dnocs' }],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { username } = Route.useParams();

  return <ProfileView username={username} />;
}
