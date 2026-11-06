import type { ReactNode } from 'react';

import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import { cn } from '@/shared/libs/tailwind/cn';

import { SidebarStoreProvider, useSidebarStore } from '../../model/sidebar';

import DesktopSidebar from './_DesktopSidebar';
import Mobile from './_Mobile';

interface Props {
  children: ReactNode;
}

const AppLayoutContent = (props: Props) => {
  const { children } = props;

  const { isCollapsed } = useSidebarStore();

  const isDesktop = useBreakpoint('md', true);

  // The margin follows CSS breakpoints, not isDesktop: the server renders the
  // desktop layout, and an inline margin would then slide the page in from
  // the right on phones (or stay shifted where the transition never runs).
  const cnContent = cn(
    'min-w-[calc(100%_-_280px)] transition-[margin] pt-16 md:pt-0 md:ml-[280px]',
    isCollapsed && 'md:ml-24',
  );

  const sidebarWidth = isCollapsed ? 96 : 280;

  return (
    <main className="relative">
      {isDesktop ? (
        <aside
          className="h-svh fixed hidden md:block"
          data-collapsed={isCollapsed}
          style={{ width: sidebarWidth }}
        >
          <DesktopSidebar />
        </aside>
      ) : (
        <header className="w-full h-16 absolute top-0">
          <Mobile />
        </header>
      )}
      <div className={cnContent}>
        <article className="max-w-[1280px] m-auto">{children}</article>
      </div>
    </main>
  );
};

export default function AppLayout(props: Props) {
  const { children } = props;

  return (
    <SidebarStoreProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarStoreProvider>
  );
}
