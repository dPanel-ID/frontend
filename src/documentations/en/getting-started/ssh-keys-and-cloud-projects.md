---
title: SSH keys and cloud accounts
description: The two things dPanel needs before it can launch or connect a server.
sidebar_position: 5
---

Before your first server, set up two things. Both live under **Backend** in the sidebar, and both are reused for every server after that.

| You need        | Where                                  | Why                                              |
| --------------- | -------------------------------------- | ------------------------------------------------ |
| An SSH key      | **Secret Managers**, then **SSH keys** | dPanel signs in to your servers with it          |
| A cloud account | **Cloud Projects**                     | dPanel creates machines in your provider account |

You need a cloud account only to launch a new machine. To connect a server you already run, the SSH key is enough.

## Create an SSH key

1. In the sidebar, open **Secret Managers**, then **SSH keys**.
2. Press **Create SSH key**.
3. Give it a name you will recognise, such as `work-laptop`, and pick the key type.
4. Save. dPanel generates the key pair and keeps the private half encrypted.

![The SSH keys page with one key shared with the team](../../assets/getting-started/ssh-keys.webp 'SSH keys: each card shows the key type, who owns it and who can use it.')

The private half is never shown, copied or sent anywhere. Open a key to see its public half and fingerprint. **Create a server with this key** takes you straight to the create-server page.

## Connect a cloud account

The page is called **Cloud accounts**. In the sidebar it is **Cloud Projects**.

1. In the sidebar, open **Cloud Projects**.
2. Press **Connect a cloud account**.
3. Pick your provider and paste the credential it gives you. Each provider's page shows how to create one with the least access: [AWS](../servers/provider-aws.md), [Google Cloud](../servers/provider-gcp.md), [IDCloudHost](../servers/provider-idcloudhost.md), [DigitalOcean](../servers/provider-digitalocean.md).
4. Save. dPanel stores the key encrypted and never shows it again. See [Cloud credentials and security](../servers/cloud-credentials-security.md).

dPanel then reads which regions, sizes and images your account may launch, so the create-server form only offers real options.

![The Cloud accounts page listing connected provider accounts](../../assets/getting-started/cloud-projects.webp 'Cloud accounts: one card per provider account, with its status.')

:::info[Who pays]
dPanel does not resell servers. Machines are created inside your own provider account, and your provider bills you directly.
:::

## Status of a cloud account

| Status                          | Meaning                                       |
| ------------------------------- | --------------------------------------------- |
| Ready                           | dPanel can launch servers with it             |
| Waiting to connect / Connecting | dPanel is checking the credentials            |
| Could not connect               | The key was refused. Check it at the provider |

## Sharing and removing

- A key or account created in a team workspace is shared with that team. One created in your personal workspace is yours alone.
- **Migrate Ownership** in the item's menu moves it to another workspace.
- **Disconnect cloud account** makes dPanel forget the API key. Servers already running at the provider keep running.

## What happens next

Launch or connect your first server. [Before you start](../servers/before-you-start.md) explains key types and provider credentials in more detail, and [Create a cloud server](../servers/create-a-cloud-server.md) walks through the form.
