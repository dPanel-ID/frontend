import type { ComponentType } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ActivityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BoxesIcon,
  Building2Icon,
  CheckCircle2Icon,
  CloudIcon,
  Code2Icon,
  DatabaseBackupIcon,
  DatabaseIcon,
  FolderGit2Icon,
  GaugeIcon,
  GitBranchIcon,
  Globe2Icon,
  KeyRoundIcon,
  Layers3Icon,
  LockIcon,
  NetworkIcon,
  RouteIcon,
  ServerIcon,
  TerminalIcon,
  WorkflowIcon,
} from 'lucide-react';

import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

const SCREENSHOT_SERVER_MANAGER =
  'https://raw.githubusercontent.com/dpanel-id/docs/main/docs/assets/server-manager-dark.png';

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
  { href: '#why-dpanel', label: 'Why dPanel' },
  { href: '#problems', label: 'Problems solved' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#getting-started', label: 'Getting started' },
  { href: '#documentation-map', label: 'Documentation map' },
  { href: '#iac-stacks', label: 'IaC stacks' },
  { href: '#safety-model', label: 'Safety model' },
];

const productReasons = [
  {
    title: 'A control panel should explain operations, not hide them',
    description:
      'Classic panels make server work approachable, but they often stop at one machine. Modern cloud tools are powerful, but they scatter context across providers, CI systems, DNS dashboards, scripts, and logs. dPanel is built to keep that operational story visible in one workspace.',
    Icon: GaugeIcon,
  },
  {
    title:
      'Small teams need platform discipline without building a platform team',
    description:
      'Many agencies, SMEs, and developer teams need repeatable deployment, routing, database, and server workflows, but cannot justify a custom internal platform. dPanel gives them a managed operating model while preserving the flexibility of their own servers and providers.',
    Icon: Building2Icon,
  },
  {
    title: 'Infrastructure changes should become records, not memories',
    description:
      'When setup, deploy, DNS, database, or load-balancer work happens through dPanel, the goal is for users to see who changed what, when it ran, what status it reached, and what recovery path exists when it fails.',
    Icon: WorkflowIcon,
  },
];

const problemsSolved = [
  {
    title: 'Infrastructure is spread across too many tools',
    description:
      'A real application may depend on a VPS provider, SSH credentials, GitHub, DNS, databases, load balancers, background services, logs, and backup storage. dPanel groups these moving parts by application, server, domain, and workspace so users do not have to rebuild context every time they operate.',
    Icon: NetworkIcon,
  },
  {
    title: 'Deployments become manual rituals',
    description:
      'Without a shared workflow, teams depend on terminal history, one person who remembers the commands, or undocumented scripts. dPanel moves deployment toward Git-backed source, build artifacts, environment settings, execution history, and repeatable IaC-backed changes.',
    Icon: GitBranchIcon,
  },
  {
    title: 'Business owners cannot see operational risk',
    description:
      'Non-technical users usually know the business impact of downtime, but not which server, domain, database, or deployment caused it. dPanel is designed to make ownership, status, and dependencies easier to understand without asking them to read provider dashboards.',
    Icon: Building2Icon,
  },
  {
    title: 'Long-running work feels like a black box',
    description:
      'Server setup, module installation, deployment, DNS updates, database tasks, and load-balancer changes can take time. dPanel treats these as visible executions with states, timestamps, logs, and failure context instead of silent buttons.',
    Icon: ActivityIcon,
  },
];

const productBenefits = [
  {
    title: 'One workspace for infrastructure and delivery',
    description:
      'Users can move from server inventory to applications, domains, databases, load balancers, services, and observability without switching mental models or losing the relationship between resources.',
    Icon: ServerIcon,
  },
  {
    title: 'Faster onboarding for owners and operators',
    description:
      'SME owners can understand the high-level operating picture, developers can find deployment context, and DevOps users can trace the technical path behind an action from the same product surface.',
    Icon: Code2Icon,
  },
  {
    title: 'Safer repeatable operations',
    description:
      'dPanel favors execution records, IaC refs, agent-backed operations, permission-aware actions, and redacted secrets so production work is easier to audit and harder to perform accidentally.',
    Icon: LockIcon,
  },
  {
    title: 'Clearer recovery when something fails',
    description:
      'Instead of leaving users with a generic error, dPanel documentation should teach them to inspect status, logs, affected resources, retry options, and the next operational step.',
    Icon: DatabaseBackupIcon,
  },
];

