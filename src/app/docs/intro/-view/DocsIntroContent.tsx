import type { ComponentType } from 'react';

import {
  ActivityIcon,
  AppWindowIcon,
  CirclePlayIcon,
  DatabaseIcon,
  GitBranchIcon,
  NetworkIcon,
  ServerIcon,
  UsersIcon,
} from 'lucide-react';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { DOCS_INTRO_EN } from '../-content/intro.en';
import { DOCS_INTRO_ID } from '../-content/intro.id';
import type { DocsIntroCapability, DocsIntroCopy } from '../-rules/intro';

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

export interface DocsIntroContentProps {
  /** App locale; anything unrecognised reads in English. */
  locale?: string;
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
  const copy =
    COPY[(props.locale ?? 'en').toLowerCase().split('-')[0] ?? 'en'] ??
    DOCS_INTRO_EN;

  return (
    <>
      <IntroHero copy={copy} />
      <IntroStart copy={copy} />
      <IntroCapabilities copy={copy} />
      <IntroOwnership copy={copy} />
      <IntroClosing copy={copy} />
    </>
  );
}

function IntroActions(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button asChild size="lg" className="sm:w-auto">
        <a href="/">{copy.hero.primaryCta}</a>
      </Button>
      <Button
        asChild
        buttonStyle="outline"
        buttonColor="secondary"
        size="lg"
        className="sm:w-auto"
      >
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
          <CirclePlayIcon />
          {copy.hero.secondaryCta}
        </a>
      </Button>
    </div>
  );
}

function IntroHero(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section className="rounded-xl border bg-card p-5 sm:p-8">
      <div className="max-w-3xl space-y-5">
        <Badge variant="secondary">{copy.hero.badge}</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            {copy.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {copy.hero.subtitle}
          </p>
        </div>
        <IntroActions copy={copy} />

        <ul
          aria-label={copy.providers.title}
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <li className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.providers.title}
          </li>
          {copy.providers.items.map((provider) => (
            <li key={provider}>
              <Badge variant="secondary">{provider}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function IntroStart(props: { copy: DocsIntroCopy }) {
  const { copy } = props;

  return (
    <section aria-labelledby="docs-intro-start" className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline">{copy.start.badge}</Badge>
        <h2
          id="docs-intro-start"
          className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
        >
          {copy.start.title}
        </h2>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {copy.start.steps.map((step, index) => (
          <li
            key={step.title}
            className="min-w-0 rounded-xl border bg-card p-5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-sm font-bold tabular-nums text-primary">
              {index + 1}
            </span>
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
        <Badge variant="outline">{copy.capabilities.badge}</Badge>
        <h2
          id="docs-intro-capabilities"
          className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
        >
          {copy.capabilities.title}
        </h2>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {copy.capabilities.items.map((item) => {
          const Icon = CAPABILITY_ICONS[item.key];

          return (
            <li
              key={item.key}
              className="min-w-0 rounded-xl border bg-card p-5"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-accent">
                <Icon className="size-4" />
              </span>
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
      className="rounded-xl border bg-card p-5 sm:p-8"
    >
      <div className="max-w-3xl space-y-4">
        <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-accent">
          <GitBranchIcon className="size-4" />
        </span>
        <Badge variant="outline">{copy.ownership.badge}</Badge>
        <h2
          id="docs-intro-ownership"
          className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
        >
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
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {copy.closing.title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.closing.text}
          </p>
        </div>
        <IntroActions copy={copy} />
      </div>
    </section>
  );
}
