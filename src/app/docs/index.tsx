import { Navigate, createFileRoute, redirect } from '@tanstack/react-router';

import { noIndexHead } from '@/shared/libs/seo';

export const Route = createFileRoute('/docs/')({
  head: () => noIndexHead('Documentation'),
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