const quickStartSteps = [
  {
    title: 'Pick an installation path',
    description:
      'Start with a manual server registration, or connect a cloud provider when your workspace needs repeatable VM creation.',
    Icon: ServerIcon,
  },
  {
    title: 'Prepare access and modules',
    description:
      'Add SSH credentials, select a target server, then install runtime, router, database, and observability modules through tracked executions.',
    Icon: KeyRoundIcon,
  },
  {
    title: 'Deploy an application',
    description:
      'Connect a Git repository, choose a branch, define environment settings, build an artifact, and deploy it to one or more machines.',
    Icon: GitBranchIcon,
  },
  {
    title: 'Publish and operate',
    description:
      'Attach DNS, route traffic through a load balancer, watch status, and use logs or execution history when recovery is needed.',
    Icon: RouteIcon,
  },
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

const audienceTracks = [
  {
    title: 'SME owner',
    subtitle: 'Business view',
    description:
      'Know which apps, domains, servers, and teams are involved without reading cloud-provider dashboards first.',
    Icon: Building2Icon,
  },
  {
    title: 'Developer',
    subtitle: 'Delivery view',
    description:
      'Connect source code, runtime settings, artifacts, deployments, logs, and rollback context in one workflow.',
    Icon: Code2Icon,
  },
  {
    title: 'DevOps',
    subtitle: 'Control-plane view',
    description:
      'Trace UI actions through Manager APIs, execution records, IaC commits, agents, machines, and telemetry.',
    Icon: TerminalIcon,
  },
];

const personaBenefits = [
  {
    title: 'For SME business owners',
    before:
      'Infrastructure feels like a cost center that only technical staff can interpret.',
    after:
      'You can see which servers, apps, domains, and teams are involved, then understand whether work is healthy, pending, failed, or needs attention.',
    Icon: Building2Icon,
  },
  {
    title: 'For developers',
    before:
      'Shipping an app requires jumping between Git, environment variables, terminal commands, server folders, and deployment notes.',
    after:
      'You can connect source code, configure runtime settings, deploy artifacts, review deployment history, and use logs from one delivery workflow.',
    Icon: Code2Icon,
  },
  {
    title: 'For DevOps and platform operators',
    before:
      'Operational control depends on scripts, cloud consoles, SSH access, and manual investigation across multiple machines.',
    after:
      'You can trace actions through Manager APIs, workspace IaC, execution records, active agents, services, networks, and telemetry-aware views.',
    Icon: TerminalIcon,
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
          'dPanel documentation introduction explaining why dPanel exists, the problems it solves, benefits for users, and docs for installation, servers, databases, applications, traffic, domains, Cloudflare, and IaC workflows.',
      },
    ],
  }),
  component: DocsIntroPage,
});

function DocsIntroPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <DocsHeader />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <HeroSection />
        <DocsPageGuide />
        <WhyDpanelSection />
        <ProblemsSection />
        <BenefitsSection />
        <GettingStartedSection />
        <DocumentationMap />
        <IacStacksSection />
        <SafetySection />
      </div>
    </main>
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
          <span className="truncate text-sm font-semibold text-primary">
            dPanel Docs
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild buttonStyle="ghost" buttonColor="secondary" size="sm">
            <a href="#why-dpanel">Why dPanel</a>
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

