import { CircleAlertIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { SchemaServerParts } from '@/entities/server/rules/schema';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';

import { formatErrorLabel, getErrorDetailRows } from '../../lib/error-detail';

interface ServerErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverName: string;
  state: SchemaServerParts.State;
}

/** The full, redacted error detail of a failed server. */
export function ServerErrorDialog(props: ServerErrorDialogProps) {
  const { onOpenChange, open, serverName, state } = props;
  const t = useDevetekTranslations();
  const rows = getErrorDetailRows(state.errorDetail, state.message);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[82svh] max-w-3xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <CircleAlertIcon className="size-5 text-red-400" />
            {t('page.servers.card.errorDialogTitle')}
          </DialogTitle>
          <DialogDescription className="text-left">
            {serverName}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {t('page.servers.card.noStructuredError')}
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.key} className="rounded-lg border bg-card">
                  <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                    {formatErrorLabel(row.key)}
                  </div>
                  <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-xs leading-relaxed text-primary/80">
                    {row.value}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t px-5 py-4">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t('common.actions.ok')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
