import type { ReactNode } from 'react';

interface BaseProps {
  children: ReactNode;
}

/**
 * The flow's two columns: every section in the main column, the review
 * panel sticky beside it on wide screens and after the sections on narrow
 * ones, so the primary action is always reachable.
 */
export default function ApplicationsCreateLayout(props: BaseProps) {
  const { children } = props;

  return (
    <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      {children}
    </div>
  );
}

ApplicationsCreateLayout.Main = function Main(props: BaseProps) {
  return <div className="flex min-w-0 flex-col gap-4">{props.children}</div>;
};

ApplicationsCreateLayout.Aside = function Aside(props: BaseProps) {
  const { children } = props;

  return <div className="flex flex-col gap-4">{children}</div>;
};
