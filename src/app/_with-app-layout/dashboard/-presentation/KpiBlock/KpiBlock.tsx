import { Link } from '@tanstack/react-router';

import { cn } from '@/shared/libs/tailwind/cn';

export interface KpiItem {
  key: string;
  label: string;
  /** The headline number. Undefined renders a loading placeholder. */
  value?: number;
  /** Small line under the label, for the status breakdown. */
  hint?: string;
  /** Marks the hint as something to act on rather than reassurance. */
  hintNeedsAttention?: boolean;
  to?: string;
  search?: Record<string, unknown>;
}

export interface KpiBlockProps {
  items: KpiItem[];
  className?: string;
}

/**
 * A grid of headline numbers: the estate at a glance, reading as one block
 * rather than as a row of separate cards.
 *
 * Deliberately numbers and not sparklines — resource counts are totals, not
 * series, and no history of them is stored, so a trend line under them would
 * be invented. The hint carries the real status breakdown instead.
 */
export default function KpiBlock(props: KpiBlockProps) {
  const { className, items } = props;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <KpiCell key={item.key} item={item} />
      ))}
    </div>
  );
}

function KpiCell(props: { item: KpiItem }) {
  const { item } = props;

  const body = (
    <>
      {item.value == null ? (
        <span className="block h-7 w-12 animate-pulse rounded bg-border/70" />
      ) : (
        <span className="block text-2xl font-bold leading-none tabular-nums text-primary">
          {item.value}
        </span>
      )}
      <span className="mt-1.5 block truncate text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {item.label}
      </span>
      {item.hint && (
        <span
          className={cn(
            'mt-0.5 block truncate text-xs',
            item.hintNeedsAttention
              ? 'font-semibold text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground/80',
          )}
        >
          {item.hint}
        </span>
      )}
    </>
  );

  const cellClassName = 'min-w-0 bg-card px-3 py-3';

  if (!item.to) {
    return <div className={cellClassName}>{body}</div>;
  }

  return (
    <Link
      to={item.to}
      search={item.search}
      className={cn(
        cellClassName,
        'block transition-colors hover:bg-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/50',
      )}
    >
      {body}
    </Link>
  );
}
