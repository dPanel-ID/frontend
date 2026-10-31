---
title: What a server is here
description: One Linux machine that dPanel looks after for you, and the two ways to add one.
sidebar_position: 1
sidebar_icon: server
---

A server is one Linux machine that dPanel looks after for you. It can be a machine dPanel launched in your cloud account, or one you already run and connect yourself.

Once a server is in dPanel, you manage it from your browser. You don't need a terminal on your own computer.

- See whether it is healthy, and how much CPU, memory and disk it uses.
- Install software on it, such as a database or a language runtime.
- Start, stop and restart the services running on it.
- Manage its Linux user accounts.
- Browse its files and read its logs.
- Open a terminal on it.
- Deploy [applications](../applications/overview.md) to it.

![The Servers page listing servers with their status, provider and live usage](../../assets/servers/servers-list.webp 'Servers: each card shows the status, the address, what runs on it and live CPU, memory and disk.')

## The two ways to add a server

Open **Servers**, then **Create Server**. The page offers both paths.

![The Create Server page, offering Launch a cloud server or Connect your own server](../../assets/servers/create-choose-path.webp)

|                  | Launch a cloud server                                    | Connect your own server              |
| ---------------- | -------------------------------------------------------- | ------------------------------------ |
| Who it suits     | You want a new machine and have a cloud account          | You already have a machine running   |
| Providers        | AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio | Any Ubuntu or Debian server over SSH |
| What dPanel does | Creates the machine, then sets it up                     | Connects over SSH, then sets it up   |
| You need         | A cloud account and an SSH key in dPanel                 | An SSH key, and the server's address |
| Time             | About 10 to 20 minutes                                   | About 5 minutes                      |

Either way, dPanel creates the `dpanel` user, installs its agent and starts monitoring the machine.

## Where to go next

- New to dPanel? Start with [Before you start](./before-you-start.md).
- Launching a machine: [Create a cloud server](./cloud-providers/create-a-cloud-server.md).
- Bringing your own: [Connect your own server](./connect-your-own-server.md).
