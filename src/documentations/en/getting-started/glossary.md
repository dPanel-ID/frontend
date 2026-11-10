---
title: Glossary
description: Plain one-sentence definitions of the words used in dPanel and its docs, from server, SSH key and module to load balancer, DNS, HTTPS, firewall and cluster.
sidebar_position: 99
sidebar_icon: file-text
sidebar_label: Glossary
---

This glossary explains, in one plain sentence each, the words you meet in dPanel and in this documentation. If a page uses a word you don't know, look it up here. You can also ask **Ask dPanel**, the AI assistant, "What is a load balancer?". See [Ask dPanel](../ai/overview.md).

## Servers and software

### Server

A computer that is always on and connected to the internet, which runs your website or app for visitors; in dPanel you connect one you have or launch a new one. See [Servers](../servers/overview.md).

### VM (virtual machine) or VPS

A server rented from a cloud provider that runs as software on the provider's bigger machines; to you it behaves like a normal computer.

### Cloud provider

A company that rents out servers by the hour or month, such as AWS, Google Cloud, DigitalOcean, IDCloudHost, Alibaba Cloud or Tencent Cloud. See [Cloud providers](../servers/cloud-providers/index.md).

### Cloud project (cloud account)

The connection between dPanel and your account at a cloud provider, which lets dPanel launch servers there for you. See [SSH keys and cloud projects](./ssh-keys-and-cloud-projects.md).

### Ubuntu

The free Linux operating system dPanel installs and expects on servers.

### SSH

The secure way to log in to a server over the internet and run commands on it.

### SSH key

A pair of matching files that lets a computer log in to a server over SSH without a password; the public half goes on the server and the private half stays secret.

### Agent

dPanel's small program on each server, which reports the server's health and runs the jobs dPanel sends it.

### Server setup

The first job dPanel runs on a new server: it installs the agent and prepares the machine; you can run it again if it failed.

### Module

A piece of software dPanel installs on a server for you, such as PHP, Node.js, MariaDB, PostgreSQL, Caddy or Docker. See [Install software](../servers/install-software.md).

### Runtime (language)

The software that runs code written in one language, such as PHP for WordPress or Node.js for a JavaScript app.

### Database

The program that stores an application's data in tables, such as MariaDB, PostgreSQL, MongoDB or Redis.

### DB Manager

dPanel's web tool for opening a MariaDB or PostgreSQL database in the browser, to browse, query, import or export data.

### Terminal

A window where you type commands to a computer instead of clicking.

### root and sudo

`root` is the administrator account on Linux. `sudo` runs one command with administrator rights.

### systemd

The part of Linux that starts services and keeps them running. `systemctl` is the command that controls it.

### Port

A numbered door on a server that one program listens on, such as 443 for websites over HTTPS or 5432 for PostgreSQL.

### Firewall

The guard on a server that decides which ports people can reach; dPanel manages Ubuntu's built-in firewall, ufw. See [Firewall](../servers/firewall.md).

### TCP and UDP

The two basic ways programs send data over a network; websites and databases use TCP, while some games and voice services use UDP.

## Applications

### Application

Your code, in a GitHub repository, that dPanel builds and runs on a server, such as a WordPress site or a Laravel app. See [Applications](../applications/overview.md).

### Repository

The folder of code, with its history, that you keep on GitHub.

### Branch and commit

A commit is one saved version of your code; a branch is a line of commits, such as `main`.

### Build (artifact)

Your code turned once into a ready-to-run package from one commit; dPanel keeps every build so you can go back to an earlier one.

### Deployment (release)

A build placed on a server and started, so visitors can use it.

### Rollback

Going back to an earlier build when a new one has a problem. See [Deployments and rollback](../applications/deployments-and-rollback.md).

### Application definition

The saved description of how to build and run your app: its language, build commands and start command, kept in dPanel or in a `.devetek` folder in your repository.

### Environment variable

A named setting, such as `APP_ENV=production` or a database password, that your app reads when it starts. See [Environment variables](../applications/environment-variables.md).

