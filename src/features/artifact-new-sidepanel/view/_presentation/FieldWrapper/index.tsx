import type { ReactNode } from 'react';

import { ImportantMarker } from '..';

interface FieldWrapperProps {
  fieldTitle: string;
  notImportant?: boolean;
  children: ReactNode;
}

export default function FieldWrapper(props: FieldWrapperProps) {
  const { children, fieldTitle, notImportant } = props;

  return (
    <div className="grid gap-2 overflow-hidden rounded-lg border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {fieldTitle}
        {!notImportant && <ImportantMarker />}
      </p>

      {children}
    </div>
  );
}
