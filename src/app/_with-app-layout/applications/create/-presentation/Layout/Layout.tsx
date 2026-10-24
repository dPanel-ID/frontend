import type { ReactNode } from 'react';

interface BaseProps {
  children: ReactNode;
}

/**
 * The same full-width column every other page in the product uses. An
 * earlier version capped this at `max-w-4xl`, which left the page floating
 * in empty gutters while the list and detail pages beside it ran edge to
 * edge.
 */
export default function ApplicationsCreateLayout(props: BaseProps) {
  const { children } = props;

  return <div className="flex flex-col gap-4">{children}</div>;
}

ApplicationsCreateLayout.Main = function Main(props: BaseProps) {
  return <div className="flex min-w-0 flex-col gap-4">{props.children}</div>;
};
