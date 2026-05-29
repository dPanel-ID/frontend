import { Navigate, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/')({
  loader: () => {
    throw redirect({
      href: '/docs/intro',
      replace: true,
    });
  },
  component: DocsRedirect,
});

function DocsRedirect() {
  return <Navigate to="/docs/intro" replace />;
}
