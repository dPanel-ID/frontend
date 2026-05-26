import type { ReactNode } from 'react';

import { Card } from '@/shared/presentation/atoms/Card';

interface StepSurfaceProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function StepSurface(props: StepSurfaceProps) {
  const { children, description, eyebrow, title } = props;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="border-b bg-card px-5 py-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}
