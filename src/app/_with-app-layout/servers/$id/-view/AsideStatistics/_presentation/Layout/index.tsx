import type { ReactNode } from 'react';

import { cn } from '@/shared/libs/tailwind/cn';

interface BaseProps {
  className?: string;
  children: ReactNode;
}

export default function AsideStatisticsLayout(props: BaseProps) {
  const { children, className } = props;

  const cnRoot = cn('grid gap-3 md:grid-cols-3', className);

  return <div className={cnRoot}>{children}</div>;
}

AsideStatisticsLayout.Item = function AsideStatisticsLayoutItem(
  props: BaseProps,
) {
  const { children, className } = props;

  const cnRoot = cn('min-w-0 overflow-hidden', className);

  return <div className={cnRoot}>{children}</div>;
};
