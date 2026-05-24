import SidepanelLayout from '@/services/sidepanel/ui/presentation/Layout/General';

import { createScopeForSlot, extractSlots } from '@/shared/libs/react-children';
import { cn } from '@/shared/libs/tailwind/cn';

import type {
  LayoutContentProps,
  LayoutHeaderProps,
  LayoutProps,
  LayoutSidebarProps,
  LayoutToolbarProps,
} from './types';

const slotted = createScopeForSlot('##FileManagerSidepanel');

export default function FileManagerSidepanelLayout(props: LayoutProps) {
  const { children, className, mode } = props;

  const [slotHeader, slotSidebar, slotToolbar, slotContent] = extractSlots(
    children,
    FileManagerSidepanelLayout.Header,
    FileManagerSidepanelLayout.Sidebar,
    FileManagerSidepanelLayout.Toolbar,
    FileManagerSidepanelLayout.Content,
  );

  const cnLayoutFrameWrapper = cn('w-[calc(100svw_-_16px)] max-w-[1120px]');

  const cnLayoutFrame = cn('w-full max-w-full rounded-lg bg-background');

  if (mode === 'expanded') {
    const cnLayout = cn(
      'w-full grid grid-cols-[300px_1fr] bg-background',
      className,
    );

    return (
      <SidepanelLayout
        classNameFrameWrapper={cnLayoutFrameWrapper}
        classNameFrame={cnLayoutFrame}
        className={cnLayout}
      >
        <SidepanelLayout.CloseButton />

        <aside className="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden border-r bg-background">
          {slotHeader}
          {slotSidebar}
        </aside>

        <div className="grid h-full w-full grid-rows-[auto_1fr] overflow-hidden">
          <div className="flex h-16 w-full items-center bg-background pr-14">
            {slotToolbar}
          </div>

          <div className="flex h-full flex-col overflow-hidden border-t bg-card">
            {slotContent}
          </div>
        </div>
      </SidepanelLayout>
    );
  }

  const cnLayout = cn(
    'w-full grid grid-rows-[72px_auto_1fr] bg-background',
    className,
  );

  return (
    <SidepanelLayout
      classNameFrameWrapper={cnLayoutFrameWrapper}
      classNameFrame={cnLayoutFrame}
      className={cnLayout}
    >
      <SidepanelLayout.CloseButton />

      <div className="grid w-full grid-cols-[1fr_auto] overflow-hidden pr-14">
        {slotHeader}
      </div>

      <div className="flex w-full overflow-hidden border-t bg-background px-2">
        {slotToolbar}
      </div>

      <div className="h-full w-full overflow-hidden border-t bg-card">
        {slotContent}
      </div>
    </SidepanelLayout>
  );
}

FileManagerSidepanelLayout.Header = slotted(
  'Header',
  (props: LayoutHeaderProps) => {
    const { children } = props;

    return children;
  },
);

FileManagerSidepanelLayout.Sidebar = slotted(
  'Sidebar',
  (props: LayoutSidebarProps) => {
    const { children } = props;

    return children;
  },
);

FileManagerSidepanelLayout.Toolbar = slotted(
  'Toolbar',
  (props: LayoutToolbarProps) => {
    const { children } = props;

    return children;
  },
);

FileManagerSidepanelLayout.Content = slotted(
  'Content',
  (props: LayoutContentProps) => {
    const { children } = props;

    return children;
  },
);
