import type { ComponentType, ReactNode } from 'react';

import {
  ActivityIcon,
  AppWindowIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CirclePlayIcon,
  CloudIcon,
  DatabaseIcon,
  GitBranchIcon,
  GlobeIcon,
  KeyRoundIcon,
  LifeBuoyIcon,
  NetworkIcon,
  RocketIcon,
  ScrollTextIcon,
  ServerIcon,
  UsersIcon,
} from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { DOCS_INTRO_EN } from '../-content/intro.en';
import { DOCS_INTRO_ID } from '../-content/intro.id';
import type { DocsIntroCapability, DocsIntroCopy } from '../-rules/intro';
import type { DocsSection } from '../../-rules/content';

const COPY: Record<string, DocsIntroCopy> = {
  en: DOCS_INTRO_EN,
  id: DOCS_INTRO_ID,
};

const CAPABILITY_ICONS: Record<
  DocsIntroCapability['key'],
  ComponentType<{ className?: string }>
> = {
  servers: ServerIcon,
  applications: AppWindowIcon,
  traffic: NetworkIcon,
  data: DatabaseIcon,
  activity: ActivityIcon,
  teams: UsersIcon,
};

const YOUTUBE_URL = 'https://www.youtube.com/@dpanel_id';

/**
 * The guide pages are built from the sky accent, so this page is too: the
 * same glow, the same icon tile, the same badge and the same call to action.
 */
const TONE = FLOW_ACCENTS.sky;

/** A section's eyebrow, in the accent the guide pages use for theirs. */
function IntroBadge(props: { children: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
        TONE.badge,
      )}
    >
      {props.children}
    </span>
  );
}

/** The icon tile shared with FlowHero and the numbered steps in a guide. */
function IntroTile(props: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border',
        TONE.icon,
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}

/** Section headings, one step above a guide's body headings. */
const SECTION_HEADING =
  'text-xl font-semibold tracking-tight text-primary sm:text-2xl';

/**
 * The icon that stands for a documentation section in the topic grid, by its
 * folder name under `src/documentations/<locale>/`. A section without an
 * entry here still gets a card, with the book mark.
 */
const MODULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'getting-started': RocketIcon,
  applications: AppWindowIcon,
  databases: DatabaseIcon,
  domains: GlobeIcon,
  logs: ScrollTextIcon,
  'load-balancers': NetworkIcon,
  networking: NetworkIcon,
  projects: CloudIcon,
  servers: ServerIcon,
  'ssh-keys': KeyRoundIcon,
  teams: UsersIcon,
  troubleshooting: LifeBuoyIcon,
};

/** The introduction copy for an app locale; unknown locales read in English. */
export function introCopyFor(locale?: string): DocsIntroCopy {
  const key = (locale ?? 'en').toLowerCase().split('-')[0] ?? 'en';
  return COPY[key] ?? DOCS_INTRO_EN;
}

export interface DocsIntroContentProps {
  /** App locale; anything unrecognised reads in English. */
  locale?: string;
  /** The guides to send readers on to. */
  sections?: DocsSection[];
}

/**
 * The product introduction a first-time visitor lands on.
 *
 * Written to answer, in order, the questions someone actually arrives with:
 * what is this, what would I do first, what is in it, and what happens to my
 * work if I leave. The last one is the one a sceptical reader cares about, so
 * it gets a section of its own rather than a footnote.
 */
export function DocsIntroContent(props: DocsIntroContentProps = {}) {
  const copy = introCopyFor(props.locale);
  const sections = props.sections ?? [];

  return (
    <div className="flex flex-col gap-4">
      <IntroHero copy={copy} />
      <IntroStart copy={copy} />
      <IntroCapabilities copy={copy} />
      <IntroOwnership copy={copy} />
      <IntroGuides copy={copy} sections={sections} />
      <IntroClosing copy={copy} />
    </div>
  );
}

/**
 * The documentation topics, one card each.
 *
 * A card stands for a subject a reader came to understand — servers,
 * applications, networking and the rest — and opens that subject at its
 * first page. New sections appear here as soon as their folder exists. Listing every page instead would turn the way in to the
 * documentation into the index rail this page deliberately does without.
 */
