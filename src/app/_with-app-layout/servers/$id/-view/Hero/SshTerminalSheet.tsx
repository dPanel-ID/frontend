import { useDevetekTranslations } from '@/services/i18n';

import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/shared/presentation/atoms/Dialog';

interface SshTerminalSheetProps {
  open: boolean;
  serverId: string;
  serverName: string;
  onOpenChange: (open: boolean) => void;
}

/** The web SSH terminal, slid up from the bottom so the page stays behind it. */
export function SshTerminalSheet(props: SshTerminalSheetProps) {
  const { onOpenChange, open, serverId, serverName } = props;
  const t = useDevetekTranslations('page.serverDetail.hero');
  const url = `${import.meta.env.VITE_SECURE_SHELL_HOST}?id=${serverId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 left-0 top-auto flex h-[75svh] max-h-[75svh] w-screen max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-2xl border-x-0 border-b-0 bg-background p-0 shadow-2xl duration-300 data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-bottom-full data-[state=open]:zoom-in-100 sm:rounded-b-none sm:rounded-t-2xl">
        <DialogClose
          className="group mx-auto mt-1 flex h-2.5 w-16 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          aria-label={t('closeTerminal')}
          title={t('closeTerminal')}
        >
          <span className="h-0.5 w-10 rounded-full bg-primary/25 transition-colors group-hover:bg-primary/45" />
        </DialogClose>

        {open && (
          <div className="min-h-0 flex-1 bg-black">
            <iframe
              className="h-full w-full border-0"
              src={url}
              title={t('terminalTitle', { name: serverName })}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