### Service

A program that Linux starts for you, keeps running in the background and restarts after a reboot; dPanel runs each deployment as one.

### Log

A program's running diary, one line per event, which you read to find out what happened or what went wrong. See [Reading logs](../logs/reading-logs.md).

## Traffic and domains

### Domain

A name people type to reach your site, such as `example.com`, which you buy from a domain registrar.

### Subdomain

A name under your domain, such as `shop.example.com`.

### DNS

The internet's address book, which turns a domain name into the address of the server that answers it.

### A record

The DNS record that points a name at an IPv4 address, such as `blog.example.com` at `203.0.113.10`.

### DNS record

One entry in that address book, such as "shop.example.com points to 203.0.113.10". See [DNS records](../networking/dns-records.md).

### IP address

The number that identifies a server on the internet, such as `203.0.113.10`.

### TLS, SSL and HTTPS

HTTPS is the secure version of a web address, shown with a padlock; it relies on a TLS certificate (often still called SSL), which dPanel gets free from Let's Encrypt and renews for you.

### Load balancer

The front door of your website: it answers on your domain, handles HTTPS, and passes each visitor's request to your application. See [Load balancers](../networking/load-balancers.md).

### Gateway

The server a load balancer runs on, which receives the visitors' traffic.

### Engine

The web server program a load balancer uses on its gateway: Caddy, Apache APISIX or HAProxy.

### L4 and L7

L7 load balancers route web traffic by address and path; L4 load balancers pass raw TCP or UDP connections, for example to a database.

### Cloudflare proxying

An option that sends visitors through Cloudflare's network before your server, hiding the server's address.

## Organising your work

### Service account

A dPanel login for a program, such as a script, a CI job or an AI agent, instead of a person. It signs in with a token you can revoke at any time. See [Service accounts](../teams/service-accounts.md).

### Workspace

A separate space with its own servers, applications and settings: your personal workspace, or a team workspace you share. See [Workspaces](./workspaces.md).

### Team

The people who share a team workspace, each with a role such as Owner, Admin, Developer or Viewer that decides what they may do. See [Teams](../teams/teams.md).

### Job (execution)

One piece of work dPanel runs for you, such as setting up a server, installing a module or deploying a build; each one is recorded with its result.

### Worker

The program that carries out a workspace's jobs on your servers; dPanel's shared workers do it by default, or you can use your own. See [Workers](../workers/overview.md).

### GitHub Actions

GitHub's built-in way to run scripts, called workflows, on GitHub's machines; one way to run a private worker.

### Server group

A named set of servers you act on together. See [Server groups and clusters](../clusters/overview.md).

### Cluster and Kubernetes

Kubernetes is a system that runs containers across several servers as one; a cluster is such a group of servers, built in dPanel with k3s or RKE2.

### Container

An application packed together with everything it needs, so it runs the same on any server; Docker is the best-known tool for them.

### IaC (infrastructure as code)

Writing down how servers are set up as files, so the same setup can be repeated; dPanel records its work as Ansible files.

## The AI assistant

### Ask dPanel

The AI assistant built into dPanel, which answers questions and proposes changes for you to approve. See [Ask dPanel](../ai/overview.md).

### Approval card

The box in the chat that shows a change the assistant proposed, with **Approve** and **Reject** buttons. See [Approve or reject changes](../ai/approvals-and-secrets.md).

### dnocs (CLI)

dPanel's command-line tool, which you run in a terminal to work with dPanel and its assistant. See [Use AI in the terminal](../ai/ai-in-the-terminal.md).

### llms.txt

A plain-text index of this documentation for AI tools; `llms-full.txt` holds every page.

## Frequently asked questions

### A word I need is missing. What do I do?

Ask **Ask dPanel** "What does … mean in dPanel?". It answers from this documentation.

### Are "build" and "artifact" the same thing?

Yes. dPanel's pages say build or artifact for the same ready-to-run package made from one commit.

### Are "deployment" and "release" the same thing?

Yes. Both mean a build placed on a server and started.
