import type { ReactNode } from 'react';

interface BaseProps {
  children: ReactNode;
}

const Layout = {
  /** Main column plus a help aside that only appears once there is room. */
  Content(props: BaseProps) {
    return (
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px]">
        {props.children}
      </div>
    );
  },

  Main(props: BaseProps) {
    return <div className="flex min-w-0 flex-col gap-4">{props.children}</div>;
  },

  Aside(props: BaseProps) {
    return (
      <aside className="hidden flex-col gap-4 xl:flex">{props.children}</aside>
    );
  },
};

export default Layout;
