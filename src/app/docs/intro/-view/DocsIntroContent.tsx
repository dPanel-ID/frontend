import type { ComponentType } from 'react';

import {
  ActivityIcon,
  AppWindowIcon,
  ArrowRightIcon,
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

/** The introduction copy for an app locale; unknown locales read in English. */
export function introCopyFor(locale?: string): DocsIntroCopy {
  const key = (locale ?? 'en').toLowerCase().split('-')[0] ?? 'en';
  return COPY[key] ?? DOCS_INTRO_EN;
}

export interface DocsIntroContentProps {
  /** App locale; anything unrecognised reads in English. */
  locale?: string;
  /** Where "read the guide" goes; omitted when there are no guides yet. */
  readMoreHref?: string;
  readMoreLabel?: string;
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

  return (
    <div className="flex flex-col gap-4">
      <IntroStart copy={copy} />
      <IntroCapabilities copy={copy} />
      <IntroOwnership copy={copy} />
      <IntroClosing
        copy={copy}
        readMoreHref={props.readMoreHref}
        readMoreLabel={props.readMoreLabel}
      />
    </div>
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

      <ol className="grid gap-3 sm:grid-cols-2">
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

      <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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
      className="rounded-2xl border bg-card p-5 sm:p-8"
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

function IntroClosing(props: {
  copy: DocsIntroCopy;
  readMoreHref?: string;
  readMoreLabel?: string;
}) {
  const { copy, readMoreHref, readMoreLabel } = props;

  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
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

        {/* The way into the guides, so the introduction is not a dead end. */}
        {readMoreHref && readMoreLabel && (
          <a
            href={readMoreHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 dark:text-sky-300"
          >
            {readMoreLabel}
            <ArrowRightIcon className="size-4" aria-hidden />
          </a>
        )}
      </div>
    </section>
  );
}
