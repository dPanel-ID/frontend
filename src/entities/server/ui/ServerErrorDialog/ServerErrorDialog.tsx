import { useDevetekTranslations } from '@/services/i18n';

import type { SchemaServerParts } from '@/entities/server/rules/schema';
import { ExecutionErrorDialog } from '@/entities/shared/ui/ExecutionErrorDialog';

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

  return (
    <ExecutionErrorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('page.servers.card.errorDialogTitle')}
      subject={serverName}
      state={state}
    />
  );
}
