import type { DocsIntroCopy } from '../-rules/intro';

export const DOCS_INTRO_EN: DocsIntroCopy = {
  hero: {
    badge: 'Introduction',
    title: 'Your servers, applications and domains, in one place.',
    subtitle:
      'dPanel launches a server at your cloud provider, or connects one you already run, then sets it up and deploys your application. Everything it builds is written down as Ansible that stays yours.',
    primaryCta: 'Create your account',
    secondaryCta: 'Watch dPanel on YouTube',
  },
  start: {
    badge: 'Getting started',
    title: 'From an empty account to a running application.',
    steps: [
      {
        title: 'Bring a server, or let dPanel launch one',
        text: 'Connect a machine you already run over SSH, or launch a VM at AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud or Tencent Cloud. Either way, dPanel takes it from there.',
      },
      {
        title: 'It sets the server up',
        text: 'Ready in about 10 to 20 minutes, with no configuration guide to follow and nothing to install by hand.',
      },
      {
        title: 'Deploy your application',
        text: 'Point dPanel at your Git repository. It builds the release, ships it to the server, and keeps a record of every attempt. Or ask the built-in AI assistant, Ask dPanel, to set it up with you.',
      },
      {
        title: 'Give it a domain',
        text: 'Add DNS records and put a load balancer in front when you are ready for real traffic.',
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
        text: 'Launch new machines or connect your own, and watch CPU, memory and disk across the fleet.',
      },
      {
        key: 'applications',
        title: 'Applications',
        text: 'Deploy from Git, keep every artifact, and see which release is actually live.',
      },
      {
        key: 'traffic',
        title: 'Traffic',
        text: 'Load balancers, domains and DNS records, managed beside the servers behind them.',
      },
      {
        key: 'data',
        title: 'Data and services',
        text: 'Install the databases and services your application depends on, without a shell session.',
      },
      {
        key: 'activity',
        title: 'Activity',
        text: 'Every operation recorded: who ran it, how long it took, and what failed if anything did.',
      },
      {
        key: 'teams',
        title: 'Teams',
        text: 'Work alone in a personal workspace, or share one with the people you build with.',
      },
    ],
  },
  ownership: {
    badge: 'No lock-in',
    title: 'The part that matters six months from now.',
    lead: 'Most panels make your infrastructure theirs. dPanel writes yours down.',
    body: 'Every server it builds, and every change it makes, is written as Ansible. That is the real thing, not a record of it: run it again and you get the same machine, every time. You can run it yourself, with dPanel out of the loop entirely. The repository it lives in is private for now, so there is no pull request for you to read — but ask, and we will write your infrastructure to a repository you own, in another stack such as OpenTofu if you would rather.',
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
      'Alibaba Cloud',
      'Tencent Cloud',
      'Your own server over SSH',
    ],
  },
  closing: {
    title: 'Start with one server.',
    text: 'Create an account, connect a provider, and have something running this afternoon.',
  },
};
