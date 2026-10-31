---
title: DigitalOcean
description: Create a custom-scoped DigitalOcean token, connect it to dPanel, and launch a Droplet.
sidebar_position: 4
sidebar_icon: provider:digitalocean
---

dPanel launches Droplets in your DigitalOcean team. It signs in with a personal access token that you create for it.

## What you need first

- A DigitalOcean team with billing set up. A separate team just for dPanel keeps its access contained.
- An SSH key in dPanel. See [Before you start](../before-you-start.md).

## 1. Create a custom-scoped token

DigitalOcean lets you choose exactly what a token may do. Don't give dPanel a **Full Access** token.

1. In the [DigitalOcean control panel](https://cloud.digitalocean.com), go to **API**, then **Tokens**.
2. Press **Generate New Token**, and name it `dpanel`.
3. Pick an expiry. 90 days is a good balance; you will have to [rotate](./cloud-credentials-security.md#rotating-a-credential) it when it ends.
4. Under **Scopes**, choose **Custom Scopes** and tick only these:

| Scope                                              | Why dPanel needs it                                  |
| -------------------------------------------------- | ---------------------------------------------------- |
| `droplet:create`, `droplet:read`, `droplet:delete` | Create the Droplet, wait for it, delete it later     |
| `ssh_key:create`, `ssh_key:read`                   | Import your dPanel SSH key as `dpanel-<server name>` |
| `regions:read`                                     | The **Region** list                                  |
| `sizes:read`                                       | The **Droplet Size** list                            |
| `image:read`                                       | The Ubuntu image list                                |
| `vpc:read`                                         | The networks in a region                             |

5. Press **Generate Token**, and copy it. DigitalOcean shows it only once.

DigitalOcean guides: [Create a personal access token](https://docs.digitalocean.com/reference/api/create-personal-access-token/), [Token scopes](https://docs.digitalocean.com/reference/api/scopes/).

:::warning[Verify]
The list above comes from the API calls in dPanel's code (`/v2/regions`, `/v2/sizes`, `/v2/images`, `/v2/vpcs`, `/v2/droplets`) and the Ansible `digitalocean.cloud` modules it runs (`droplet`, `droplets_info`, `ssh_key`). DigitalOcean sometimes requires extra read scopes for a create action, such as `actions:read` while waiting for a Droplet. The token page tells you which scopes a create scope depends on; accept them. If a launch fails with `403`, the error names the missing scope.
:::

## 2. Connect it to dPanel

1. In the sidebar, open **Cloud Projects**. The page is titled **Cloud accounts**.
2. Press **Connect a cloud account**.
3. Fill in **Connection name**, for example `DigitalOcean SGP`.
4. Under **Cloud provider**, pick **DigitalOcean**.
5. Paste the token into **API token**.
6. Press **Connect cloud account**.

![The Connect Cloud Account form with DigitalOcean selected and the API token field empty](../../../assets/servers/cloud-account-connect-digitalocean.webp)

dPanel saves the account as **Ready** without testing it. The launch form is the first real test: if **Region** stays empty or errors, check the token and its scopes.

## 3. DigitalOcean fields in the launch form

![The launch form with DigitalOcean selected](../../../assets/servers/create-provider-digitalocean.webp)

| Field              | What to pick                                       |
| ------------------ | -------------------------------------------------- |
| **Region**         | The datacenter, such as `sgp1`.                    |
| **Droplet Size**   | The size slug, such as `s-1vcpu-2gb`.              |
| **Ubuntu release** | 24.04 LTS or 26.04 LTS.                            |
| **Network**        | The region's default VPC, unless you pick another. |

DigitalOcean adds a fourth step, **Access**, with **Default User**: the Linux user dPanel creates and signs in as. `dpanel` by default.

## 4. Launch

Follow [Create a cloud server](./create-a-cloud-server.md). Pick DigitalOcean in step 1.

## DigitalOcean gotchas

- **An SSH key appears in your team.** Each launch imports your dPanel public key as `dpanel-<server name>` under **Settings**, **Security**. Deleting the server does not remove it.
- **No firewall from dPanel.** dPanel creates no Cloud Firewall. A new Droplet accepts traffic on every port until you add one. Allow TCP 22, 80 and 443 if you add a firewall, or dPanel and your apps stop working.
- **Droplet limit.** New teams can only run a few Droplets. A launch that fails with a limit error needs a higher limit from DigitalOcean.
- **No backups.** dPanel turns on neither DigitalOcean backups nor monitoring. Enable them in the control panel if you want them; backups cost extra.
- **Billing runs from launch.** You pay for the Droplet while it exists, even when it is powered off.

## Security

- With custom scopes, the token can create, read and delete Droplets and SSH keys, and read regions, sizes, images and VPCs. It can't touch Spaces, databases, DNS or billing.
- With **Full Access**, it can do anything in the team, so don't.
- To rotate the token, create a new one in the same team and replace it with **Update credentials** on the cloud account. See [Rotating a credential](./cloud-credentials-security.md#rotating-a-credential).
- To cut dPanel off, delete the token under **API**, **Tokens**. Running servers keep running. See [what happens when you revoke](./cloud-credentials-security.md#if-you-revoke-a-credential).
- More in [Cloud credentials and security](./cloud-credentials-security.md).
