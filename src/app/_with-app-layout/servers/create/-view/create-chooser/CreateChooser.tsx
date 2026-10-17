import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CloudLightningIcon,
  LayoutGridIcon,
  ServerCogIcon,
  SparklesIcon,
  TerminalSquareIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';
import { ApiCloud } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  CloudProviderLogo,
  cloudProviderRank,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';

/**
 * Landing of /servers/create: a clear choice between launching a cloud VM,
 * with live shortcuts per provider, and connecting an existing server.
 */
export default function CreateChooser() {
  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <CloudPathCard />

        <PathCard
          className="lg:col-span-2"
          accent="violet"
          icon={ServerCogIcon}
          badge={t('page.servers.create.chooser.manual.badge')}
          title={t('page.servers.create.chooser.manual.title')}
          description={t('page.servers.create.chooser.manual.description')}
          duration={t('page.servers.create.chooser.manual.duration')}
          cta={
            <Link
              to="/servers/create"
              search={{ mode: 'manual' }}
              className={ctaClassName('violet')}
            >
              {t('page.servers.create.chooser.manual.cta')}
              <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          }
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('page.servers.create.chooser.manual.requirementsTitle')}
          </p>
          <ol className="flex flex-col gap-3">
            {(['ssh', 'key', 'agent'] as const).map((item, index) => (
              <li key={item} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-500 dark:text-violet-300">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {t(`page.servers.create.chooser.manual.requirements.${item}`)}
                </span>
              </li>
            ))}
          </ol>
        </PathCard>
      </div>

      <WhatHappensNext />
    </div>
  );
}

function CloudPathCard() {
  const t = useDevetekTranslations();

  return (
    <PathCard
      className="lg:col-span-3"
      accent="sky"
      icon={CloudLightningIcon}
      badge={t('page.servers.create.chooser.cloud.badge')}
      title={t('page.servers.create.chooser.cloud.title')}
      description={t('page.servers.create.chooser.cloud.description')}
      duration={t('page.servers.create.chooser.cloud.duration')}
      cta={
        <Link to="/servers/create/vm-instant" className={ctaClassName('sky')}>
          {t('page.servers.create.chooser.cloud.cta')}
          <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
        </Link>
      }
    >
      <ProviderShortcuts />

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {(['ubuntu', 'network', 'setup'] as const).map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-snug text-muted-foreground"
          >
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-sky-500 dark:text-sky-400" />
            {t(`page.servers.create.chooser.cloud.features.${item}`)}
          </li>
        ))}
      </ul>
    </PathCard>
  );
}

