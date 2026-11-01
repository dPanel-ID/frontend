---
title: Servers in dPanel
description: A server in dPanel is a Linux VPS it manages for you: launched at AWS, Google Cloud, DigitalOcean and others, or an Ubuntu server you connect over SSH.
sidebar_position: 1
sidebar_icon: server
sidebar_label: What a server is here
---

A server in dPanel is one Linux machine that the control panel looks after for you: a VPS dPanel launched in your own cloud account (AWS EC2, Google Compute Engine, a DigitalOcean Droplet, IDCloudHost, Alibaba Cloud ECS or Tencent Cloud CVM), or an Ubuntu or Debian server you already run and connect over SSH.

Once a server is in dPanel, you manage it from your browser. You don't need a terminal on your own computer.

- See whether it is healthy, and how much CPU, memory and disk it uses.
- Install software on it, such as a database or a language runtime.
- Start, stop and restart the services running on it.
- Manage its Linux user accounts.
- Browse its files and read its logs.
- Open a terminal on it.
- Deploy [applications](../applications/overview.md) to it, and put a [load balancer](../networking/load-balancers.md) with HTTPS in front of them.

![The Servers page in table view, listing servers with their status, provider, system, address and owner](../../assets/servers/servers-list.webp 'Servers: one row per server, with its status, provider and region, Ubuntu release, address and who created it.')

The list opens as a table. Switch to **Card Grid View** to see live CPU, memory and disk on each server's card.

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
