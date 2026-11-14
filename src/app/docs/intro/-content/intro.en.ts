import type { DocsIntroCopy } from '../-rules/intro';

export const DOCS_INTRO_EN: DocsIntroCopy = {
  hero: {
    badge: 'Introduction',
    title: 'Put your website or app online, on a server you own.',
    subtitle:
      'dPanel sets up a server for you, installs what your app needs, deploys it from GitHub and gives it a domain with HTTPS. No server expertise needed, and nothing hidden from the experts: everything it does is written down as Ansible that stays yours.',
    primaryCta: 'Create your account',
    secondaryCta: 'Watch dPanel on YouTube',
  },
  problems: {
    badge: 'Why dPanel',
    title: 'The problems it takes off your hands.',
    problemLabel: 'The problem',
    answerLabel: 'With dPanel',
    items: [
      {
        key: 'owner',
        who: 'You run a business, a shop or a blog',
        problem:
          'You need a website online, fast and secure, but hiring someone to look after a server is expensive and hosting panels lock you in.',
        answer:
          'Pick a server, pick your site, add your domain. dPanel installs everything, turns on HTTPS and keeps a record of every change, from the web app or by asking the built-in assistant.',
      },
      {
        key: 'developer',
        who: 'You build apps',
        problem:
          'You want to push code and see it live, without writing deploy scripts, systemd units and web server configs by hand.',
        answer:
          'Connect a GitHub repository. dPanel builds each commit on your server, keeps every release so you can roll back, and shows build and runtime logs as they happen.',
      },
      {
        key: 'operator',
        who: 'You look after servers',
        problem:
          'Machines across several clouds, installed by hand, with nobody sure what changed or when.',
        answer:
          'One list for every server, wherever it runs. Databases, runtimes and web servers install the same way each time, every job is recorded with who ran it and what failed, and the result is plain Ansible.',
      },
      {
        key: 'team',
        who: 'You work as a team',
        problem:
          'Shared passwords, one person who knows how production works, and no safe way to give a script access.',
        answer:
          'Shared workspaces with roles, so everyone sees the same servers and changes. Service accounts give automation its own token, and access ends the moment someone leaves.',
      },
    ],
  },
  howItWorks: {
    badge: 'How it works',
    title: 'Three parts, and your code never leaves your servers.',
    lead: 'You tell dPanel what you want. dPanel plans the work and keeps the records. A small program on your server, the dPanel agent, does the work there.',
    you: {
      title: 'You',
      items: ['Web app', 'dnocs command line', 'Ask dPanel assistant'],
    },
    dpanel: {
      title: 'dPanel',
      items: [
        'Plans each job',
        'Keeps settings and history',
        'Seals your secrets',
        'Shows logs and usage',
      ],
    },
    servers: {
      title: 'Your servers',
      items: [
        'dPanel agent',
        'Your apps and builds',
        'Databases and files',
        'Web server with HTTPS',
      ],
    },
    youToDpanel: 'HTTPS',
    serversToDpanel: 'The agent connects out',
    outside: {
      title: 'Around it',
      items: [
        {
          name: 'Your cloud',
          role: 'dPanel creates and deletes VMs with your key',
        },
        {
          name: 'GitHub',
          role: 'your server pulls your code, read-only',
        },
        { name: 'Your DNS', role: 'dPanel adds the records for your domain' },
        { name: 'Visitors', role: 'reach your server directly, over HTTPS' },
      ],
    },
    steps: [
      {
        title: 'You ask',
        text: 'In the web app, the dnocs command line or the chat assistant, you ask for something: a new server, a database, a deploy, a domain.',
      },
      {
        title: 'dPanel plans',
        text: 'dPanel checks you are allowed to, turns the request into a job, and records it. Passwords and keys in the job are sealed.',
      },
      {
        title: 'Your server does the work',
        text: 'The dPanel agent on your server picks up the job over a connection it opens itself, so your server needs no open port for dPanel. It installs, builds and deploys right there.',
      },
      {
        title: 'Visitors reach your server',
        text: 'Your site is served from your own server, behind a load balancer with a free HTTPS certificate. dPanel is not in the path of your visitors.',
      },
    ],
  },
  homelab: {
    badge: 'Home lab',
    title: 'Your home lab, managed like a data centre.',
    text: 'The PC under your desk, a mini PC, a NAS or a Raspberry Pi can be a dPanel server too. Run one command on it and it joins, even behind your home router. Then host your projects, learn Linux and Kubernetes, or share the machines with friends and teammates.',
    points: [
      'No public IP, port forwarding or SSH needed: the agent connects out.',
      'Intel/AMD and ARM machines, including Raspberry Pi, on Ubuntu or Debian.',
      'Share them in a team workspace, each member with their own role.',
      'No spare machine? Try it first in a Docker or Podman container.',
    ],
    cta: 'Set up a team home lab',
    href: '/docs/tutorials/team-homelab',
    secondaryCta: 'Connect one machine',
    secondaryHref: '/docs/servers/register-a-private-machine',
  },
  start: {
    badge: 'Getting started',
    title: 'From an empty account to a running application.',
    steps: [
      {
        title: 'Bring a server, or let dPanel launch one',
        text: 'Launch a VM at AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud or Tencent Cloud, or connect a machine you already run with one install command. A public IP is optional.',
      },
      {
        title: 'It sets the server up',
        text: 'The dPanel agent joins in a few minutes. Then add what your app needs, such as PHP, Node.js, MariaDB or Redis, with a click each.',
      },
      {
        title: 'Deploy your application',
        text: 'Pick your GitHub repository. dPanel builds the release on your server, starts it as a service and keeps every release. Or ask Ask dPanel to set it up with you.',
      },
      {
        title: 'Give it a domain',
        text: 'Put a load balancer in front, choose a domain, and dPanel creates the DNS record and the HTTPS certificate.',
      },
    ],
  },
  capabilities: {
    badge: 'What you get',
    title: 'One panel for the whole estate.',
    items: [
      {
        key: 'servers',
        title: 'Servers',
        text: 'Launch VMs at seven clouds or connect your own, in a data centre or at home, and watch CPU, memory and disk.',
      },
      {
        key: 'applications',
        title: 'Applications',
        text: 'Deploy from GitHub, follow each build stage by stage, roll back to any release, and keep secrets masked.',
      },
      {
        key: 'traffic',
        title: 'Domains and HTTPS',
        text: 'Load balancers on Caddy, HAProxy or APISIX, DNS records at Cloudflare or DigitalOcean, and free certificates.',
      },
      {
        key: 'data',
        title: 'Databases and runtimes',
        text: 'MariaDB, PostgreSQL, MongoDB and Redis at the release you choose, and PHP, Node.js, Python, Go, Ruby and more, without a shell.',
      },
      {
        key: 'assistant',
        title: 'Assistant and CLI',
        text: 'Ask dPanel prepares changes for you to approve, and the dnocs command line does everything the web app does.',
      },
      {
        key: 'logs',
        title: 'Logs and activity',
        text: 'Server, build and app logs in one place, and every job recorded: who ran it, how long it took, and which step failed.',
      },
      {
        key: 'clusters',
        title: 'Kubernetes',
        text: 'Turn your servers into a k3s or RKE2 cluster, with a connectivity check before anything is installed.',
      },
      {
        key: 'teams',
        title: 'Teams',
        text: 'Personal and team workspaces, roles for each member, service accounts for automation, and your own workers if you need them.',
      },
    ],
  },
  data: {
    badge: 'Your data',
    title: 'What stays on your server, and what dPanel keeps.',
    lead: 'The short version: your code, your databases and your files stay on your servers. dPanel keeps what it needs to run them, and seals every secret.',
    columns: [
      {
        key: 'server',
        title: 'Stays on your server',
        summary: 'The things that make your site yours.',
        items: [
          'Your source code and every build, pulled straight from GitHub',
          'Your databases and what is in them',
          'Uploaded files, plugins and themes',
          'Your app’s environment variables, in a file only the system can read',
        ],
      },
      {
        key: 'dpanel',
        title: 'Kept by dPanel',
        summary: 'What it needs to manage things for you.',
        items: [
          'Your account: email and username',
          'Workspace settings, server and app details, and a history of every job',
          'App variables and sign-in tokens, sealed with AES-256-GCM under a key kept outside the code, and shown masked',
          'Cloud and DNS provider keys, encrypted and never shown again',
          'Server and app logs for 3 days, with passwords and tokens masked before they leave your server',
        ],
      },
      {
        key: 'outside',
        title: 'Shared with services you choose',
        summary: 'Only to do the job you asked for.',
        items: [
          'Your cloud provider, to create and delete VMs',
          'GitHub, to read the repository you deploy',
          'Your DNS provider, to add records for your domain',
          'An AI model service, for Ask dPanel messages, never your secrets',
          'Let’s Encrypt, to issue HTTPS certificates',
        ],
      },
    ],
    control: {
      title: 'You stay in control',
      items: [
        'The agent only connects out, so your server needs no open port for dPanel.',
        'Showing a secret is limited to people who may change the app, and recorded.',
        'A job’s working copy, with its passwords, is deleted 7 days after it finishes.',
        'Revoke a cloud key or remove a member at any time; access ends at once.',
        'Run jobs on your own workers instead of dPanel’s.',
      ],
    },
    more: 'Read the details in Security and your data',
    moreHref: '/docs/getting-started/security-and-your-data',
  },
  ownership: {
    badge: 'No lock-in',
    title: 'The part that matters six months from now.',
    lead: 'Most panels make your infrastructure theirs. dPanel writes yours down.',
    body: 'Every server it sets up, and every change it makes, is written as Ansible, the open-source automation tool. That is the real thing, not a record of it: run it again and you get the same machine. Your servers stay ordinary Ubuntu or Debian machines with systemd services, so you can keep running them without dPanel. Ask, and we will write your infrastructure to a repository you own.',
  },
  guides: {
    badge: 'Guides',
    title: 'Read how it works.',
  },
  providers: {
    title: 'Works with',
    items: [
      'AWS',
      'Google Cloud',
      'DigitalOcean',
      'IDCloudHost',
      'Biznet Gio',
      'Alibaba Cloud',
      'Tencent Cloud',
      'Your own server',
    ],
  },
  closing: {
    title: 'Start with one server.',
    text: 'Create an account, add a server, and have something running this afternoon.',
  },
};
