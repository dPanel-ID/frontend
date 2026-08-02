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

type OperatingStage = {
  title: 'Learn' | 'Connect' | 'Run' | 'Decide';
  description: string;
  Icon: ComponentType<{ className?: string }>;
};

type OperatingView = {
  label: string;
  title: string;
  description: string;
  signal: string;
  Icon: ComponentType<{ className?: string }>;
};

const operatingStages: OperatingStage[] = [
  {
    title: 'Learn',
    description:
      'Start with the Application record and documented evidence before choosing the next Deployment.',
    Icon: CirclePlayIcon,
  },
  {
    title: 'Connect',
    description:
      'Connect the Repository to the Application so every Deployment keeps a visible code path.',
    Icon: Code2Icon,
  },
  {
    title: 'Run',
    description:
      'Record the Deployment against a Server and Cloud Project with execution history.',
    Icon: ServerIcon,
  },
  {
    title: 'Decide',
    description:
      'Compare the documented evidence before changing the Server or Cloud Project.',
    Icon: ActivityIcon,
  },
];

const operatingViews: OperatingView[] = [
  {
    label: 'Business',
    title: 'Understand the operational commitment.',
    description:
      'Read the Application, Deployment, Server, and Cloud Project record with documented evidence before approving the next step.',
    signal:
      'Application, Deployment, and Cloud Project show the operational commitment.',
    Icon: Building2Icon,
  },
  {
    label: 'Developers',
    title: 'Trace code through a deployment.',
    description:
      'Follow the Repository into the Deployment and execution history before comparing the next Server or Cloud Project.',
    signal:
      'Repository, Deployment, and execution history stay connected in one record.',
    Icon: Code2Icon,
  },
  {
    label: 'Teams',
    title: 'Follow the decision through the shared operational record.',
    description:
      'Use the Application record, Server, Cloud Project, and documented evidence to review what changed without leaving the shared record.',
    signal: 'Documented evidence keeps the decision visible across the team.',
    Icon: TerminalIcon,
  },
];

const operationalRecords = [
  {
    label: 'Application record',
    title: 'Repository connected',
    description:
      'Application and Repository stay together before the next Deployment is reviewed.',
    state: 'Connected',
  },
  {
    label: 'Deployment evidence',
    title: 'Execution recorded',
    description:
      'Deployment history and documented evidence explain what ran and when it was reviewed.',
    state: 'Recorded',
  },
  {
    label: 'Server and provider',
    title: 'Infrastructure selected',
    description:
      'Server and Cloud Project keep the current operating target visible to the team.',
    state: 'Selected',
  },
  {
    label: 'Decision context',
    title: 'Compare what the test shows',
    description:
      'Documented evidence stays attached so the next decision is ready to review.',
    state: 'Ready to review',
  },
] as const;

function CommandCenterHero() {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-card">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-emerald-500"
      />

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:p-10">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Command center introduction</Badge>
            <Badge variant="outline">Application to Cloud Project</Badge>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-accent">
              One operational record for every review
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Operate the path from code to cloud.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              dPanel keeps the Application, Repository, Deployment, Server, and
              Cloud Project connected through execution history and documented
              evidence so each decision across supported providers stays
              reviewable.
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
              <a href="#operating-loop">
                Explore the operating loop
                <ArrowRightIcon />
              </a>
            </Button>
          </div>

          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Start with the video, then follow the same operational record from
            the Application to the Deployment review.
          </p>
        </div>

        <OperationalDecisionBoard />
      </div>
    </section>
  );
}

