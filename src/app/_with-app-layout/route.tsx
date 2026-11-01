import { Outlet, createFileRoute } from '@tanstack/react-router';

import { AppLayout } from '@/features/app-shell';
import { AuthGuard } from '@/features/auth-toolkit/guard';

export const Route = createFileRoute('/_with-app-layout')({
  // The signed-in app is private: keep every page of it out of search results.
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: WithAppLayout,
});

function WithAppLayout() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-3">
          <Outlet />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
