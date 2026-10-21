import { clampPercent } from '../../-lib/percent';

export default function MeterRow(props: {
  label: string;
  value?: number;
  total?: number;
}) {
  const { label, total, value } = props;
  const safeValue = value ?? 0;
  const percent = total ? (safeValue / total) * 100 : 0;

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-medium text-muted-foreground">
          {label}
        </span>
        <span className="font-bold tabular-nums text-primary">
          {value == null ? '—' : safeValue}
          {total ? (
            <span className="font-medium text-muted-foreground">
              {' '}
              / {total}
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${clampPercent(percent)}%` }}
        />
      </div>
    </div>
  );
}
