import { Navigate, createFileRoute, redirect } from '@tanstack/react-router';

import { noIndexHead } from '@/shared/libs/seo';

export const Route = createFileRoute('/auth/callback/')({
  head: () => noIndexHead('Signing in'),
  loader: () => {
    throw redirect({
      href: '/applications/create',
      replace: true,
    });
  },
  component: DocsRedirect,
});

function DocsRedirect() {
  return <Navigate to="/applications/create" replace />;
}
