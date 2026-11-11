---
title: Your first steps
description: A beginner's path through dPanel - dNocs in six steps, from signing in to an app live on your own domain with HTTPS, linking the right page for each.
sidebar_position: 0.5
sidebar_icon: list-checks
sidebar_label: Your first steps
---

New to dPanel - dNocs? Follow these six steps in order and, in about an hour, you go from an empty account to a website running on your own server at your own domain with HTTPS. Each step links to the page that walks you through it.

Never run a server before? Read [How a website runs on your server](../tutorials/how-a-website-runs.md) first, and keep the [Glossary](./glossary.md) open for any word you don't know.

## Your first hour with dPanel

1. **Sign in.** Open [dnocs.devetek.app](https://dnocs.devetek.app) and sign in with Google or a username and password. See [Sign in and your profile](./sign-in.md).
2. **Pick a workspace.** A workspace is the box your servers, applications and domains live in. Use your personal workspace to try things out, or a team workspace to share with others. See [Workspaces](./workspaces.md).
3. **Get a server.** A server is the computer your website runs on: a machine in a data centre, or one at home.
   - **Already have one?** A VPS (a virtual server from a hosting company), a home server, a homelab PC or a Raspberry Pi: connect it with the dPanel agent. In dPanel, open **Servers**, then **Create Server**, choose **Get install command** and run that one command on the machine with `sudo`; the server shows **Ready** within a minute. It needs no SSH key, no public IP and no open port. See [Connect a server with the dPanel agent](../servers/register-a-private-machine.md).
   - **No server yet?** Connect your cloud account, such as AWS, Google Cloud or DigitalOcean, and launch one from dPanel. It joins through the agent by itself. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).
   - **Prefer to let dPanel log in over SSH?** That works too; see [dPanel agent or SSH: which one?](../servers/register-a-private-machine.md#dpanel-agent-or-ssh-which-one)
4. **Deploy your first app.** [Connect GitHub](./connect-github.md), then follow a tutorial from start to finish. Each tutorial starts by launching a server; if you did step 3, skip that step and use your server, as long as it has at least 2 vCPU and 4 GB RAM:
   - [Deploy WordPress with MariaDB](../tutorials/deploy-wordpress.md), the simplest place to start.
   - [Deploy Laravel with PostgreSQL](../tutorials/deploy-laravel.md), for a PHP web application.
5. **Put it on a domain.** Add your domain under **Domain & DNS**, then create a load balancer: the front door that answers on your domain and gets a free HTTPS certificate. See [Domains and DNS](../networking/domains-and-dns.md) and [Load balancers](../networking/load-balancers.md).
6. **Keep an eye on it.** The [dashboard](./dashboard.md) tells you whether everything is all right, and [Reading logs](../logs/reading-logs.md) shows what your app is doing.

You can also let the assistant do the clicking: describe what you want and approve each change. See [Ask dPanel](../ai/overview.md).

## How long each step takes

| Step               | Your time     | Waiting for dPanel                         |
| ------------------ | ------------- | ------------------------------------------ |
| Sign in, workspace | 2 minutes     | none                                       |
| Cloud server       | 5 minutes     | 10–20 minutes while the server is set up   |
| Your own server    | 5 minutes     | about a minute while the agent connects    |
| First app          | 10–15 minutes | 5–15 minutes for software and the build    |
| Domain and HTTPS   | 5 minutes     | 1–10 minutes for DNS and the certificate   |

## Before you start

- **A GitHub account** with the code you want to run. The tutorials use public example repositories you can fork.
- **A cloud account**, only if you want dPanel to launch a server for you. Your provider bills you for the server directly; dPanel does not resell servers.
- **A domain name** at Cloudflare or DigitalOcean, so dPanel can create the DNS record for you. A domain elsewhere works too, but you add the record yourself.

## Frequently asked questions

### Do I need to know Linux or use a terminal?

Almost. If dPanel launches your server, every step happens in the browser. Connecting a server you already have takes one command on that server, which you copy from dPanel; [the guide](../servers/register-a-private-machine.md) shows each step. After that, dPanel installs software from a list, gives you a terminal in the browser, and shows logs on the page.

### Can I use my home server or homelab?

Yes. Connect it with the [dPanel agent](../servers/register-a-private-machine.md): the agent connects out to dPanel, so the machine needs no public IP and no port forwarding. To share it with a team, see [Share a homelab with your team](../tutorials/team-homelab.md).

### Can I try dPanel without a domain?

Yes. Your application runs without one; you only need a domain to publish it on the internet with HTTPS in step 5.

### Who bills me for the server?

Your cloud provider, for every hour a cloud server exists. dPanel does not resell servers. A server you connect yourself costs whatever it costs you today. Delete a server you no longer use so it stops costing money. See [Delete a server](../servers/delete-a-server.md).

### Something went wrong. Where do I look?

Start with [Common problems and fixes](../troubleshooting/faq.md). The dashboard's **Needs your attention** list also points at anything that failed.
