import type { FormEvent } from 'react';
import { useId, useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CpuIcon,
  LaptopIcon,
  MonitorIcon,
  PlugZapIcon,
  RotateCcwIcon,
  ServerIcon,
  SmartphoneIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import type { AgentInstallPhase } from '../../-lib/agent-install';
import { schemaAgentServerName } from '../../-rules/agent-install';
import useAgentInstall from '../../-usecase/use-agent-install';

import CommandBox from './CommandBox';

const REGISTER_COMMAND = 'sudo dnocs machine register';
const PRINT_COMMAND = 'dnocs server agent-install';

const PHASE_TONES: Record<AgentInstallPhase, StatusTone> = {
  waiting: 'info',
  started: 'info',
  ready: 'success',
  failed: 'danger',
  expired: 'warning',
};

/** The kinds of machine a person may want to add, asked before the command. */
type MachineKind = 'linux' | 'windows' | 'raspberry' | 'mac' | 'mobile';

const MACHINE_KINDS: Array<{ kind: MachineKind; icon: LucideIcon }> = [
  { kind: 'linux', icon: ServerIcon },
  { kind: 'windows', icon: MonitorIcon },
  { kind: 'raspberry', icon: CpuIcon },
  { kind: 'mac', icon: LaptopIcon },
  { kind: 'mobile', icon: SmartphoneIcon },
];

/** The agent runs on these; Macs and phones cannot run it. */
const SUPPORTED_KINDS: MachineKind[] = ['linux', 'windows', 'raspberry'];

/** Windows joins through Ubuntu in WSL2 with systemd turned on. */
const WSL_INSTALL_COMMAND = 'wsl --install -d Ubuntu';
const WSL_SYSTEMD_COMMAND =
  "printf '[boot]\\nsystemd=true\\n' | sudo tee /etc/wsl.conf";
const WSL_RESTART_COMMAND = 'wsl --shutdown';

/**
 * Recommended path of /servers/create: any server the user already has (a
 * VPS, a home machine, a VM behind a router) joins with one command that the
 * web hands out. The dPanel agent connects out, so the server needs no
 * public IP, no open port and no dPanel SSH key, and the machine needs no
 * dnocs or sign-in. The dnocs way stays available below.
 */
export default function AgentConnectCard() {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');
  const tone = FLOW_ACCENTS.violet;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card p-6',
        tone.border,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0', tone.glow)} />

      <div className="relative grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                'flex size-12 items-center justify-center rounded-xl border',
                tone.icon,
              )}
            >
              <PlugZapIcon className="size-6" />
            </span>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-semibold',
                tone.badge,
              )}
            >
              {t('badge')}
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t('description')}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {(['publicIP', 'port', 'key'] as const).map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm font-medium leading-snug"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-violet-500 dark:text-violet-300" />
                {t(`highlights.${item}`)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t('noExtras')}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t('requirements')}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          <MachineInstall />

          <CliAlternative />

          <Link
            to="/docs/$section/$page"
            params={{ section: 'servers', page: 'register-a-private-machine' }}
            className="group/cta inline-flex items-center gap-1.5 self-start text-sm font-semibold text-violet-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 dark:text-violet-300"
          >
            {t('guide')}
            <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Asks what the machine is before handing out the command: Linux gets it
 * right away, Windows the WSL2 steps first, a Raspberry Pi the 64-bit note,
 * and a Mac or a phone an honest "not supported" with what to use instead.
 */
