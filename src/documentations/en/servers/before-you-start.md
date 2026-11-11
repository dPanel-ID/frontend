---
title: Before you start
description: Most servers join dPanel through the dPanel agent and need nothing set up first. Connect a cloud account only if dPanel should launch the VPS for you.
sidebar_position: 2
sidebar_icon: list-checks
---

Every server joins dPanel through the **dPanel agent**, a small program that runs on the server and connects out to dPanel. You don't give dPanel an SSH key, a password or an open port, so nothing connects in to your machine. That is the default for servers you already have and for servers dPanel launches in your cloud account.

| You want to | What you set up first |
| --- | --- |
| Add a server you already have | Nothing. Run one command on it: [Connect a server with the dPanel agent](./register-a-private-machine.md). |
| Have dPanel launch a new server | A [cloud account](#a-cloud-account), once. |

## A server you already have

You need nothing in dPanel first, only a Linux machine where you can run one command with `sudo` (run a command as administrator). It can be a VPS at any hosting company, a dedicated server, a home server or a VM behind a router, with or without a public IP. Follow [Connect a server with the dPanel agent](./register-a-private-machine.md).

## A cloud account

You need this only when dPanel should launch a new machine for you. A cloud account is dPanel's link to your account at a cloud provider. It holds the credentials that let dPanel create machines there.

1. In the sidebar, open **Cloud Projects**. The page is titled **Cloud accounts**.
2. Press **Connect a cloud account**.
3. Pick your provider and paste the credentials it gives you.

How to create a least-privilege credential, step by step, is on each provider's page: [AWS](./cloud-providers/provider-aws.md), [Google Cloud](./cloud-providers/provider-gcp.md), [IDCloudHost](./cloud-providers/provider-idcloudhost.md), [DigitalOcean](./cloud-providers/provider-digitalocean.md), [Alibaba Cloud](./cloud-providers/provider-alibabacloud.md) and [Tencent Cloud](./cloud-providers/provider-tencent.md). Read [Cloud credentials and security](./cloud-providers/cloud-credentials-security.md) before you paste a key.

:::info[Who pays for the machine]
The machine is created inside your own cloud account, so your provider bills you directly. dPanel does not resell machines.
:::

![The launch form with a cloud project ready to pick](../../assets/servers/create-step1-provider.webp 'With a cloud account in place, the launch form offers it instead of asking you to connect one.')

The new machine installs the dPanel agent while it starts, so it needs no SSH key either. Go on to [Create a cloud server](./cloud-providers/create-a-cloud-server.md).

## Only if you choose SSH

An SSH key is needed only in the few cases where dPanel signs in to a server over SSH instead of using the agent:

- you pick [Connect over SSH](./connect-your-own-server.md) for a server you already have,
- you pick **SSH** under **How dPanel connects** when launching a cloud server,
- you launch on Biznet Gio or Alibaba Cloud, which join over SSH for now.

dPanel creates the key for you: open **Secret Managers** under **Backend** in the sidebar, then press **Create SSH key**. The private half never leaves dPanel. The steps are in [SSH keys and cloud accounts](../getting-started/ssh-keys-and-cloud-projects.md).

## Frequently asked questions

### Why is the agent the default instead of SSH?

With SSH you would put a dPanel key on your server and let dPanel sign in from the internet. With the agent you run one command you can read first, nothing connects in, and you can stop it at any time with `sudo systemctl disable --now dpanel-agent`. [dPanel agent or SSH: which one?](./register-a-private-machine.md#dpanel-agent-or-ssh-which-one) compares the two.

### Do I need a cloud account to try dPanel?

No. [Connect a server with the dPanel agent](./register-a-private-machine.md) needs only a Linux machine where you can run one command with `sudo`.

### Can I still sign in to the server myself?

Yes. dPanel gives you a terminal in the browser, and you can add your own public key to sign in from your own computer; see [Connect over SSH](./connect-over-ssh.md).

### Can my team use the same cloud account?

Yes. Cloud accounts and keys created in a workspace can be used by its members. See [SSH keys and cloud accounts](../getting-started/ssh-keys-and-cloud-projects.md).
