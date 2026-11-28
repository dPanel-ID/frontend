---
title: Connect your own server over SSH
description: Connect a VPS, bare-metal or home-lab Ubuntu or Debian server you already run to dPanel over SSH with a dPanel SSH key. dPanel installs its agent in about 5 minutes.
sidebar_position: 3
sidebar_icon: terminal
sidebar_label: Manual SSH
---

You can add a server you already run, at any hosting company or at home, to dPanel over SSH. dPanel signs in with one of your dPanel SSH keys, installs its agent, and the machine then works like any server dPanel launched. It takes about 5 minutes and needs no cloud account.

:::tip[The recommended way needs no SSH key]
[Connect the server with the dPanel agent](./register-a-private-machine.md) instead: you run one command on it, and the agent connects out to dPanel. You don't add a dPanel key, open a port or need a public IP. Use this page when you would rather let dPanel log in over SSH. [dPanel agent or SSH: which one?](./register-a-private-machine.md#dpanel-agent-or-ssh-which-one) compares the two.
:::

## What you need first

- A server running Ubuntu or Debian with a public IP, that dPanel can reach over SSH from the internet.
- A Linux user that is `root`, or that can run `sudo` (run a command as administrator) without typing a password. dPanel signs in with a key and has no password to give `sudo`.
- An SSH key in dPanel. You can also create one inside the form.

## Connect it

1. Open **Servers**, then **Create Server**, then **Connect over SSH**.
2. Under **Choose an SSH key**, pick a key, or press **Create SSH key**.
3. Copy the command under **Authorize the key on your server** and run it once on the server. Sign in the way you do today, usually your provider's web console or `ssh user@address` in a terminal. The command adds the key's public half to `~/.ssh/authorized_keys`, the list of keys allowed to sign in, and prints nothing when it works.
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
For a server you connected yourself, dPanel removes its agent and forgets the server. Your machine, your applications and their data stay. See [Delete a server](./delete-a-server.md).
:::

## Frequently asked questions

### Which operating systems can I connect?

Ubuntu and Debian. dPanel installs its agent and modules with the standard tools of those systems.

### Does dPanel need the root password?

No. dPanel signs in with an SSH key, never a password. The Linux user you enter must be `root` or able to use `sudo`.

### Does my server need a public IP address?

For this page, yes: dPanel must be able to reach the **Server address** and **SSH port** you enter. Addresses dPanel can never reach from the internet are refused: local ones such as `localhost` or `0.0.0.0`, private network (LAN) ones such as `192.168.x.x`, `10.x.x.x` or `172.16.x.x`, the shared `100.64.x.x` range, and example names such as `example.com` or `server.local`. A server [connected with the dPanel agent](./register-a-private-machine.md) needs no public IP, because it only connects out.

### What happens if I remove the server from dPanel?

dPanel removes its agent and forgets it. Your machine keeps running, with everything else on it. See [Delete a server](./delete-a-server.md).

### Setup failed. How do I try again?

Fix the cause shown under **See what happened** (often the key is not in `authorized_keys`, or the user can't use `sudo`), then press **Reinstall** on the server's **Settings** tab. From the terminal, `dnocs server setup --id <server ID>` does the same.
