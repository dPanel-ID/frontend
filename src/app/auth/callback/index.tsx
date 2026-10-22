import { Navigate, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/callback/')({
  head: () => ({
    meta: [{ title: 'Signing in | dnocs' }],
  }),
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
