---
title: What is dPanel - dNocs?
description: dPanel - dNocs is a web control panel that connects your servers or launches new ones, deploys apps from GitHub, and manages DNS, HTTPS and logs.
sidebar_position: 0
sidebar_icon: rocket
sidebar_label: What is dPanel?
---

dPanel - dNocs (distributed Node & Operations Control system) is a web-based server control panel: a website where you run your own servers by clicking instead of typing commands. It connects a server you already have, such as a VPS or a machine at home, or launches Ubuntu servers in your own cloud account, then deploys your applications from GitHub, puts them behind an HTTPS load balancer, manages their DNS records and shows their logs, all from the browser.

## Who it is for

- **Developers and small teams** who want their code running on their own servers without writing deployment scripts.
- **Agencies and freelancers** who look after many client sites and want one place to see every server, application and domain.
- **Ops engineers** who want one shared way for a team to create servers and ship releases, with roles instead of shared root passwords.

You need no terminal on your own computer. dPanel runs a small program, the agent, on each server. The agent connects out to dPanel, reports the server's health and carries out your jobs, so dPanel never needs to log in to your server. If you prefer, dPanel can connect over SSH instead.

## What dPanel does

| Area           | What you can do                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Servers        | Connect any Linux server with one command, or launch a VM at a cloud provider. See live CPU, memory and disk, systemd services, users, open ports, files and logs, and manage the server's firewall.   |
| Software       | Install databases, runtimes and web servers from a catalogue of tested modules, such as MariaDB, Go or Caddy.                                                                                           |
| Applications   | Build a GitHub repository on your server, run it as a systemd service, keep every build, and roll back in one step.                                                                                     |
| Load balancers | Publish an application on a domain with a free Let's Encrypt HTTPS certificate, renewed for you.                                                                                                        |
| Domains        | Manage the DNS records of a domain hosted at Cloudflare or DigitalOcean.                                                                                                                                |
| Logs           | Read application, load balancer, build and server logs, search them, and download up to 3 days back.                                                                                                    |
| Clusters       | Group servers, and turn a group into a Kubernetes cluster with k3s or RKE2.                                                                                                                             |
| Teams          | Share a workspace with your team and give each person a role, from Viewer to Owner.                                                                                                                     |
| Workers        | Run your workspace's jobs on dPanel's shared workers, or on private workers you run yourself.                                                                                                           |
| Assistant      | Ask questions in plain language, or let [Ask dPanel](../ai/overview.md) prepare changes for you to approve.                                                                                             |

## Supported providers and systems

- **Cloud providers:** AWS EC2, Google Compute Engine, DigitalOcean Droplets, IDCloudHost, Alibaba Cloud ECS and Tencent Cloud CVM. The launch form also lists Biznet Gio. See [Cloud providers](../servers/cloud-providers/index.md).
- **Your own server:** any VPS, bare-metal machine, home server or Raspberry Pi running Linux with systemd, on Intel/AMD or ARM, connected with the dPanel agent. It needs no public IP. See [Connect a server with the dPanel agent](../servers/register-a-private-machine.md). Ubuntu and Debian servers can also be [connected over SSH](../servers/connect-your-own-server.md).
- **Operating system on launched servers:** Ubuntu 24.04 LTS or 26.04 LTS.
- **Code:** GitHub repositories your GitHub account or organisation can read, built with the commands you give.
- **DNS:** Cloudflare and DigitalOcean.

dPanel does not resell servers or domains. Machines run in your own provider account, and your provider bills you directly.

## dPanel compared with managing a VPS by hand

| Task                      | By hand on a VPS                                                    | With dPanel                                                              |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Create a server           | Click through the provider console, set up SSH keys and a firewall  | Pick provider, region and size in one form; ready in about 10–20 minutes |
| Install a database        | `apt install`, edit config files, create a systemd unit             | Pick the module, answer a few questions                                  |
| Deploy an app from GitHub | Clone, build, write a service file, restart, repeat on every change | Pick the repository and branch; press **Build and release** after a push |
| Roll back a bad release   | Find the old build, if you kept it                                  | **Roll back** on any kept build                                          |
| HTTPS on a domain         | Install a web server, set up Certbot, add the DNS record            | Create a load balancer; dPanel adds the record and the certificate       |
| Read logs                 | SSH in, `journalctl` or `tail -f`                                   | Search and download them in the browser                                  |
| Give a teammate access    | Share a key or a password                                           | Add them to the team with a role                                         |

You keep full access to the machine. dPanel works with standard Linux tools, so you can still sign in yourself whenever you want.

## How to start

Follow [Your first steps](./first-steps.md): sign in, pick a workspace, get a server, deploy your first app with a tutorial, and put it on your domain. New words are explained in the [Glossary](./glossary.md).

## Frequently asked questions

### Is there a dark theme?

Yes. Press the moon icon at the bottom of the sidebar to switch between light and dark. Other dPanel services on the same domain, such as the database manager, follow the theme you pick.

### What does dNocs stand for?

dNocs stands for distributed Node & Operations Control system. dPanel is the control panel you use in the browser; the full product name is dPanel - dNocs.

### Do I need to install anything?

No, not on your computer. dPanel runs in your browser at dnocs.devetek.app. Each server runs the dPanel agent: you install it with one command, a cloud server installs it by itself, or dPanel installs it over SSH.

### Which operating systems does dPanel support?

Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS. A server you connect with the dPanel agent can run any Linux with systemd, on Intel/AMD (`amd64`) or ARM (`arm64`). A server you connect over SSH must run Ubuntu or Debian.

### Who pays for the servers?

Your cloud provider bills you directly, because dPanel creates machines inside your own provider account. dPanel does not resell servers.

### Can I still use SSH on my servers?

Yes. dPanel has a terminal in the browser, and you can add your own public key to a server and connect with any SSH client. dPanel itself doesn't need SSH on a server connected with the agent. See [Connect over SSH](../servers/connect-over-ssh.md).

### What happens to my servers if I stop using dPanel?

They keep running where they are, with your applications as systemd services. Deleting a server you connected yourself only makes dPanel forget it; the machine is left alone.
