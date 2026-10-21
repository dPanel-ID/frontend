import { Link } from '@tanstack/react-router';

import { cn } from '@/shared/libs/tailwind/cn';

export interface KpiItem {
  key: string;
  label: string;
  /** The headline number. Undefined renders a loading placeholder. */
  value?: number;
  /**
   * The count could not be read, so it is shown as unknown. Without this a
   * permanently failing endpoint renders a placeholder that loads forever.
   */
  unavailable?: boolean;
  /** Small line under the label, for the status breakdown. */
  hint?: string;
  /** Marks the hint as something to act on rather than reassurance. */
  hintNeedsAttention?: boolean;
  /** Shown on hover when the count is unavailable. */
  unavailableHint?: string;
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
      {fillerCount(items.length) > 0 &&
        Array.from({ length: fillerCount(items.length) }, (_, index) => (
          <div key={`filler-${index}`} aria-hidden className="bg-card" />
        ))}
    </div>
  );
}

/**
 * Blank cells completing the final row. The grid draws its dividers with a
 * background showing through a one-pixel gap, so a short last row would leave
 * a visible hole rather than empty card space.
 *
 * Counted against the widest column count the grid uses, which is the only
 * breakpoint where a gap is wide enough to read as a mistake.
 */
function fillerCount(count: number) {
  const columns = 3;
  const remainder = count % columns;
  return remainder === 0 ? 0 : columns - remainder;
}

function KpiCell(props: { item: KpiItem }) {
  const { item } = props;

  const body = (
    <>
      {item.unavailable ? (
        <span
          className="block text-2xl font-bold leading-none text-muted-foreground"
          title={item.unavailableHint}
        >
          —
        </span>
      ) : item.value == null ? (
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
