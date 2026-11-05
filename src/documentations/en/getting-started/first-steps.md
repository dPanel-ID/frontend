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
3. **Get a server.** A server is the computer in a data centre your website runs on. Either way, dPanel first needs an [SSH key](./ssh-keys-and-cloud-projects.md), the password-free key it uses to sign in to the server.
   - **No server yet?** Connect your cloud account, such as AWS, Google Cloud or DigitalOcean, and launch one from dPanel. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).
   - **Already rent a VPS?** Connect it over SSH instead. See [Connect your own server](../servers/connect-your-own-server.md).
4. **Deploy your first app.** [Connect GitHub](./connect-github.md), then follow a tutorial from start to finish:
   - [Deploy WordPress with MariaDB](../tutorials/deploy-wordpress.md), the simplest place to start.
   - [Deploy Laravel with PostgreSQL](../tutorials/deploy-laravel.md), for a PHP web application.
5. **Put it on a domain.** Add your domain under **Domain & DNS**, then create a load balancer: the front door that answers on your domain and gets a free HTTPS certificate. See [Domains and DNS](../networking/domains-and-dns.md) and [Load balancers](../networking/load-balancers.md).
6. **Keep an eye on it.** The [dashboard](./dashboard.md) tells you whether everything is all right, and [Reading logs](../logs/reading-logs.md) shows what your app is doing.

You can also let the assistant do the clicking: describe what you want and approve each change. See [Ask dPanel](../ai/overview.md).

## How long each step takes

| Step               | Your time     | Waiting for dPanel                         |
| ------------------ | ------------- | ------------------------------------------ |
| Sign in, workspace | 2 minutes     | none                                       |
| SSH key            | 1 minute      | none                                       |
| Cloud server       | 5 minutes     | 10–20 minutes while the server is set up   |
| Your own server    | 5 minutes     | a few minutes while dPanel installs itself |
| First app          | 10–15 minutes | 5–15 minutes for software and the build    |
| Domain and HTTPS   | 5 minutes     | 1–10 minutes for DNS and the certificate   |

## Before you start

- **A GitHub account** with the code you want to run. The tutorials use public example repositories you can fork.
- **A cloud account**, only if you want dPanel to launch a server for you. Your provider bills you for the server directly; dPanel does not resell servers.
- **A domain name** at Cloudflare or DigitalOcean, so dPanel can create the DNS record for you. A domain elsewhere works too, but you add the record yourself.

## Frequently asked questions

### Do I need to know Linux or use a terminal?

No. Every step happens in the browser. dPanel signs in to your server over SSH for you, installs software from a list, and shows logs on the page.

### Can I try dPanel without a domain?

Yes. Your application runs without one; you only need a domain to publish it on the internet with HTTPS in step 5.

### Who bills me for the server?

Your cloud provider, for every hour the server exists. dPanel does not resell servers. Delete a server you no longer use so it stops costing money. See [Delete a server](../servers/delete-a-server.md).

### Something went wrong. Where do I look?

Start with [Common problems and fixes](../troubleshooting/faq.md). The dashboard's **Needs your attention** list also points at anything that failed.
