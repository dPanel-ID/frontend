import type { ComponentType, ReactNode } from 'react';

import {
  AppWindowIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BookOpenIcon,
  BoxesIcon,
  CheckIcon,
  CirclePlayIcon,
  CloudIcon,
  CodeXmlIcon,
  DatabaseIcon,
  GitBranchIcon,
  GlobeIcon,
  HouseIcon,
  KeyRoundIcon,
  LaptopIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  NetworkIcon,
  RocketIcon,
  ScrollTextIcon,
  ServerCogIcon,
  ServerIcon,
  Settings2Icon,
  Share2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { DOCS_INTRO_EN } from '../-content/intro.en';
import { DOCS_INTRO_ID } from '../-content/intro.id';
import type {
  DocsIntroCapability,
  DocsIntroCopy,
  DocsIntroDataColumn,
  DocsIntroNode,
  DocsIntroProblem,
} from '../-rules/intro';
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
  traffic: GlobeIcon,
  data: DatabaseIcon,
  assistant: SparklesIcon,
  logs: ScrollTextIcon,
  clusters: BoxesIcon,
  teams: UsersIcon,
};

const PROBLEM_ICONS: Record<
  DocsIntroProblem['key'],
  ComponentType<{ className?: string }>
> = {
  owner: StoreIcon,
  developer: CodeXmlIcon,
  operator: ServerCogIcon,
  team: UsersIcon,
};

const DATA_ICONS: Record<
  DocsIntroDataColumn['key'],
  ComponentType<{ className?: string }>