function MachineInstall() {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');
  const groupId = useId();
  const [kind, setKind] = useState<MachineKind | null>(null);
  const supported = kind != null && SUPPORTED_KINDS.includes(kind);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p id={groupId} className="text-sm font-semibold">
          {t('machine.title')}
        </p>
        <div
          role="radiogroup"
          aria-labelledby={groupId}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {MACHINE_KINDS.map(({ icon: Icon, kind: option }) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={kind === option}
              onClick={() => setKind(option)}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-xl border bg-background/60 px-3 py-2 text-left text-sm font-medium transition-colors hover:border-violet-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50',
                kind === option &&
                  'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-200',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="min-w-0">{t(`machine.options.${option}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {kind === 'windows' && <WindowsSteps />}
      {kind === 'raspberry' && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
          {t.rich('machine.raspberry', {
            code: (chunks) => (
              <code className="rounded bg-border/50 px-1 py-0.5 font-mono text-xs">
                {chunks}
              </code>
            ),
          })}
        </p>
      )}
      {(kind === 'mac' || kind === 'mobile') && <Unsupported kind={kind} />}

      {supported && (
        <>
          <ol className="flex flex-col gap-3">
            {(['name', 'run', 'ready'] as const).map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-500 dark:text-violet-300">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {t(
                    kind === 'windows' && step === 'run'
                      ? 'steps.runWsl'
                      : `steps.${step}`,
                  )}
                </span>
              </li>
            ))}
          </ol>
          <InstallCommand />
        </>
      )}
    </div>
  );
}

/** Ubuntu in WSL2 with systemd, the one way a Windows PC runs the agent. */
function WindowsSteps() {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');
  const steps = [
    {
      key: 'install',
      command: WSL_INSTALL_COMMAND,
      where: t('windows.powershell'),
    },
    {
      key: 'systemd',
      command: WSL_SYSTEMD_COMMAND,
      where: t('windows.ubuntu'),
    },
    {
      key: 'restart',
      command: WSL_RESTART_COMMAND,
      where: t('windows.powershell'),
    },
  ] as const;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background/60 p-4">
      <p className="text-sm font-semibold">{t('windows.title')}</p>
      {steps.map((step, index) => (
        <div key={step.key} className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {index + 1}. {t(`windows.steps.${step.key}`)}
          </p>
          <CommandBox
            command={step.command}
            label={step.where}
            copyLabel={t('copy')}
            copiedLabel={t('copied')}
            copyFailedMessage={t('copyFailed')}
          />
        </div>
      ))}
      <p className="text-sm leading-relaxed text-muted-foreground">
        4. {t('windows.steps.run')}
      </p>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-700 dark:text-amber-200">
        <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
        {t('windows.stayOn')}
      </p>
    </div>
  );
}

/** A Mac or a phone cannot run the agent; say so and offer what works. */
function Unsupported({ kind }: { kind: 'mac' | 'mobile' }) {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
      <p className="flex items-start gap-2 font-semibold">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
        {t(`unsupported.${kind}.title`)}
      </p>
      <p className="leading-relaxed opacity-90">
        {t(`unsupported.${kind}.body`)}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Link
          to="/servers/create/vm-instant"
          className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
        >
          {t('unsupported.cloud')}
          <ArrowRightIcon className="size-4" />
        </Link>
        <Link
          to="/docs/$section/$page"
          params={{ section: 'servers', page: 'register-a-private-machine' }}
          className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
        >
          {t('unsupported.guide')}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}

/** Name the server, get the one-line command, then watch it connect. */
function InstallCommand() {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');
  const locale = useDevetekLocale();
  const nameId = useId();
  const hintId = useId();
  const [name, setName] = useState('');
  const { isRequesting, phase, progress, request, reset, ticket } =
    useAgentInstall();

  const nameValid = schemaAgentServerName.safeParse(name).success;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schemaAgentServerName.safeParse(name);
    if (!parsed.success) return;
    void request(parsed.data);
  };

  if (!ticket || !phase) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border bg-background/60 p-4"
      >
        <label htmlFor={nameId} className="text-sm font-semibold">
          {t('install.nameLabel')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={nameId}
            autoComplete="off"
            spellCheck={false}
            maxLength={63}
            placeholder={t('install.namePlaceholder')}
            value={name}
            disabled={isRequesting}
            aria-invalid={!nameValid}
            aria-describedby={hintId}
            onChange={(event) => setName(event.target.value)}
            className="min-w-0 flex-1"
          />
          <button
            type="submit"
            className={flowCtaClassName('violet', 'shrink-0')}
            disabled={!nameValid || isRequesting}
          >
            {isRequesting ? (
              <Spinner className="size-4" />
            ) : (
              <PlugZapIcon className="size-4" />
            )}
            {isRequesting ? t('install.getting') : t('install.get')}
          </button>
        </div>
        <p
          id={hintId}
          className={cn(
            'text-xs leading-relaxed',
            nameValid
              ? 'text-muted-foreground'
              : 'font-semibold text-destructive',
          )}
        >
          {nameValid ? t('install.nameHint') : t('install.nameInvalid')}
        </p>
      </form>
    );
  }

  const expiresAt = ticket.expiresAt
    ? ticket.expiresAt.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="flex flex-col gap-3">
      {phase !== 'expired' && (
        <>
          <CommandBox
            command={ticket.command}
            label={t('runOnMachine')}
            copyLabel={t('copy')}
            copiedLabel={t('copied')}
            copyFailedMessage={t('copyFailed')}
          />
          <CommandVariants
            rootCommand={ticket.rootCommand}
            wgetCommand={ticket.wgetCommand}
          />
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ClockIcon className="mt-0.5 size-3.5 shrink-0" />
            {expiresAt
              ? t('install.expiry', { time: expiresAt })
              : t('install.expiryNoTime')}
          </p>
        </>
      )}

      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-3 rounded-xl border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-2">
          <StatusPill
            tone={PHASE_TONES[phase]}
            label={t(`install.phase.${phase}`)}
            pulse={phase === 'waiting' || phase === 'started'}
            className="shrink-0"
          />
          <span className="min-w-0 text-sm leading-relaxed text-muted-foreground">
            {phase === 'failed' && progress?.error
              ? progress.error
              : t(`install.message.${phase}`, { name: ticket.serverName })}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {(phase === 'expired' || phase === 'failed') && (
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={reset}
            >
              <RotateCcwIcon className="size-3.5" />
              {t('install.another')}
            </Button>
          )}
          <Link
            to="/servers/$id"
            params={{ id: ticket.serverId }}
            className={
              phase === 'ready'
                ? flowCtaClassName('violet')
                : 'inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 dark:text-violet-300'
            }
          >
            {t('install.openServer')}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The same command for a root shell without sudo, or without curl. */
function CommandVariants(props: { rootCommand: string; wgetCommand: string }) {
  const { rootCommand, wgetCommand } = props;
  const t = useDevetekTranslations('page.servers.create.chooser.agent');
  if (!rootCommand && !wgetCommand) return null;

  return (
    <details className="group rounded-xl border bg-background/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 [&::-webkit-details-marker]:hidden">
        {t('install.variants.summary')}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 border-t px-4 py-3">
        {rootCommand && (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('install.variants.root')}
            </p>
            <CommandBox
              command={rootCommand}
              label={t('runOnMachine')}
              copyLabel={t('copy')}
              copiedLabel={t('copied')}
              copyFailedMessage={t('copyFailed')}
            />
          </>
        )}
        {wgetCommand && (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('install.variants.wget')}
            </p>
            <CommandBox
              command={wgetCommand}
              label={t('runOnMachine')}
              copyLabel={t('copy')}
              copiedLabel={t('copied')}
              copyFailedMessage={t('copyFailed')}
            />
          </>
        )}
      </div>
    </details>
  );
}

/** The dnocs way, for people who already use the command line tool. */
function CliAlternative() {
  const t = useDevetekTranslations('page.servers.create.chooser.agent');

  return (
    <details className="group rounded-xl border bg-background/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 [&::-webkit-details-marker]:hidden">
        {t('cli.summary')}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-3 border-t px-4 py-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('cli.register')}
        </p>
        <CommandBox
          command={REGISTER_COMMAND}
          label={t('runOnMachine')}
          copyLabel={t('copy')}
          copiedLabel={t('copied')}
          copyFailedMessage={t('copyFailed')}
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.rich('cli.print', {
            command: PRINT_COMMAND,
            code: (chunks) => (
              <code className="rounded bg-border/50 px-1 py-0.5 font-mono text-xs">
                {chunks}
              </code>
            ),
          })}
        </p>
      </div>
    </details>
  );
}
