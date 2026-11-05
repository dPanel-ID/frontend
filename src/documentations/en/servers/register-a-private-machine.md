---
title: Register a private machine
description: Add a PC, a home server or a VM behind a router to dPanel with one command. It needs no public IP and no open port.
sidebar_position: 4
sidebar_icon: log-in
sidebar_label: Private machine
---

A private machine is a computer that nothing on the internet can reach: a PC, a home server, or a VM behind a router. dPanel never connects to it. Instead, you run one command on the machine, which installs the dPanel agent, and the agent keeps an outgoing connection to dPanel. The machine then shows up on your servers page.

## What you need first

- A Linux machine with systemd, such as Ubuntu or Debian, on Intel/AMD (`amd64`) or ARM (`arm64`).
- A terminal on that machine where you can use `sudo`.
- Internet access from the machine. It only connects out, so no port forwarding is needed.

## Register it

1. Install the dnocs command line tool on the machine. Follow [Install dnocs](../ai/ai-in-the-terminal.md#install-dnocs).
2. Sign in, and pick the workspace the machine belongs to (skip this to keep it in your personal space):

   ```bash
   dnocs auth login -u <your username>
   dnocs workspace list
   dnocs workspace set --id <workspace id>
   ```

3. Register the machine:

   ```bash
   sudo dnocs machine register
   ```

   dnocs asks you to confirm, installs the agent, and waits until the server is ready. That usually takes under a minute.

The server now appears on your [servers page](/servers) with a **Private** badge.

## What you can do with it

| You can | Not yet |
| --- | --- |
| See CPU, memory and disk usage | Build and deploy applications (next release) |
| Browse and edit files | Open the browser terminal |
| Start, stop and restart services | |
| Read logs | |
| Manage Linux users | |
| Install modules such as MariaDB, Redis or Docker | |

## How modules get installed

A private machine runs its own installer, so nothing on the internet needs to reach it. The first time you install a module, the agent sets up the installer on the machine (Python and Ansible, about a minute and a half), then the installer runs the job on the machine itself and stops again after 10 quiet minutes. If the machine is off or offline when you start an install, the install waits and then fails; start it again once the machine is back.

A private machine can never have a load balancer or a domain: nothing on the internet can reach it. Apps you run on it are available on your own network.

## Register it again

Running `sudo dnocs machine register` again on the same machine keeps the same server in dPanel and gives its agent a new credential. A machine belongs to one workspace at a time, and a workspace can hold up to 10 private machines.

## Remove it

Delete the server in dPanel (from its page, or with `dnocs server delete --id <id>`). dPanel removes it at once, and the agent's credential stops working. Then stop the agent on the machine:

```bash
sudo systemctl disable --now dpanel-active-agent
```
