import type { LucideIcon } from 'lucide-react';

export default function WorkspaceConfigRow(props: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
}) {
  const { helper, icon: Icon, label, value } = props;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary/65">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-primary">
          {value}
        </span>
        {helper && (
          <span className="block truncate text-xs text-muted-foreground">
            {helper}
          </span>
        )}
      </span>
    </div>
  );
}