function OperationalDecisionBoard() {
  return (
    <aside className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-50 shadow-sm">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 size-40 rounded-full bg-cyan-400/10 blur-2xl"
      />

      <div className="relative">
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-200">
            <CloudIcon className="size-5" />
          </span>
          <Badge className="border-slate-700 bg-slate-900 text-slate-100">
            Decision board
          </Badge>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          Operational decision board
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Application, Repository, Deployment, Server, and Cloud Project stay
          connected through execution history and documented evidence.
        </p>

        <ol className="mt-6 space-y-3">
          {operationalRecords.map((record, index) => (
            <li
              key={record.label}
              className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-4"
            >
              {index < operationalRecords.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-0.95rem] left-5 w-px bg-slate-700"
                  style={{ top: 'calc(100% - 0.15rem)', height: '1rem' }}
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                    {record.label}
                  </p>
                  <h3 className="text-base font-semibold text-slate-50">
                    {record.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-300">
                    {record.description}
                  </p>
                </div>

                <Badge className="max-w-full self-start border-slate-700 bg-slate-950 text-left whitespace-normal text-slate-100 sm:self-auto">
                  {record.state}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

function OperatingLoop() {
  return (
    <section
      id="operating-loop"
      className="scroll-mt-20 rounded-xl border bg-card p-5 sm:p-8"
    >
      <div className="max-w-3xl space-y-3">
        <Badge variant="outline">The operating loop</Badge>
        <h2 className="text-3xl font-semibold tracking-tight text-primary">
          Keep the Application record connected from Repository to review.
        </h2>
        <p className="text-base leading-7 text-muted-foreground">
          The ordered record keeps the Application, Deployment, Server, Cloud
          Project, execution history, and documented evidence connected while
          the team reviews what to do next.
        </p>
      </div>

      <div className="relative mt-8">
        <div
          aria-hidden="true"
          className="absolute left-[calc(12.5%+0.75rem)] right-[calc(12.5%+0.75rem)] top-6 hidden h-px bg-border lg:block"
        />

        <ol className="grid gap-4 lg:grid-cols-4">
          {operatingStages.map((stage, index) => (
            <li
              key={stage.title}
              className="relative rounded-xl border bg-background p-5"
            >
              {index < operatingStages.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-1.25rem] left-[1.45rem] top-14 w-px bg-border lg:hidden"
                />
              ) : null}

              <div className="relative inline-flex size-12 items-center justify-center rounded-full border bg-card text-accent">
                <stage.Icon className="size-5" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-primary">
                {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {stage.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OperatingViews() {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <div className="rounded-xl border bg-primary p-5 text-primary-foreground sm:p-8">
        <Badge className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
          Shared operational record
        </Badge>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight">
          One operational record, useful to every decision-maker.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75">
          The same Application, Repository, Deployment, Server, Cloud Project,
          execution history, and documented evidence support each review from a
          different seat.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {operatingViews.map((view) => (
          <article key={view.label} className="rounded-xl border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-accent">
              <view.Icon className="size-4" />
            </span>
            <p className="mt-5 text-sm font-medium text-accent">{view.label}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-primary">
              {view.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {view.description}
            </p>
            <p className="mt-4 rounded-lg border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
              {view.signal}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DecisionBoundaries() {
  return (
    <section
      id="decision-evidence"
      className="scroll-mt-20 rounded-xl border bg-card p-5 sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="space-y-3">
          <Badge variant="secondary">Decision boundaries</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">
            Review the board, then choose the next step.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            dPanel is not a live provider-pricing calculator and does not
            promise savings. The Application record, Deployment evidence, Server
            and provider, and Decision context keep the review grounded in
            documented evidence.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg border bg-background p-4">
            <GitBranchIcon className="size-5 text-accent" />
            <h3 className="mt-4 text-base font-semibold text-primary">
              Choose with evidence
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Compare the Application record, Deployment evidence, Server and
              provider, and Decision context before changing the operational
              commitment.
            </p>
          </article>
          <article className="rounded-lg border bg-background p-4">
            <WorkflowIcon className="size-5 text-accent" />
            <h3 className="mt-4 text-base font-semibold text-primary">
              Keep future options open
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A move is not automatic. Documented evidence and execution history
              make the next review clearer when the team compares a new Server
              or Cloud Project.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function DocsIntroContent() {
  return (
    <>
      <CommandCenterHero />
      <OperatingLoop />
      <OperatingViews />
      <DecisionBoundaries />
    </>
  );
}
