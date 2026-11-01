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
        {/* pb-24 keeps the end of every page (pagination, last rows) clear
            of the floating "Ask dPanel" button, which sits 20px from the
            bottom and is about 44px tall. */}
        <div className="p-3 pb-24">
          <Outlet />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
