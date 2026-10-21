import type { ReactNode } from 'react';

export default function EmptyLine(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <div className="rounded-lg border border-dashed bg-background px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
