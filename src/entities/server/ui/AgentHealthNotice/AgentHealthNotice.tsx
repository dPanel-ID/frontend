import { useEffect, useState } from 'react';

import {
  ArrowUpCircleIcon,
  CheckIcon,
  CopyIcon,
  LoaderCircleIcon,
  UnplugIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import { agentHealth } from '../../lib/agentHealth';
import type { ServerCard } from '../../rules/schema';

export interface AgentHealthNoticeProps {
  server: Pick<ServerCard, 'id' | 'agent' | 'state' | 'host'>;
  /**
   * Shows the Upgrade button. Only the server's owner may upgrade; an
   * administrator's list reads other workspaces' servers and gets the
   * instructions alone.
   */
  canUpgrade?: boolean;
  className?: string;
}

/**
 * What the server's agent needs from whoever runs the server: a restart when
 * it stopped reporting, an upgrade when a newer release exists. Renders
 * nothing when the agent is fine.
 */
export function AgentHealthNotice(props: AgentHealthNoticeProps) {
  const { canUpgrade = false, className, server } = props;
  const t = useDevetekTranslations('entities.server.agentHealth');
  const locale = useDevetekLocale();
  const [openToaster] = useToaster();
  const [upgrading, setUpgrading] = useState(false);
  const [queuedVersion, setQueuedVersion] = useState<string>();

  const now = useNow();
  const health = agentHealth(server, now);
  if (!health.quietSince && !health.upgrade) return null;

  // Every agent runs as dpanel-agent.service (backend
  // docs/architecture/agent-layout.md).
  const unit = 'dpanel-agent';

  const handleUpgrade = async () => {
    setUpgrading(true);
    const response = await ApiServer.AgentUpgrade.$Id.doPost({ id: server.id });
    setUpgrading(false);
    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: t('upgrade.failedTitle'),
        message: getApiErrorDetail(response.error),
      });
      return;
    }
    setQueuedVersion(response.version ?? health.upgrade?.next);
    openToaster({
      variant: 'success',
      message: t('upgrade.queued', {
        version: response.version ?? health.upgrade?.next ?? '',
      }),
    });
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {health.quietSince && (
        <section
          role="status"
          className="grid gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100"
        >
          <p className="flex items-start gap-2 font-semibold">
            <UnplugIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {t('quiet.title', {
                distance: getDistanceFromNow(health.quietSince, locale),
              })}
            </span>
          </p>
          <p className="text-xs leading-relaxed opacity-90">
            {t('quiet.body', {
              time: health.quietSince.toLocaleString(locale),
            })}
          </p>
          <CommandLine command={`sudo systemctl restart ${unit}`} />
          <p className="text-xs leading-relaxed opacity-80">
            {t('quiet.check', { unit })}
          </p>
        </section>
      )}

      {health.upgrade && (
        <section className="flex flex-col gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 text-sm text-sky-900 sm:flex-row sm:items-center sm:justify-between dark:text-sky-100">
          <div className="grid min-w-0 gap-1">
            <p className="flex items-start gap-2 font-semibold">
              <ArrowUpCircleIcon
                className="mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              <span>
                {t('upgrade.title', {
                  current: health.upgrade.current || '?',
                  next: health.upgrade.next,
                })}
              </span>
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              {queuedVersion
                ? t('upgrade.queuedBody', { version: queuedVersion })
                : health.upgrade.needsSetup
                  ? t('upgrade.setupBody', { next: health.upgrade.next })
                  : t('upgrade.body')}
            </p>
          </div>
          {canUpgrade &&
            !health.upgrade.needsSetup &&
            !health.quietSince &&
            !queuedVersion && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleUpgrade();
                }}
                disabled={upgrading}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
              >
                {upgrading ? (
                  <LoaderCircleIcon
                    className="size-3.5 animate-spin"
                    aria-hidden
                  />
                ) : (
                  <ArrowUpCircleIcon className="size-3.5" aria-hidden />
                )}
                {t('upgrade.action', { next: health.upgrade.next })}
              </button>
            )}
        </section>
      )}
    </div>
  );
}

/** A shell command with a copy button. */
function CommandLine(props: { command: string }) {
  const { command } = props;
  const t = useDevetekTranslations('entities.server.agentHealth');
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-400/30 bg-background/70 px-2.5 py-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
        {command}
      </code>
      <button
        type="button"
        aria-label={t('copy')}
        title={t('copy')}
        onClick={(event) => {
          event.stopPropagation();
          void navigator.clipboard.writeText(command).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <CheckIcon className="size-3.5" aria-hidden />
        ) : (
          <CopyIcon className="size-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}

/** The current time, refreshed every minute so "stopped reporting" appears
 * on a page left open. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
