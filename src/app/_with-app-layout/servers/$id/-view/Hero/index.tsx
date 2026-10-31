import { useState } from 'react';

import { Link, useParams } from '@tanstack/react-router';
import {
  BuildingIcon,
  CircleAlertIcon,
  Clock3Icon,
  HardHatIcon,
  KeyRoundIcon,
  LoaderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TerminalIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import {
  isCloudServer,
  serverDisplayName,
} from '@/entities/server/lib/describeServer';
import { getServerErrorSummary } from '@/entities/server/lib/error-detail';
import { ServerCreator } from '@/entities/server/ui/ServerCreator';
import { ServerErrorDialog } from '@/entities/server/ui/ServerErrorDialog';
import { ServerIdentity } from '@/entities/server/ui/ServerIdentity';
import { ServerStatusPill } from '@/entities/server/ui/ServerStatusPill';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { useEmit } from '../../-model/events';
import { useServerDataModel } from '../../-model/server-data';

import { HeroStates } from './_States';
import { SshTerminalSheet } from './SshTerminalSheet';

type ServerDataModelSource = ReturnType<typeof useServerDataModel>;

const [guard, useServerDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: HeroStates.Loading,
  fallbackError: HeroStates.Failed,
})(couple(useServerDataModel, (s) => (s as ServerDataModelSource).detail));

/**
 * Who this server is and what can be done to it: identity, state, the facts
 * that matter at a glance, and the lifecycle actions.
 */
export default guard(function Hero() {
  const emit = useEmit();
  const t = useDevetekTranslations('page.serverDetail.hero');
  const tSidebar = useDevetekTranslations();
  const locale = useDevetekLocale();
  const { id } = useParams({ from: '/_with-app-layout/servers/$id/' });
  const [server] = useServerDetail((s) => [s]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const name = serverDisplayName(server);
  const status = server.state.status;
  const busy = status === 'progress';
  const accent = isCloudServer(server) ? FLOW_ACCENTS.sky : FLOW_ACCENTS.violet;
  const sshUser = server.ssh.defaultUser || 'root';
  const sshHint = t('sshHint', {
    user: sshUser,
    host: server.host.address || name,
    port: server.ssh.port || 22,
  });

  useMetaTags({ title: `${name} | dnocs` }, [name]);

  const handleClickRefresh = () => {
    setIsRefreshing(true);
    emit('@servers::detail/server-detail-refresh', null);
    emit('@servers::detail/server-stats-refresh', null);
    emit('@servers::detail/server-services-refresh', null);
    emit('@servers::detail/server-modules-refresh', null);
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn('pointer-events-none absolute inset-0', accent.glow)}
      />

      <div className="relative flex flex-col gap-4 p-5 sm:p-6">
        <Breadcrumb
          items={[
            { text: tSidebar('sidebar.dashboard'), url: '/dashboard' },
            { text: tSidebar('page.servers.headerTitle'), url: '/servers' },
          ]}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <ServerIdentity
            server={server}
            size="lg"
            meta
            trailing={
              <ServerStatusPill
                state={server.state}
                size="md"
                onClick={() =>
                  emit('@servers::detail/server-status-info', null)
                }
              />
            }
          />

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ActionIcon
              icon={RefreshCwIcon}
              title={t('refresh')}
              spinning={isRefreshing}
              onClick={handleClickRefresh}
            />
            <ActionIcon
              icon={PencilIcon}
              title={t('edit')}
              disabled={busy}
              onClick={() => emit('@servers::detail/server-edit', null)}
            />
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              title={sshHint}
              onClick={() => setIsTerminalOpen(true)}
            >
              <TerminalIcon />
              {t('connectSsh')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('more')}
                  title={t('more')}
                  className="inline-flex size-9 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <MoreHorizontalIcon className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={busy}
                  onClick={() =>
                    emit('@servers::detail/server-reinstall', null)
                  }
                >
                  <RotateCcwIcon className="size-4" />
                  {t('reinstall')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    emit('@servers::detail/server-migrate-ownership', null)
                  }
                >
                  <BuildingIcon className="size-4" />
                  {t('migrateOwnership')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => emit('@servers::detail/server-delete', null)}
                >
                  <Trash2Icon className="size-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
          <Fact icon={KeyRoundIcon} value={sshHint} mono />
          <Fact
            icon={HardHatIcon}
            value={
              server.agent.version
                ? t('agent', { version: server.agent.version })
                : t('noAgent')
            }
          />
          {server.ownership.team ? (
            <Fact icon={BuildingIcon} value={server.ownership.team} />
          ) : (
            !server.creator && (
              <Fact icon={UserIcon} value={server.ownership.owner} />
            )
          )}
          <ServerCreator creator={server.creator} />
          <Fact
            icon={Clock3Icon}
            value={t('created', {
              when: getDistanceFromNow(server.timestamp.created, locale),
            })}
          />
        </div>

        {busy && (
          <div className="flex flex-col gap-3 rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-200">
              <LoaderIcon className="size-4 shrink-0 animate-spin" />
              <span>{t('setupRunning')}</span>
            </div>
            <Link
              to="/servers/$id"
              params={{ id }}
              search={{ tab: 'logs' }}
              className="shrink-0 font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-200"
            >
              {t('followLogs')}
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-300" />
              <div className="min-w-0">
                <p className="font-bold text-red-700 dark:text-red-200">
                  {t('setupFailed')}
                </p>
                <p className="mt-0.5 line-clamp-2 break-words text-red-700/80 dark:text-red-100/75">
                  {getServerErrorSummary(server.state) || t('noErrorDetail')}
                </p>
              </div>
            </div>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              className="shrink-0 border-red-400/30 text-red-700 hover:bg-red-500/15 dark:text-red-100"
              onClick={() => setIsErrorDialogOpen(true)}
            >
              {t('viewDetail')}
            </Button>
          </div>
        )}
      </div>

      <SshTerminalSheet
        open={isTerminalOpen}
        serverId={server.id}
        serverName={name}
        onOpenChange={setIsTerminalOpen}
      />
      <ServerErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        serverName={name}
        state={server.state}
      />
    </header>
  );
});

function Fact(props: { icon: LucideIcon; value?: string; mono?: boolean }) {
  const { icon: Icon, mono, value } = props;
  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" />
      <span className={cn('truncate', mono && 'font-mono')}>{value}</span>
    </span>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  disabled?: boolean;
  spinning?: boolean;
  onClick: () => void;
}) {
  const { disabled, icon: Icon, onClick, spinning, title } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={disabled || spinning}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className={cn('size-4', spinning && 'animate-spin')} />
    </button>
  );
}
