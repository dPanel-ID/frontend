---
title: Servers in dPanel
description: A server in dPanel is a Linux VPS it manages for you: one you connect with the dPanel agent, one launched at AWS, Google Cloud, DigitalOcean and others, or one you connect over SSH.
sidebar_position: 1
sidebar_icon: server
sidebar_label: What a server is here
---

A server in dPanel is one Linux machine that the control panel looks after for you: a server you already run and connect with one command, or a VPS dPanel launched in your own cloud account (AWS EC2, Google Compute Engine, a DigitalOcean Droplet, IDCloudHost, Alibaba Cloud ECS or Tencent Cloud CVM).

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

## The three ways to add a server

Open **Servers**, then **Create Server**. The recommended way is to connect a server with the dPanel agent: you run one command on the server, and the agent connects out to dPanel. dPanel never needs to log in to your server, so you don't have to trust it with an SSH key, open a port or even have a public IP.

![The Create Server page, offering Launch a cloud server or Connect your own server](../../assets/servers/create-choose-path.webp)

|              | Connect with the dPanel agent (recommended)           | Launch a cloud server                                                                  | Connect over SSH                     |
| ------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| Who it suits | You already have a server: a VPS, a PC at home, a VM  | You want a new machine and have a cloud account                                        | You prefer dPanel to log in itself   |
| Providers    | Any Linux server with systemd                         | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud | Any Ubuntu or Debian server over SSH |
| What happens | You run one command; the agent connects out to dPanel | dPanel creates the machine; it joins through the agent by itself                       | dPanel logs in with its SSH key      |
| You need     | A terminal on the server with `sudo`                  | A cloud account in dPanel                                                              | An SSH key, and the server's address |
| Time         | About a minute                                        | About 10 to 20 minutes                                                                 | About 5 minutes                      |

Every way, the server runs the dPanel agent and dPanel starts monitoring it. Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS. A new cloud server joins through the agent by default; you can choose SSH in the form instead.

## Where to go next

- New to dPanel? Start with [Before you start](./before-you-start.md).
- Bringing your own, the recommended way: [Connect a server with the dPanel agent](./register-a-private-machine.md).
- Launching a machine: [Create a cloud server](./cloud-providers/create-a-cloud-server.md).
- Letting dPanel log in over SSH instead: [Connect your own server over SSH](./connect-your-own-server.md).
- Already have one: [Your server page](./your-server-page.md) explains every tab.
- Control which ports can be reached: [Firewall](./firewall.md).
- Many servers at once, or a Kubernetes cluster: [Server groups and clusters](../clusters/overview.md).

You can also ask **Ask dPanel** to check a server or install something on it; see [Prompt cookbook](../ai/prompt-cookbook.md).

## What dPanel puts on the machine

If you maintain servers, this is what setup changes:

| What              | Where                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| The agent program | `/opt/dpanel/bin/dpanel-agent`, run as the systemd service `dpanel-agent` |
| Its settings      | `/opt/dpanel/etc/environment`                                             |
| Its data          | `/opt/dpanel/var/lib/agent`                                               |
| A Linux user      | `dpanel`, with passwordless `sudo`, on servers set up over SSH            |

Applications live in a folder per application, shown as **Work directory** on the application's **Settings** tab, and run as systemd services.

## Frequently asked questions

### Does dPanel host the server?

No. A cloud server runs in your own account at the provider, which bills you directly. A server you connect stays wherever it already runs.

### Which operating system does a server need?

Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS. A server you connect can run Ubuntu or Debian.

### Can I manage servers from a terminal instead?

Yes. The `dnocs` CLI lists servers, runs setup again, installs modules and manages the firewall. See [AI in the terminal](../ai/ai-in-the-terminal.md).

### What is the agent and is it safe to remove?

The agent is dPanel's program on the server. It reports usage and runs the jobs you start. Without it, the server page goes blank and jobs fail; **Reinstall** on the **Settings** tab puts it back. When the agent stops reporting or an update is available, the server page tells you what to do. See [Agent notices](./your-server-page.md#agent-notices).
