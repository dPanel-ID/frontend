---
title: Servers in dPanel
description: A server in dPanel is a Linux VPS it manages for you: launched at AWS, Google Cloud, DigitalOcean and others, or an Ubuntu server you connect over SSH.
sidebar_position: 1
sidebar_icon: server
sidebar_label: What a server is here
---

A server in dPanel is one Linux machine that the control panel looks after for you: a VPS dPanel launched in your own cloud account (AWS EC2, Google Compute Engine, a DigitalOcean Droplet, IDCloudHost, Alibaba Cloud ECS or Tencent Cloud CVM), or an Ubuntu or Debian server you already run and connect over SSH.

A VPS (virtual private server) is a rented Linux computer in a data centre. dPanel installs a small program on it, the **agent**, which reports the server's health and carries out the jobs you start. New to these words? See the [Glossary](../getting-started/glossary.md).

Once a server is in dPanel, you manage it from your browser. You don't need a terminal on your own computer.

- See whether it is healthy, and how much CPU, memory and disk it uses.
- Install software on it, such as a database or a language runtime, and open its databases in DB Manager.
- Start, stop and restart the services running on it.
- Manage its Linux user accounts.
- Browse its files and read its logs.
- Open a terminal on it.
- Choose which ports the internet can reach with its [firewall](./firewall.md).
- Deploy [applications](../applications/overview.md) to it, and put a [load balancer](../networking/load-balancers.md) with HTTPS in front of them.

![The Servers page in table view, listing servers with their status, provider, system, address and owner](../../assets/servers/servers-list.webp 'Servers: one row per server, with its status, provider and region, Ubuntu release, address and who created it.')

The list opens as a table. Switch to **Card Grid View** to see live CPU, memory and disk on each server's card. The search box ignores letter case, and the owner column names the person who created each server.

## The two ways to add a server

Open **Servers**, then **Create Server**. The page offers both paths.

![The Create Server page, offering Launch a cloud server or Connect your own server](../../assets/servers/create-choose-path.webp)

|                  | Launch a cloud server                                                                  | Connect your own server              |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Who it suits     | You want a new machine and have a cloud account                                        | You already have a machine running   |
| Providers        | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud | Any Ubuntu or Debian server over SSH |
| What dPanel does | Creates the machine, then sets it up                                                   | Connects over SSH, then sets it up   |
| You need         | A cloud account and an SSH key in dPanel                                               | An SSH key, and the server's address |
| Time             | About 10 to 20 minutes                                                                 | About 5 minutes                      |

Either way, dPanel installs its agent and starts monitoring the machine. Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS.

## Where to go next

- New to dPanel? Start with [Before you start](./before-you-start.md).
- Launching a machine: [Create a cloud server](./cloud-providers/create-a-cloud-server.md).
- Bringing your own: [Connect your own server](./connect-your-own-server.md).
- Already have one: [Your server page](./your-server-page.md) explains every tab.
- Control which ports can be reached: [Firewall](./firewall.md).
- Many servers at once, or a Kubernetes cluster: [Server groups and clusters](../clusters/overview.md).

You can also ask **Ask dPanel** to check a server or install something on it; see [Prompt cookbook](../ai/prompt-cookbook.md).

## Frequently asked questions

### Does dPanel host the server?

No. A cloud server runs in your own account at the provider, which bills you directly. A server you connect stays wherever it already runs.

### Which operating system does a server need?

Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS. A server you connect can run Ubuntu or Debian.

### Can I manage servers from a terminal instead?

Yes. The `dnocs` CLI lists servers, runs setup again, installs modules and manages the firewall. See [AI in the terminal](../ai/ai-in-the-terminal.md).

### What is the agent and is it safe to remove?

The agent is dPanel's program on the server. It reports usage and runs the jobs you start. Without it, the server page goes blank and jobs fail; **Reinstall** on the **Settings** tab puts it back. When the agent stops reporting or an update is available, the server page tells you what to do. See [Agent notices](./your-server-page.md#agent-notices).