/** Live providers that can create VMs; each opens the VM form preselected. */
function ProviderShortcuts() {
  const t = useDevetekTranslations();
  const [response] = ApiCloud.Project.Providers.useGet({});
  const providers = vmProviders(response);

  if (response.$status === 'loading' && providers.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[3.75rem] animate-pulse rounded-xl border bg-background/40"
          />
        ))}
      </div>
    );
  }

  if (providers.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('page.servers.create.chooser.cloud.providersTitle')}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {providers.map((provider) => {
          const id = providerID(provider);
          const label =
            getCloudProviderLabel(id) || provider.name || provider.id || id;

          return (
            <Link
              key={id}
              to="/servers/create/vm-instant"
              search={{ provider: id }}
              aria-label={t('page.servers.create.chooser.cloud.launchOn', {
                provider: label,
              })}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border bg-background/60 p-2.5 transition-all sm:flex-row sm:items-center sm:gap-3',
                'hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-sky-500/5 hover:shadow-lg hover:shadow-sky-500/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
              )}
            >
              <CloudProviderLogo provider={id} fallbackLabel={label} />
              <span className="min-w-0 text-sm font-medium leading-tight sm:truncate">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const NEXT_STEPS: Array<{
  key: 'create' | 'setup' | 'manage';
  icon: LucideIcon;
}> = [
  { key: 'create', icon: SparklesIcon },
  { key: 'setup', icon: TerminalSquareIcon },
  { key: 'manage', icon: LayoutGridIcon },
];

function WhatHappensNext() {
  const t = useDevetekTranslations();

  return (
    <section className="rounded-2xl border bg-card/60 p-5">
      <h2 className="text-sm font-semibold">
        {t('page.servers.create.chooser.next.title')}
      </h2>
      <ol className="mt-4 grid gap-5 md:grid-cols-3">
        {NEXT_STEPS.map(({ icon: Icon, key }, index) => (
          <li key={key} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('page.servers.create.chooser.next.step', {
                  number: index + 1,
                })}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {t(`page.servers.create.chooser.next.${key}.title`)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`page.servers.create.chooser.next.${key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

type Accent = 'sky' | 'violet';

const ACCENTS: Record<
  Accent,
  { glow: string; border: string; icon: string; badge: string; cta: string }
> = {
  sky: {
    glow: 'bg-[radial-gradient(120%_80%_at_0%_0%,rgba(56,189,248,0.16),transparent_60%)]',
    border: 'hover:border-sky-400/40',
    icon: 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
    badge: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    cta: 'bg-sky-500 text-white hover:bg-sky-400 dark:bg-sky-400 dark:text-sky-950 dark:hover:bg-sky-300 focus-visible:ring-sky-400',
  },
  violet: {
    glow: 'bg-[radial-gradient(120%_80%_at_0%_0%,rgba(167,139,250,0.14),transparent_60%)]',
    border: 'hover:border-violet-400/40',
    icon: 'border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    badge:
      'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    cta: 'bg-violet-500 text-white hover:bg-violet-400 dark:bg-violet-400 dark:text-violet-950 dark:hover:bg-violet-300 focus-visible:ring-violet-400',
  },
};

function ctaClassName(accent: Accent) {
  return cn(
    'group/cta inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    ACCENTS[accent].cta,
  );
}

function PathCard(props: {
  accent: Accent;
  badge: string;
  children: ReactNode;
  className?: string;
  cta: ReactNode;
  description: string;
  duration: string;
  icon: LucideIcon;
  title: string;
}) {
  const {
    accent,
    badge,
    children,
    className,
    cta,
    description,
    duration,
    icon: Icon,
    title,
  } = props;
  const tone = ACCENTS[accent];

  return (
    <section
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-colors',
        tone.border,
        className,
      )}
    >
      <div className={cn('pointer-events-none absolute inset-0', tone.glow)} />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-12 items-center justify-center rounded-xl border',
            tone.icon,
          )}
        >
          <Icon className="size-6" />
        </span>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs font-semibold',
            tone.badge,
          )}
        >
          {badge}
        </span>
      </div>

      <div className="relative mt-5">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="relative mt-6 flex-1">{children}</div>

      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          {duration}
        </span>
        {cta}
      </div>
    </section>
  );
}

function providerID(provider: DTOs.CloudProviderContractV1) {
  return provider.id || provider.aliases?.[0] || provider.name || '';
}

/** Enabled providers that offer VM creation, in the order the API returns. */
function vmProviders(response: {
  $status: string;
  providers?: DTOs.CloudProviderContractV1[];
  prevData?: DTOs.CloudProviderContractListV1;
}) {
  const providers =
    response.$status === 'success'
      ? response.providers
      : response.$status === 'loading'
        ? response.prevData?.providers
        : [];

  return (providers ?? [])
    .filter(
      (provider) =>
        provider.enabled !== false &&
        Boolean(providerID(provider)) &&
        (provider.resource_contracts ?? []).some(
          (contract) =>
            contract.resource === 'vm' && contract.action === 'create',
        ),
    )
    .sort(
      (a, b) =>
        cloudProviderRank(providerID(a)) - cloudProviderRank(providerID(b)),
    );
}
