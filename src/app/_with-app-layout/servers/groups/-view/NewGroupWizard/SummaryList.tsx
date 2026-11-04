import type { ReactNode } from 'react';

/** A compact label/value list for the review and installing steps. */
export function SummaryList(props: {
  rows: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-x-4 gap-y-2 rounded-xl border bg-background/60 p-3 text-sm sm:grid-cols-[10rem_1fr]">
      {props.rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-xs font-semibold text-muted-foreground sm:text-sm">
            {row.label}
          </dt>
          <dd className="min-w-0 break-words font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
