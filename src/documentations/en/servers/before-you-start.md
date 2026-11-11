---
title: Before you start
description: Before you add a server to dPanel, connect a cloud account if dPanel should launch the VPS, and create an SSH key only if dPanel should log in over SSH.
sidebar_position: 2
sidebar_icon: list-checks
---

To connect a server you already have with the dPanel agent, you need nothing in dPanel first: see [Connect a server with the dPanel agent](./register-a-private-machine.md).

Two other things are set up once and reused for every server after it: a connected cloud account, only if dPanel should launch a new VPS for you, and an SSH key, only if dPanel should sign in to the machine over SSH instead of using the agent.

## An SSH key

You need this only when dPanel connects to a server over SSH: a server you connect over SSH, a cloud server where you pick **SSH** under **How dPanel connects**, or a cloud server on Biznet Gio or Alibaba Cloud, which join over SSH for now. Servers that join through the dPanel agent need no key, and that is the default.

An SSH key is a pair of files that replaces a password when a computer signs in to a server. One half is public and is written onto the server. The other half is private and never leaves dPanel.

You don't have to make one by hand.

1. In the sidebar, under **Backend**, open **Secret Managers**. It opens the **SSH keys** page.
2. Press **Create SSH key**.
3. Type a **Key name** you will recognise, such as `work-laptop`, and pick the **Key type**.
4. Press **Generate SSH key**.

- **For current servers** is the right choice unless something refuses it. It is shorter and faster, and every current Linux accepts it.
- **For older servers** is the fallback. It also asks for a key size.

The private half is never shown again. dPanel keeps it encrypted and uses it for you. The key's page shows the public half, which is safe to copy anywhere, and a fingerprint you can compare with what a server reports.

![The SSH keys page listing two keys with their type, who can use them and their owner](../../assets/getting-started/ssh-keys.webp)

## A cloud account

You need this only to launch a new machine. To connect a server you already have, use [the dPanel agent](./register-a-private-machine.md) or [SSH](./connect-your-own-server.md).

A cloud account is dPanel's link to your account at a cloud provider. It holds the credentials that let dPanel create machines for you.

1. In the sidebar, open **Cloud Projects**. The page is titled **Cloud accounts**.
2. Press **Connect a cloud account**.
3. Pick your provider and paste the credentials it gives you.

How to create a least-privilege credential, step by step, is on each provider's page: [AWS](./cloud-providers/provider-aws.md), [Google Cloud](./cloud-providers/provider-gcp.md), [IDCloudHost](./cloud-providers/provider-idcloudhost.md), [DigitalOcean](./cloud-providers/provider-digitalocean.md), [Alibaba Cloud](./cloud-providers/provider-alibabacloud.md) and [Tencent Cloud](./cloud-providers/provider-tencent.md). Read [Cloud credentials and security](./cloud-providers/cloud-credentials-security.md) before you paste a key.

:::info[Who pays for the machine]
The machine is created inside your own cloud account, so your provider bills you directly. dPanel does not resell machines.
:::

![The launch form with a cloud project and an SSH key ready to pick](../../assets/servers/create-step1-provider.webp 'With a cloud account in place, the launch form offers it instead of asking you to connect one.')

## What happens next

Go to [Create a cloud server](./cloud-providers/create-a-cloud-server.md). More on keys and accounts, including sharing them with a team, is in [SSH keys and cloud accounts](../getting-started/ssh-keys-and-cloud-projects.md).

## Frequently asked questions

### Can I use an SSH key I already have?

dPanel creates the key pair for you so the private half never leaves dPanel. To sign in from your own computer as well, add your own public key to the server; see [Connect over SSH](./connect-over-ssh.md).

### Do I need a cloud account to try dPanel?

No. [Connect a server with the dPanel agent](./register-a-private-machine.md) needs only a Linux machine where you can run one command with `sudo`.

### Can my team use the same key and cloud account?

Yes. Keys and cloud accounts created in a workspace can be used by its members. See [SSH keys and cloud accounts](../getting-started/ssh-keys-and-cloud-projects.md).