function IntroGuides(props: { copy: DocsIntroCopy; sections: DocsSection[] }) {
  const { copy, sections } = props;
  const topics = sections.flatMap((section) => {
    const first = section.pages[0];
    return first ? [{ first, section }] : [];
  });

  if (!topics.length) return null;

  return (
    <section aria-labelledby="docs-intro-guides" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <IntroBadge>{copy.guides.badge}</IntroBadge>
        <h2 id="docs-intro-guides" className={SECTION_HEADING}>
          {copy.guides.title}
        </h2>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(({ first, section }) => {
          const ModuleIcon = MODULE_ICONS[section.slug] ?? BookOpenIcon;

          return (
            <li key={section.slug} className="min-w-0">
              <a
                href={`/docs/${section.slug}/${first.slug}`}
                className={cn(
                  'flex h-full min-w-0 flex-col rounded-2xl border bg-card p-5 transition-all',
                  'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5',
                  'focus-visible:outline-none focus-visible:ring-2',
                  TONE.border,
                  TONE.ring,
                )}
              >
                <IntroTile>
                  <ModuleIcon className="size-4" />
                </IntroTile>
                <span className="mt-4 flex items-center gap-1.5 text-base font-semibold text-primary">
                  {section.title}
                  <ArrowRightIcon className="size-4 shrink-0" aria-hidden />
                </span>
                <span className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.summary}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function IntroHero(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <header className="relative overflow-hidden rounded-2xl border bg-card">
      <div className={cn('pointer-events-none absolute inset-0', TONE.glow)} />

      <div className="relative flex flex-col gap-5 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <IntroTile className="size-12 rounded-xl">
            <BookOpenIcon className="size-6" />
          </IntroTile>
          <IntroBadge>{copy.hero.badge}</IntroBadge>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {copy.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {copy.hero.subtitle}
          </p>
        </div>

        <IntroActions copy={copy} />

        <ul
          aria-label={copy.providers.title}
          className="flex flex-wrap items-center gap-2"
        >
          <li className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.providers.title}
          </li>
          {copy.providers.items.map((provider) => (
            <li key={provider}>
              <IntroBadge>{provider}</IntroBadge>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function IntroActions(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a href="/" className={flowCtaClassName('sky')}>
        {copy.hero.primaryCta}
      </a>
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          TONE.hover,
          TONE.ring,
        )}
      >
        <CirclePlayIcon className="size-4" />
        {copy.hero.secondaryCta}
      </a>
    </div>
  );
}

function IntroStart(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section aria-labelledby="docs-intro-start" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <IntroBadge>{copy.start.badge}</IntroBadge>
        <h2 id="docs-intro-start" className={SECTION_HEADING}>
          {copy.start.title}
        </h2>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {copy.start.steps.map((step, index) => (
          <li
            key={step.title}
            className="min-w-0 rounded-xl border bg-card p-5"
          >
            <IntroTile className="text-sm font-bold tabular-nums">
              {index + 1}
            </IntroTile>
            <h3 className="mt-4 text-base font-semibold text-primary">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function IntroCapabilities(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section aria-labelledby="docs-intro-capabilities" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <IntroBadge>{copy.capabilities.badge}</IntroBadge>
        <h2 id="docs-intro-capabilities" className={SECTION_HEADING}>
          {copy.capabilities.title}
        </h2>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {copy.capabilities.items.map((item) => {
          const Icon = CAPABILITY_ICONS[item.key];

          return (
            <li
              key={item.key}
              className="min-w-0 rounded-xl border bg-card p-5"
            >
              <IntroTile>
                <Icon className="size-4" />
              </IntroTile>
              <h3 className="mt-4 text-base font-semibold text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function IntroOwnership(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section
      aria-labelledby="docs-intro-ownership"
      className="rounded-2xl border bg-card p-5 sm:p-8"
    >
      <div className="max-w-3xl space-y-4">
        <IntroTile>
          <GitBranchIcon className="size-4" />
        </IntroTile>
        <IntroBadge>{copy.ownership.badge}</IntroBadge>
        <h2 id="docs-intro-ownership" className={SECTION_HEADING}>
          {copy.ownership.title}
        </h2>
        <p className="text-base leading-7 text-primary">
          {copy.ownership.lead}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {copy.ownership.body}
        </p>
      </div>
    </section>
  );
}

function IntroClosing(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <h2 className={SECTION_HEADING}>{copy.closing.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.closing.text}
          </p>
        </div>
        <IntroActions copy={copy} />
      </div>
    </section>
  );
}
