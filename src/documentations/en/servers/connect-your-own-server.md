---
title: Connect your own server
description: Connect a VPS, bare-metal or home-lab Ubuntu or Debian server you already run to dPanel over SSH. dPanel installs its agent in about 5 minutes.
sidebar_position: 3
sidebar_icon: terminal
sidebar_label: Manual SSH
---

You can add a server you already run, at any hosting company or at home, to dPanel. dPanel signs in over SSH with one of your dPanel SSH keys, installs its agent, and the machine then works like any server dPanel launched. It takes about 5 minutes and needs no cloud account.

## What you need first

- A server running Ubuntu or Debian that dPanel can reach over SSH from the internet.
- A Linux user on it that can use `sudo`, or `root`.
- An SSH key in dPanel. You can also create one inside the form.

## Connect it

1. Open **Servers**, then **Create Server**, then **Connect a server**.
2. Under **Choose an SSH key**, pick a key, or press **Create SSH key**.
3. Copy the command under **Authorize the key on your server** and run it once on the server. It adds the key's public half to `~/.ssh/authorized_keys`.
4. Tick **I added this key to the server**.
5. Under **Where is the server?**, fill in **Server address** (an IPv4 address, hostname or domain), **SSH port** and **Linux user**.
6. When the **Review** panel reads 3/3, press **Connect server**.

![The Connect your own server form, with an SSH key selected and the command to authorize it](../../assets/servers/connect-own-server.webp)

:::warning[Run the command on the right machine]
Run the command as the same user you enter in **Linux user**. Setup stops early if dPanel cannot log in with the key.
:::

## What happens next

dPanel saves the server, then installs its agent over SSH. Follow the progress on the server page. It usually takes about 5 minutes.

When the badge reads **Ready**, the server works like any other. See [Your server page](./your-server-page.md).

:::info[Deleting a server you connected]
dPanel only forgets a server you connected yourself. Your machine keeps running. See [Delete a server](./delete-a-server.md).
:::

## Frequently asked questions

### Which operating systems can I connect?

Ubuntu and Debian. dPanel installs its agent and modules with the standard tools of those systems.

### Does dPanel need the root password?

No. dPanel signs in with an SSH key, never a password. The Linux user you enter must be `root` or able to use `sudo`.

### Does my server need a public IP address?

dPanel must be able to reach the **Server address** and **SSH port** you enter. A server behind a home router needs the SSH port forwarded to it, or a public address.

### What happens if I remove the server from dPanel?

dPanel forgets it and your machine keeps running, with everything on it. See [Delete a server](./delete-a-server.md).

### Setup failed. How do I try again?

Fix the cause shown under **See what happened** (often the key is not in `authorized_keys`, or the user can't use `sudo`), then press **Reinstall** on the server's **Settings** tab. From the terminal, `dnocs server setup --id <server ID>` does the same.
