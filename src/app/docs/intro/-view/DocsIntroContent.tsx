import type { ComponentType } from 'react';

import {
  ActivityIcon,
  ArrowRightIcon,
  Building2Icon,
  CirclePlayIcon,
  CloudIcon,
  Code2Icon,
  GitBranchIcon,
  ServerIcon,
  TerminalIcon,
  WorkflowIcon,
} from 'lucide-react';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

type JourneyStep = {
  title: string;
  description: string;
  eyebrow: string;
  Icon: ComponentType<{ className?: string }>;
};

const journey: JourneyStep[] = [
  {
    title: 'Learn',
    eyebrow: 'Start with context',
    description:
      'Watch the dPanel walkthrough, then follow the parts of the product that match your application and team.',
    Icon: CirclePlayIcon,
  },
  {
    title: 'Test',
    eyebrow: 'Use your environment',
    description:
      'Try the application on user-controlled infrastructure and supported providers with a visible deployment path.',
    Icon: ServerIcon,
  },
  {
    title: 'Compare',
    eyebrow: 'Use real evidence',
    description:
      'Review the resource, operational, and cost evidence you collect while testing each option.',
    Icon: ActivityIcon,
  },
  {
    title: 'Keep or move',
    eyebrow: 'Plan the next step',
    description:
      'Keep the fit that works, or use repeatable records and automation to make a future move easier to plan.',
    Icon: WorkflowIcon,
  },
];

const outcomes = [
  {
    title: 'Business teams',
    outcome: 'Understand the spend decision.',
    description:
      'See what is being tested, the resources involved, and the evidence behind an infrastructure choice without learning every cloud console.',
    Icon: Building2Icon,
  },
  {
    title: 'Developers',
    outcome: 'Ship with evidence.',
    description:
      'Connect the application path from source to deployment, then compare the operational results of the environments you try.',
    Icon: Code2Icon,
  },
  {
    title: 'Non-technical collaborators',
    outcome: 'Follow progress without cloud tooling.',
    description:
      'Use one shared view of the testing journey, current status, and the next decision instead of a collection of provider dashboards.',
    Icon: TerminalIcon,
  },
];

export function DocsIntroContent() {
  return (
    <>
      <section className="relative overflow-hidden rounded-xl border bg-card">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-emerald-500"
        />

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">dPanel, in one video</Badge>
              <Badge variant="outline">Build your own evidence</Badge>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-accent">
                Start with the way your team works
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                Learn, test, and choose the cloud that fits your application.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                dPanel brings application delivery and infrastructure work into
                one clear journey: learn the product, test on user-controlled
                infrastructure and supported providers, then compare what you
                find before making a longer-term commitment.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="sm:w-auto">
                <a
                  href="https://www.youtube.com/@dpanel_id"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CirclePlayIcon />
                  Watch dPanel on YouTube
                </a>
              </Button>
              <Button
                asChild
                buttonStyle="outline"
                buttonColor="secondary"
                size="lg"
                className="sm:w-auto"
              >
                <a href="#testing-journey">
                  See the testing journey
                  <ArrowRightIcon />
                </a>
              </Button>
            </div>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Start with the channel, then use the documentation to explore
              available workflows and clearly labeled product direction.
            </p>
          </div>

          <aside className="relative overflow-hidden rounded-xl border bg-background p-5 shadow-sm">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 size-40 rounded-full bg-accent/10 blur-2xl"
            />
            <div className="relative">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-accent">
                  <CloudIcon className="size-5" />
                </span>
                <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  Your decision trail
                </span>
              </div>
              <p className="text-sm font-medium text-accent">
                From test to confidence
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                Make an infrastructure choice you can explain.
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  'Application and environment',
                  'Deployment and operational outcome',
                  'Resource and cost evidence',
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-5 text-muted-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section
        id="testing-journey"
        className="scroll-mt-20 rounded-xl border bg-card p-5 sm:p-8"
      >
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline">A practical testing loop</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">
            Move from curiosity to a decision without losing the context.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            dPanel is designed to keep the application, infrastructure path,
            execution history, and decision context connected while your team
            evaluates the options that are actually available to it.
          </p>
        </div>

        <ol className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {journey.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-xl border bg-background p-4"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-accent">
                  <step.Icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {step.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="rounded-xl border bg-primary p-5 text-primary-foreground sm:p-8">
          <Badge className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
            Built for shared decisions
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            One testing story, at the right level of detail for each person.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
            The goal is not to turn everyone into a cloud expert. It is to make
            the application, its infrastructure, and the trade-offs visible
            enough to decide together.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {outcomes.map((outcome) => (
            <article
              key={outcome.title}
              className="rounded-xl border bg-card p-5"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-accent">
                <outcome.Icon className="size-4" />
              </span>
              <p className="mt-5 text-sm font-medium text-accent">
                {outcome.title}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-primary">
                {outcome.outcome}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {outcome.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="decision-evidence"
        className="scroll-mt-20 rounded-xl border bg-card p-5 sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="space-y-3">
            <Badge variant="secondary">Compare with context</Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-primary">
              Compare evidence, then choose what fits.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              During testing, compare the resource use, operational outcomes,
              and cloud cost evidence you record for each option. dPanel is not
              a live provider-pricing calculator and does not promise savings;
              it gives your team a consistent place to assess the work it has
              actually performed.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-lg border bg-background p-4">
              <GitBranchIcon className="size-5 text-accent" />
              <h3 className="mt-4 text-base font-semibold text-primary">
                Keep the path that fits
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use the deployments, status, and evidence from your trial to
                make a reasoned choice for the application you run today.
              </p>
            </article>
            <article className="rounded-lg border bg-background p-4">
              <WorkflowIcon className="size-5 text-accent" />
              <h3 className="mt-4 text-base font-semibold text-primary">
                Make a future move easier
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A move is not automatic. Repeatable configuration, documented
                execution history, and IaC-backed operations can reduce the
                rework needed to plan one.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
