import type { ReactNode } from 'react';

interface BaseProps {
  children: ReactNode;
}

/**
 * A single readable column. The flow walks one section at a time, so there
 * is nothing to put beside it, and a bounded width keeps form rows from
 * stretching across a wide monitor.
 */
export default function ApplicationsCreateLayout(props: BaseProps) {
  const { children } = props;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      {children}
    </div>
  );
}

ApplicationsCreateLayout.Main = function Main(props: BaseProps) {
  return <div className="flex min-w-0 flex-col gap-4">{props.children}</div>;
};
