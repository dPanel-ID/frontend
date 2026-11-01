---
title: What is dPanel - dNocs?
description: dPanel - dNocs is a web control panel that launches or connects Ubuntu servers, deploys apps from GitHub, and manages DNS, HTTPS and logs.
sidebar_position: 0
sidebar_icon: rocket
sidebar_label: What is dPanel?
---

dPanel - dNocs (distributed Node & Operations Control system) is a web-based server control panel. It launches Ubuntu servers in your own cloud account or connects a VPS you already run, then deploys your applications from GitHub, puts them behind an HTTPS load balancer, manages their DNS records and shows their logs, all from the browser.

## Who it is for

- **Developers and small teams** who want their code running on their own servers without writing deployment scripts.
- **Agencies and freelancers** who look after many client sites and want one place to see every server, application and domain.
- **Ops engineers** who want one shared way for a team to create servers and ship releases, with roles instead of shared root passwords.

You need no terminal on your own computer. dPanel signs in to your servers over SSH with a key it holds for you, and runs a small agent on each server to report its health.

## What dPanel does

| Area           | What you can do                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Servers        | Launch a VM at a cloud provider, or connect any Ubuntu or Debian server over SSH. See live CPU, memory and disk, systemd services, users, open ports, files and logs. |
| Software       | Install databases, runtimes and web servers from a catalogue of tested modules, such as MariaDB, Go or Caddy.                                                         |
| Applications   | Build a GitHub repository on your server, run it as a systemd service, keep every build, and roll back in one step.                                                   |
| Load balancers | Publish an application on a domain with a free Let's Encrypt HTTPS certificate, renewed for you.                                                                      |
| Domains        | Manage the DNS records of a domain hosted at Cloudflare or DigitalOcean.                                                                                              |
| Logs           | Read application, load balancer, build and server logs, search them, and download up to 10 days back.                                                                 |
| Teams          | Share a workspace with your team and give each person a role, from Viewer to Owner.                                                                                   |
| Assistant      | Ask questions about your infrastructure in plain language with [Ask dPanel](./ask-dpanel.md).                                                                         |

## Supported providers and systems

- **Cloud providers:** AWS EC2, Google Compute Engine, DigitalOcean Droplets, IDCloudHost, Alibaba Cloud ECS and Tencent Cloud CVM. The launch form also lists Biznet Gio. See [Cloud providers](../servers/cloud-providers/index.md).
- **Your own server:** any VPS, bare-metal machine or home-lab box running Ubuntu or Debian that dPanel can reach over SSH. See [Connect your own server](../servers/connect-your-own-server.md).
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

You keep full access to the machine. dPanel works through SSH and standard Ubuntu tools, so you can still sign in yourself whenever you want.

## How to start

1. [Sign in](./sign-in.md) and pick a [workspace](./workspaces.md).
2. Create an [SSH key, and connect a cloud account](./ssh-keys-and-cloud-projects.md) if you want dPanel to launch a server.
3. [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md) or [connect your own](../servers/connect-your-own-server.md).
4. [Connect GitHub](./connect-github.md) and [create an application](../applications/create-an-application.md).
5. Give it a domain with a [load balancer](../networking/load-balancers.md).

## Frequently asked questions

### What does dNocs stand for?

dNocs stands for distributed Node & Operations Control system. dPanel is the control panel you use in the browser; the full product name is dPanel - dNocs.

### Do I need to install anything?

No. dPanel runs in your browser at dnocs.devetek.app. On each server it manages, dPanel installs its own agent over SSH for you.

### Which operating systems does dPanel support?

Servers dPanel launches run Ubuntu 24.04 LTS or 26.04 LTS. A server you connect yourself can run Ubuntu or Debian.

### Who pays for the servers?

Your cloud provider bills you directly, because dPanel creates machines inside your own provider account. dPanel does not resell servers.

### Can I still use SSH on my servers?

Yes. dPanel has a terminal in the browser, and you can add your own public key to a server and connect with any SSH client. See [Connect over SSH](../servers/connect-over-ssh.md).

### What happens to my servers if I stop using dPanel?

They keep running at your provider, with your applications as systemd services. Deleting a server you connected yourself only makes dPanel forget it; the machine is left alone.
