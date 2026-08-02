import type { ComponentType } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ActivityIcon,
  BookOpenIcon,
  BoxesIcon,
  CheckCircle2Icon,
  CloudIcon,
  DatabaseBackupIcon,
  DatabaseIcon,
  FolderGit2Icon,
  GaugeIcon,
  Globe2Icon,
  Layers3Icon,
  LockIcon,
  NetworkIcon,
  WorkflowIcon,
} from 'lucide-react';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { DocsIntroContent } from './-view/DocsIntroContent';

const SCREENSHOT_SERVER_DETAIL =
  'https://raw.githubusercontent.com/dpanel-id/docs/main/docs/assets/server-detail-dark.png';

type Status = 'available' | 'target' | 'planned';

type DocLink = {
  title: string;
  description: string;
  status: Status;
};

type DocGroup = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  status: Status;
  Icon: ComponentType<{ className?: string }>;
  links: DocLink[];
};

const navigation = [
  { href: '#operating-loop', label: 'Operating loop' },
  { href: '#decision-evidence', label: 'Compare evidence' },
  { href: '#documentation-map', label: 'Documentation map' },
  { href: '#iac-stacks', label: 'IaC stacks' },
  { href: '#safety-model', label: 'Safety model' },
];

const docGroups: DocGroup[] = [
  {
    id: 'install',
    title: 'Installation and servers',
    kicker: 'Manual or cloud provider',
    description:
      'Register an existing VPS, run Ansible-backed setup, or use verified provider paths while broader cloud parity continues to evolve.',
    status: 'available',
    Icon: CloudIcon,
    links: [
      {
        title: 'Manual server installation',
        description:
          'Register an existing Ubuntu or Debian server, attach SSH access, and run setup through the executor.',
        status: 'available',
      },
      {
        title: 'Cloud provider setup',
        description:
          'Use the currently verified provider paths, including IDCloudHost and Proxmox, where your workspace is configured for them.',
        status: 'available',
      },
      {
        title: 'Broader provider parity',
        description:
          'Document AWS, GCP, DigitalOcean, Linode, OpenStack, and similar providers as staged integrations until runtime paths are complete.',
        status: 'planned',
      },
      {
        title: 'Server modules',
        description:
          'Install runtime, database, router, monitoring, and supporting packages through workspace IaC modules.',
        status: 'target',
      },
    ],
  },
  {
    id: 'database',
    title: 'Database management',
    kicker: 'CRUD, users, backup, restore',
    description:
      'Manage databases close to the application workflow while keeping backups, credentials, and restore operations explicit and auditable.',
    status: 'target',
    Icon: DatabaseIcon,
    links: [
      {
        title: 'Create and manage databases',
        description:
          'Document the active-agent-backed database path for supported machines as parity replaces deprecated legacy database routes.',
        status: 'target',
      },
      {
        title: 'Database users and access',
        description:
          'Create database users, grant access, rotate credentials, and keep passwords out of UI logs and documentation.',
        status: 'target',
      },
      {
        title: 'Backup destinations',
        description:
          'Plan backup storage targets such as Google Drive, S3-compatible storage, FTP/SFTP, and Google Cloud Storage as future integrations.',
        status: 'planned',
      },
      {
        title: 'Restore runbooks',
        description:
          'Restore a backup into the same server, a replacement server, or a recovery environment with visible execution status.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'applications',
    title: 'Application management',
    kicker: 'GitHub today, GitLab-ready docs',
    description:
      'Move from repository source to deployment history, artifact metadata, environment variables, runtime status, and logs.',
    status: 'available',
    Icon: FolderGit2Icon,
    links: [
      {
        title: 'GitHub integration',
        description:
          'Connect GitHub, choose repositories and branches, inspect source metadata, and deploy from the create wizard.',
        status: 'available',
      },
      {
        title: 'GitLab integration',
        description:
          'Document the target flow for GitLab source control once the provider contract is introduced.',
        status: 'planned',
      },
      {
        title: 'Artifacts and releases',
        description:
          'Use build artifacts, deployment records, and GitHub Release asset metadata for repeatable delivery.',
        status: 'target',
      },
      {
        title: 'Environment and runtime',
        description:
          'Define environment variables, run commands, services, logs, and deployment recovery guidance.',
        status: 'available',
      },
    ],
  },
  {
    id: 'traffic',
    title: 'Traffic control',
    kicker: 'Security, routing, load balancing',
    description:
      'Publish applications through L4 or L7 routing, attach domains, manage upstreams, and grow toward richer traffic security policies.',
    status: 'available',
    Icon: NetworkIcon,
    links: [
      {
        title: 'L7 HTTP load balancer',
        description:
          'Route HTTP traffic by domain or path, discover application upstreams, and generate Caddy configuration.',
        status: 'available',
      },
      {
        title: 'L4 load balancer',
        description:
          'Route TCP services through explicit host and port targets for non-HTTP workloads.',
        status: 'available',
      },
      {
        title: 'Traffic limiter and policies',
        description:
          'Document rate limits, allow or block rules, request policy, and richer edge controls as the product surface expands.',
        status: 'planned',
      },
      {
        title: 'Upstream health and telemetry',
        description:
          'Connect router logs, application status, and future load-balancer health signals to the dashboard.',
        status: 'target',
      },
    ],
  },
  {
    id: 'domains',
    title: 'Domains and Cloudflare',
    kicker: 'DNS and cloud security',
    description:
      'Register DNS provider credentials, manage origin records, and use Cloudflare proxied DNS when the domain is managed through dPanel.',
    status: 'available',
    Icon: Globe2Icon,
    links: [
      {
        title: 'Cloudflare DNS',
        description:
          'Add Cloudflare zone credentials, create DNS records, and use proxied records for supported load-balancer flows.',
        status: 'available',
      },
      {
        title: 'DigitalOcean DNS',
        description:
          'Manage DNS records for DigitalOcean-backed zones from the domain surface.',
        status: 'available',
      },
      {
        title: 'DDoS and edge protection',
        description:
          'Explain how Cloudflare proxying can sit in front of public services; do not present DDoS protection as native dPanel filtering.',
        status: 'target',
      },
      {
        title: 'Domain dependency view',
        description:
          'Show which applications and load balancers depend on a domain or DNS record before changes are made.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'observability',
    title: 'Executions and observability',
    kicker: 'Status, logs, recovery',
    description:
      'Make long-running infrastructure work understandable through execution state, timestamps, event summaries, and telemetry-backed details.',
    status: 'target',
    Icon: ActivityIcon,
    links: [
      {
        title: 'Execution history',
        description:
          'Track queued, running, succeeded, failed, cancelled, stale, and retryable states for infrastructure actions.',
        status: 'target',
      },
      {
        title: 'Agent logs',
        description:
          'Read operational logs through Manager-mediated views without exposing telemetry tokens to the browser.',
        status: 'target',
      },
      {
        title: 'Service and network state',
        description:
          'Inspect services, network interfaces, ports, and machine status through active-agent commands.',
        status: 'available',
      },
      {
        title: 'Recovery playbooks',
        description:
          'Provide human-readable next steps when setup, deployment, DNS, database, or router operations fail.',
        status: 'planned',
      },
    ],
  },
];

const iacStacks = [
  {
    title: 'Ansible workspace IaC',
    status: 'available' as Status,
    description:
      'The current execution backend for server setup, module installs, application deployment, and router changes.',
    details: [
      'Workspace repositories keep inventories, playbooks, variables, and execution history.',
      'dPanel resolves refs before execution so branch, tag, or commit selection can be audited.',
      'Recommended for server modules, app deployment, and operational automation today.',
    ],
  },
  {
    title: 'OpenTofu infrastructure stack',
    status: 'planned' as Status,
    description:
      'A future IaC backend for cloud resources where declarative infrastructure state is the better fit.',
    details: [
      'Useful for cloud networks, managed provider resources, and repeatable environment creation.',
      'Should store plan, apply, drift, and state metadata as first-class execution records.',
      'Needs clear workspace ownership and remote-state safety before it is presented as active.',
    ],
  },
  {
    title: 'Agent and custom automation stack',
    status: 'target' as Status,
    description:
      'A control path for live machine operations that should not require opening inbound agent ports.',
    details: [
      'Active agents connect outbound to Manager and execute allowlisted commands.',
      'Good for service actions, file operations, network inspection, deploy-artifact commands, and live diagnostics.',
      'Custom automation must keep secrets redacted and execution results durable.',
    ],
  },
];

export const Route = createFileRoute('/docs/intro/')({
  ssr: true,
  head: () => ({
    meta: [
      {
        title: 'dPanel Documentation | Introduction',
      },
      {
        name: 'description',
        content:
          'Learn how dPanel connects application delivery to infrastructure, review recorded operational and cloud-cost evidence during testing, and keep a future path easier to plan instead of automatic.',
      },
    ],
  }),
  component: DocsIntroPage,
});

function DocsIntroPage() {
  return (
    <>
      <a
        href="#docs-intro-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>
      <main
        id="docs-intro-content"
        tabIndex={-1}
        className="min-h-svh bg-background text-foreground"
      >
        <DocsHeader />

        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <DocsIntroContent />
          <DocsPageGuide />
          <DocumentationMap />
          <IacStacksSection />
          <SafetySection />
        </div>
      </main>
    </>
  );
}

function DocsHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/docs/intro"
          className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="dPanel documentation introduction"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
            <BookOpenIcon className="size-4" />
          </span>
          <span className="hidden text-sm font-semibold text-primary sm:inline">
            dPanel Docs
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild buttonStyle="ghost" buttonColor="secondary" size="sm">
            <a href="#operating-loop">Operating loop</a>
          </Button>
          <Button asChild buttonStyle="ghost" buttonColor="secondary" size="sm">
            <a href="#documentation-map">Sections</a>
          </Button>
          <Button
            asChild
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link to="/">Open app</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function DocsPageGuide() {
  return (
    <details data-docs-page-guide className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 outline-hidden transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-accent">
            <BookOpenIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">Page guide</p>
            <p className="truncate text-xs text-muted-foreground">
              Jump links and release-status legend
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>

      <div className="border-t p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              On this page
            </p>
            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Status legend
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status="available" />
              <StatusBadge status="target" />
              <StatusBadge status="planned" />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function DocumentationMap() {
  return (
    <section
      id="documentation-map"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 space-y-2">
        <Badge variant="outline">Documentation map</Badge>
        <h2 className="text-2xl font-semibold text-primary">
          Complete documentation groups for dPanel.
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          These groups are written as the public docs table of contents. Items
          marked as planned or target should be documented as product direction
          until the backend and UI contracts are complete.
        </p>
      </div>

      <div className="grid gap-4">
        {docGroups.map((group) => (
          <DocGroupCard key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}

function DocGroupCard({ group }: { group: DocGroup }) {
  return (
    <article id={group.id} className="rounded-lg border bg-background p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="min-w-0">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-accent">
              <group.Icon className="size-5" />
            </span>
            <StatusBadge status={group.status} />
          </div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {group.kicker}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-primary">
            {group.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {group.links.map((item) => (
            <article key={item.title} className="rounded-lg border bg-card p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-primary">
                  {item.title}
                </h4>
                <StatusBadge status={item.status} compact />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </article>
  );
}

function IacStacksSection() {
  return (
    <section
      id="iac-stacks"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          <Badge variant="secondary">Infrastructure as Code</Badge>
          <h2 className="text-2xl font-semibold text-primary">
            Track changes through workspace IaC, not invisible scripts.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            dPanel should let each workspace choose the execution style that
            fits the job. Ansible is the current backend for server and
            application operations; OpenTofu and custom agent automation belong
            in the docs as extension paths with clear rollout status.
          </p>
        </div>

        <figure className="min-w-0 overflow-hidden rounded-lg border bg-background">
          <img
            src={SCREENSHOT_SERVER_DETAIL}
            alt="dPanel server detail page showing management tools, modules, services, and resource usage"
            className="aspect-[16/9] w-full object-cover object-left-top"
          />
          <figcaption className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">
            Server detail should explain which actions are UI-only,
            agent-backed, Ansible-backed, or future IaC-backed.
          </figcaption>
        </figure>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {iacStacks.map((stack) => (
          <article
            key={stack.title}
            className="rounded-lg border bg-background p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border bg-card text-accent">
                {stack.title.includes('Ansible') ? (
                  <WorkflowIcon className="size-4" />
                ) : stack.title.includes('OpenTofu') ? (
                  <Layers3Icon className="size-4" />
                ) : (
                  <BoxesIcon className="size-4" />
                )}
              </span>
              <StatusBadge status={stack.status} />
            </div>
            <h3 className="text-base font-semibold text-primary">
              {stack.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {stack.description}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6">
              {stack.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function SafetySection() {
  return (
    <section
      id="safety-model"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 space-y-2">
        <Badge variant="outline">Safety model</Badge>
        <h2 className="text-2xl font-semibold text-primary">
          Documentation must protect production users.
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          dPanel v2 is additive. Documentation should be useful for new users
          without breaking expectations for legacy records, old status values,
          existing deployments, and sensitive infrastructure data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SafetyCard
          title="Compatibility first"
          description="Treat empty statuses, nullable JSON, numeric legacy IDs, and missing historical relationships as valid states."
          Icon={DatabaseBackupIcon}
        />
        <SafetyCard
          title="Secrets stay hidden"
          description="Never show passwords, SSH keys, provider tokens, DNS credentials, database credentials, or payment data in docs or screenshots."
          Icon={LockIcon}
        />
        <SafetyCard
          title="Observable operations"
          description="Every long-running setup, deploy, database, DNS, load-balancer, or IaC action should show status, timestamps, failure context, and recovery guidance."
          Icon={GaugeIcon}
        />
      </div>
    </section>
  );
}

function SafetyCard(props: {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const { title, description, Icon } = props;

  return (
    <article className="rounded-lg border bg-background p-4">
      <span className="mb-3 flex size-9 items-center justify-center rounded-lg border bg-card text-accent">
        <Icon className="size-4" />
      </span>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function StatusBadge(props: { status: Status; compact?: boolean }) {
  const { status, compact } = props;

  if (status === 'available') {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        {compact ? 'Now' : 'Available now'}
      </Badge>
    );
  }

  if (status === 'target') {
    return (
      <Badge className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300">
        {compact ? 'V2' : 'V2 target'}
      </Badge>
    );
  }

  return (
    <Badge className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
      {compact ? 'Plan' : 'Planned'}
    </Badge>
  );
}
