import { useState } from 'react';

import {
  CloudIcon,
  GlobeIcon,
  HardHatIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  TerminalIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useServerLogViewerSidepanel } from '@/features/server-log-viewer-sidepanel';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/shared/presentation/atoms/Dialog';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

import { useEmit } from '../../-model/events';
import { useServerDataModel } from '../../-model/server-data';

import { HeaderPartials as Partials } from './_Partials';
import { HeaderStates as UIStates } from './_States';

type ServerDataModelSource = ReturnType<typeof useServerDataModel>;

const [guard, useServerDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Loading,
})(couple(useServerDataModel, (s) => (s as ServerDataModelSource).detail));

export default guard(function Header() {
  const emit = useEmit();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSshTerminalOpen, setIsSshTerminalOpen] = useState(false);
  const [serverId] = useServerDataModel((s) => [s.serverId]);
  const [openServerLogViewerSidepanel] = useServerLogViewerSidepanel();
  const [hostName, hostAddress, agentVersion, cloudProvider, sshPort] =
    useServerDetail((s) => [
      s.host.name,
      s.host.address,
      s.agent.version,
      s.cloud?.provider,
      s.ssh.port,
    ]);

  const sshTerminalUrl = `${import.meta.env.VITE_SECURE_SHELL_HOST}?id=${serverId}`;

  const handleClickSSH = () => {
    setIsSshTerminalOpen(true);
  };

  const handleClickLogs = () => {
    openServerLogViewerSidepanel({
      serverId,
      serverName: hostName,
    });
  };

  const handleClickRefresh = () => {
    setIsRefreshing(true);
    emit('@servers::detail/server-detail-refresh', null);
    emit('@servers::detail/server-stats-refresh', null);
    emit('@servers::detail/server-services-refresh', null);
    emit('@servers::detail/server-modules-refresh', null);
    emit('@servers::detail/server-network-refresh', null);

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  useMetaTags(
    {
      title: `Server: ${hostName} | dPanel`,
    },
    [hostName],
  );

  return (
    <>
      <PageHeader
        headnote={<Partials.Headnote />}
        title={hostName}
        rightAppend={
          <div className="flex items-center gap-2">
            <HeaderActionButton
              icon={RefreshCwIcon}
              label="Refresh server details"
              isLoading={isRefreshing}
              onClick={handleClickRefresh}
            />
            <HeaderActionButton
              icon={TerminalIcon}
              label={
                sshPort
                  ? `Open SSH terminal on :${sshPort}`
                  : 'Open SSH terminal'
              }
              onClick={handleClickSSH}
            />
            <HeaderActionButton
              icon={ScrollTextIcon}
              label="Open log viewer"
              onClick={handleClickLogs}
            />
          </div>
        }
        statuses={[
          {
            kind: 'status',
            icon: GlobeIcon,
            text: hostAddress,
          },
          {
            kind: 'status',
            icon: TerminalIcon,
            text: sshPort ? `SSH :${sshPort}` : 'SSH -',
          },
          {
            kind: 'status',
            icon: HardHatIcon,
            text: `Agent ${agentVersion}`,
          },
          {
            kind: 'status',
            icon: CloudIcon,
            text: cloudProvider || '-',
          },
        ]}
      />

      <SshTerminalBottomSheet
        open={isSshTerminalOpen}
        serverName={hostName}
        url={sshTerminalUrl}
        onOpenChange={setIsSshTerminalOpen}
      />
    </>
  );
});

function SshTerminalBottomSheet(props: {
  open: boolean;
  serverName: string;
  url: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { open, serverName, url, onOpenChange } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bottom-0 left-0 top-auto flex h-[75svh] max-h-[75svh] w-screen max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-2xl border-x-0 border-b-0 bg-background p-0 shadow-2xl duration-300 data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-bottom-full data-[state=open]:zoom-in-100 sm:rounded-b-none sm:rounded-t-2xl">
        <DialogClose
          className="group mx-auto mt-1 flex h-2.5 w-16 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          aria-label="Close SSH terminal"
          title="Close SSH terminal"
        >
          <span className="h-0.5 w-10 rounded-full bg-primary/25 transition-colors group-hover:bg-primary/45" />
        </DialogClose>

        <div className="min-h-0 flex-1 bg-black">
          <iframe
            className="h-full w-full border-0"
            src={url}
            title={`SSH terminal for ${serverName}`}
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeaderActionButton(props: {
  icon: LucideIcon;
  isLoading?: boolean;
  label: string;
  onClick: () => void;
}) {
  const { icon: Icon, isLoading = false, label, onClick } = props;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isLoading}
      className="group flex size-9 items-center justify-center rounded-lg border bg-background/45 text-primary/75 transition-colors hover:border-primary/35 hover:bg-border/35 hover:text-primary disabled:cursor-wait disabled:opacity-70"
      onClick={onClick}
    >
      <Icon className={cn('size-4 shrink-0', isLoading && 'animate-spin')} />
    </button>
  );
}
