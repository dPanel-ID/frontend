import { useState } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  HouseIcon,
  TerminalIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

const REGISTER_COMMAND = 'sudo dnocs machine register';

/**
 * Third path of /servers/create: a machine with no public IP, such as a PC
 * or a home server behind a router, registers itself from its own terminal.
 */
export default function PrivateMachineCard() {
  const t = useDevetekTranslations('page.servers.create.chooser.private');
  const [openToaster] = useToaster();
  const [copied, setCopied] = useState(false);
  const tone = FLOW_ACCENTS.violet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REGISTER_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      openToaster({ variant: 'error', message: t('copyFailed') });
    }
  };

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
              <HouseIcon className="size-6" />
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
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t('limits')}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <ol className="flex flex-col gap-3">
            {(['cli', 'signIn', 'register'] as const).map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-500 dark:text-violet-300">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {t(`steps.${step}`)}
                </span>
              </li>
            ))}
          </ol>

          <div className="overflow-hidden rounded-xl border bg-neutral-950 text-neutral-100">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
              <span className="inline-flex min-w-0 items-center gap-2 text-xs text-neutral-400">
                <TerminalIcon className="size-3.5 shrink-0" />
                <span className="truncate">{t('runOnMachine')}</span>
              </span>
              <Button
                size="sm"
                buttonStyle="ghost"
                buttonColor="secondary"
                className="h-7 shrink-0 text-neutral-200 hover:bg-white/10 hover:text-white"
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
            <pre className="overflow-auto p-3 font-mono text-xs leading-relaxed">
              {REGISTER_COMMAND}
            </pre>
          </div>

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