function HeroSection() {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-6">
        <div className="flex flex-col justify-center gap-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Control plane</Badge>
            <Badge variant="outline">Server management</Badge>
            <Badge variant="outline">Application delivery</Badge>
            <Badge variant="outline">Workspace IaC</Badge>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-accent">
              Getting Started / Introduction
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-primary sm:text-5xl">
              dPanel is a control plane for teams that need clarity over real
              infrastructure.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              It brings server management, application delivery, databases, DNS,
              load balancing, services, observability, and IaC-tracked
              operations into one workspace. The goal is simple: help business
              owners understand what is running, help developers ship with less
              guesswork, and help DevOps teams operate without losing the audit
              trail.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {audienceTracks.map((track) => (
              <article key={track.title} className="rounded-lg border p-3">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg border bg-background text-accent">
                    <track.Icon className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-primary">
                      {track.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {track.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {track.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <figure className="min-w-0 overflow-hidden rounded-lg border bg-background">
          <img
            src={SCREENSHOT_SERVER_MANAGER}
            alt="dPanel server management dashboard showing server inventory, filters, and backend navigation"
            className="aspect-[16/9] w-full object-cover object-left-top"
          />
          <figcaption className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">
            dPanel starts with server inventory, then connects applications,
            domains, modules, databases, load balancers, and executions.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function WhyDpanelSection() {
  return (
    <section
      id="why-dpanel"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-3">
          <Badge variant="secondary">Why dPanel exists</Badge>
          <h2 className="text-2xl font-semibold text-primary">
            dPanel was created for teams caught between simple hosting panels
            and complex cloud platforms.
          </h2>
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Many businesses start with one server, one domain, and one
              application. Over time they add more servers, more repositories,
              staging environments, database users, DNS providers, background
              services, certificates, load balancers, backups, and monitoring.
              The work becomes important before the team has a dedicated
              platform engineering function.
            </p>
            <p>
              dPanel exists to make that middle stage manageable. It keeps the
              friendly control-panel idea, then adds modern delivery patterns:
              Git-connected applications, visible executions, provider-aware
              infrastructure, active agents, observability, and IaC-backed
              change tracking.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {productReasons.map((reason) => (
            <ProductStoryCard key={reason.title} {...reason} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductStoryCard(props: {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const { title, description, Icon } = props;

  return (
    <article className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-accent">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-primary">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProblemsSection() {
  return (
    <section
      id="problems"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 space-y-2">
        <Badge variant="outline">Problems dPanel resolves</Badge>
        <h2 className="text-2xl font-semibold text-primary">
          The product focuses on the operational problems that slow real teams
          down.
        </h2>
        <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
          dPanel is not only a server list or deployment button. It is intended
          to reduce the daily friction of understanding what exists, changing it
          safely, and explaining the result to both technical and non-technical
          stakeholders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {problemsSolved.map((problem) => (
          <ProblemCard key={problem.title} {...problem} />
        ))}
      </div>
    </section>
  );
}

function ProblemCard(props: {
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

function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          <Badge variant="secondary">Benefits for users</Badge>
          <h2 className="text-2xl font-semibold text-primary">
            dPanel helps users make better operational decisions with less
            hidden context.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            The main benefit is shared clarity. A business owner, developer, and
            DevOps engineer can look at the same workspace and discuss the same
            applications, servers, domains, databases, deployments, and
            execution history with different levels of detail.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {productBenefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {personaBenefits.map((benefit) => (
          <PersonaBenefitCard key={benefit.title} {...benefit} />
        ))}
      </div>
    </section>
  );
}

function BenefitCard(props: {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const { title, description, Icon } = props;

  return (
    <article className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-accent">
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-primary">{title}</h3>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
    </article>
  );
}

function PersonaBenefitCard(props: {
  title: string;
  before: string;
  after: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const { title, before, after, Icon } = props;

  return (
    <article className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-accent">
          <Icon className="size-4" />
        </span>
        <h3 className="text-base font-semibold text-primary">{title}</h3>
      </div>

      <div className="space-y-3 text-sm leading-6">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Without dPanel
          </p>
          <p className="mt-1 text-muted-foreground">{before}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            With dPanel
          </p>
          <p className="mt-1 text-primary">{after}</p>
        </div>
      </div>
    </article>
  );
}

function GettingStartedSection() {
  return (
    <section
      id="getting-started"
      className="scroll-mt-20 rounded-lg border bg-card p-5 lg:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">Getting started</Badge>
          <h2 className="text-2xl font-semibold text-primary">
            The first workflow most users need.
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            The fastest way to understand dPanel is to follow the path from a
            server to a reachable application. That workflow shows the product
            value clearly: setup is tracked, deployment is connected to source
            code, traffic is routed intentionally, and failures have a place to
            be investigated.
          </p>
        </div>

        <Button asChild buttonStyle="outline" buttonColor="secondary" size="sm">
          <a href="#documentation-map">
            Browse sections
            <ArrowRightIcon />
          </a>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {quickStartSteps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-lg border bg-background p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border bg-card text-accent">
                <step.Icon className="size-4" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Step {index + 1}
              </span>
            </div>
            <h3 className="text-base font-semibold text-primary">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </section>
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