> = {
  server: ServerIcon,
  dpanel: ShieldCheckIcon,
  outside: Share2Icon,
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
  ai: SparklesIcon,
  applications: AppWindowIcon,
  clusters: BoxesIcon,
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
  tutorials: ListChecksIcon,
  workers: Settings2Icon,
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
 * Written for everyone from a shop owner to a sysadmin, and in the order the
 * questions arrive: what is this, what problem does it solve for me, how does
 * it work, can I use my own machines at home, how do I start, what is in it, what happens to my data, and what
 * happens to my work if I leave. The last two are what a sceptical reader
 * cares about, so each gets a section of its own rather than a footnote.
 */
export function DocsIntroContent(props: DocsIntroContentProps = {}) {
  const copy = introCopyFor(props.locale);
  const sections = props.sections ?? [];

  return (
    <div className="flex flex-col gap-4">
      <IntroHero copy={copy} />
      <IntroProblems copy={copy} />
      <IntroHowItWorks copy={copy} />
      <IntroHomelab copy={copy} />
      <IntroStart copy={copy} />
      <IntroCapabilities copy={copy} />
      <IntroData copy={copy} />
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

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

/** A section's eyebrow and heading, the same on every section. */
function IntroHeading(props: {
  id: string;
  badge: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl space-y-2">
      <IntroBadge>{props.badge}</IntroBadge>
      <h2 id={props.id} className={SECTION_HEADING}>
        {props.title}
      </h2>
      {props.lead && (
        <p className="text-base leading-7 text-muted-foreground">
          {props.lead}
        </p>
      )}
    </div>
  );
}

/**
 * Who dPanel is for, as the problem each reader arrives with and what dPanel
 * does about it. Speaks to a shop owner and a sysadmin in the same grid.
 */
function IntroProblems(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section aria-labelledby="docs-intro-problems" className="space-y-5">
      <IntroHeading
        id="docs-intro-problems"
        badge={copy.problems.badge}
        title={copy.problems.title}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {copy.problems.items.map((item) => {
          const Icon = PROBLEM_ICONS[item.key];

          return (
            <li
              key={item.key}
              className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <IntroTile>
                  <Icon className="size-4" />
                </IntroTile>
                <h3 className="text-base font-semibold text-primary">
                  {item.who}
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {copy.problems.problemLabel}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.problem}
                </p>
              </div>
              <div className="mt-auto space-y-1 border-t pt-4">
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide',
                    TONE.text,
                  )}
                >
                  {copy.problems.answerLabel}
                </p>
                <p className="text-sm leading-6 text-primary">{item.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One box of the picture: a title and what lives in it. */
function IntroNode(props: {
  node: DocsIntroNode;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  const { node, highlight } = props;
  const Icon = props.icon;

  return (
    <div
      className={cn(
        'min-w-0 rounded-xl border bg-card p-4',
        highlight && TONE.selected,
      )}
    >
      <div className="flex items-center gap-2">
        <IntroTile className="size-8">
          <Icon className="size-4" />
        </IntroTile>
        <h3 className="text-base font-semibold text-primary">{node.title}</h3>
      </div>
      <ul className="mt-3 space-y-1.5">
        {node.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
          >
            <span
              className={cn(
                'mt-2 size-1.5 shrink-0 rounded-full bg-current',
                TONE.text,
              )}
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A link between two boxes. Across on wide screens, where the boxes sit side
 * by side, and up or down on a phone, where they stack.
 */
function IntroLink(props: { label: string; towards: 'left' | 'right' }) {
  const Across = props.towards === 'right' ? ArrowRightIcon : ArrowLeftIcon;
  const Stacked = props.towards === 'right' ? ArrowDownIcon : ArrowUpIcon;

  return (
    <div className="flex items-center justify-center gap-2 py-1 lg:flex-col lg:px-1 lg:py-0">
      <Stacked className={cn('size-4 lg:hidden', TONE.text)} aria-hidden />
      <Across className={cn('hidden size-5 lg:block', TONE.text)} aria-hidden />
      <span className="text-center text-xs font-medium text-muted-foreground lg:max-w-24">
        {props.label}
      </span>
    </div>
  );
}

/**
 * The high-level picture of dPanel: you, dPanel and your servers, the
 * services around them, then the same picture in four sentences. The
 * sentences double as the picture's text alternative.
 */
function IntroHowItWorks(props: { copy: DocsIntroCopy }) {
  const { copy } = props;
  const how = copy.howItWorks;

  return (
    <section
      aria-labelledby="docs-intro-how"
      className="space-y-5 rounded-2xl border bg-card p-5 sm:p-8"
    >
      <IntroHeading
        id="docs-intro-how"
        badge={how.badge}
        title={how.title}
        lead={how.lead}
      />

      <figure className="space-y-3" aria-describedby="docs-intro-how-steps">
        <div className="grid items-center gap-2 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
          <IntroNode node={how.you} icon={LaptopIcon} />
          <IntroLink label={how.youToDpanel} towards="right" />
          <IntroNode node={how.dpanel} icon={LayoutDashboardIcon} highlight />
          <IntroLink label={how.serversToDpanel} towards="left" />
          <IntroNode node={how.servers} icon={ServerIcon} />
        </div>

        <figcaption className="rounded-xl border border-dashed p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {how.outside.title}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {how.outside.items.map((item) => (
              <li key={item.name} className="min-w-0 text-sm leading-5">
                <span className="font-semibold text-primary">{item.name}</span>
                <span className="text-muted-foreground"> · {item.role}</span>
              </li>
            ))}
          </ul>
        </figcaption>
      </figure>

      <ol
        id="docs-intro-how-steps"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {how.steps.map((step, index) => (
          <li key={step.title} className="flex min-w-0 gap-3">
            <IntroTile className="size-7 text-xs font-bold tabular-nums">
              {index + 1}
            </IntroTile>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-primary">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Where a customer's data lives: on their server, with dPanel, or with the
 * services they chose. Every line here must hold in the code that is live.
 */
function IntroData(props: { copy: DocsIntroCopy }) {
  const { copy } = props;
  const data = copy.data;

  return (
    <section aria-labelledby="docs-intro-data" className="space-y-5">
      <IntroHeading
        id="docs-intro-data"
        badge={data.badge}
        title={data.title}
        lead={data.lead}
      />

      <ul className="grid gap-3 lg:grid-cols-3">
        {data.columns.map((column) => {
          const Icon = DATA_ICONS[column.key];

          return (
            <li
              key={column.key}
              className="min-w-0 rounded-xl border bg-card p-5"
            >
              <IntroTile>
                <Icon className="size-4" />
              </IntroTile>
              <h3 className="mt-4 text-base font-semibold text-primary">
                {column.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {column.summary}
              </p>
              <ul className="mt-4 space-y-2 border-t pt-4">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-6 text-primary"
                  >
                    <CheckIcon
                      className={cn('mt-1 size-4 shrink-0', TONE.text)}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-base font-semibold text-primary">
          {data.control.title}
        </h3>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {data.control.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
            >
              <ShieldCheckIcon
                className={cn('mt-1 size-4 shrink-0', TONE.text)}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={data.moreHref}
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 text-sm font-semibold',
            'focus-visible:outline-none focus-visible:ring-2',
            TONE.text,
            TONE.ring,
          )}
        >
          {data.more}
          <ArrowRightIcon className="size-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}

/**
 * Machines at home are first-class servers: the agent connects out, so a
 * PC behind a home router joins like a cloud VM. Gets its own band because
 * it is the cheapest way in, and the one people do not expect.
 */
function IntroHomelab(props: { copy: DocsIntroCopy }) {
  const { copy } = props;
  const lab = copy.homelab;

  return (
    <section
      aria-labelledby="docs-intro-homelab"
      className="relative overflow-hidden rounded-2xl border bg-card"
    >
      <div className={cn('pointer-events-none absolute inset-0', TONE.glow)} />

      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <IntroTile className="size-12 rounded-xl">
              <HouseIcon className="size-6" />
            </IntroTile>
            <IntroBadge>{lab.badge}</IntroBadge>
          </div>
          <h2 id="docs-intro-homelab" className={SECTION_HEADING}>
            {lab.title}
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            {lab.text}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={lab.href} className={flowCtaClassName('sky')}>
              {lab.cta}
            </a>
            <a
              href={lab.secondaryHref}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2',
                TONE.hover,
                TONE.ring,
              )}
            >
              {lab.secondaryCta}
              <ArrowRightIcon className="size-4" aria-hidden />
            </a>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {lab.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-xl border bg-background/60 p-4 text-sm leading-6 text-primary"
            >
              <CheckIcon
                className={cn('mt-1 size-4 shrink-0', TONE.text)}
                aria-hidden
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
