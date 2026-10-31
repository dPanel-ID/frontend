---
title: Cloud providers
description: The four providers dPanel launches servers on, and what differs between them.
sidebar_position: 4
---

dPanel launches servers on **AWS**, **Google Cloud**, **IDCloudHost** and **DigitalOcean**. Each one has its own page: how to create the credential, how to connect it, the launch-form fields, and the provider's gotchas.

Whichever you pick, the finished server is the same: same agent, same tabs, same modules.

## At a glance

|                        | [AWS](./provider-aws.md)                   | [Google Cloud](./provider-gcp.md)         | [IDCloudHost](./provider-idcloudhost.md) | [DigitalOcean](./provider-digitalocean.md) |
| ---------------------- | ------------------------------------------ | ----------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Credential             | Access key + secret key                    | Service account JSON key                  | API key                                  | API token                                  |
| Location               | Region                                     | Region, then zone                         | Region, such as `jkt01`                  | Region                                     |
| Size                   | **Instance Type**                          | **Machine Type**                          | **CPU Cores** and **RAM**                | **Droplet Size**                           |
| Network                | `dpanel-network`, created on first use     | `dpanel-network`, created on first use    | Chosen for you per region                | Provider default, or a VPC you pick        |
| Firewall               | Security group per server, TCP 22, 80, 443 | Firewall rule per server, TCP 22, 80, 443 | None created by dPanel                   | None created by dPanel                     |
| Login user             | `ubuntu`                                   | `ubuntu`                                  | **Default User**, `dpanel` by default    | **Default User**, `dpanel` by default      |
| Extra step in the form | None                                       | None                                      | **Access**: user and bootstrap password  | **Access**: user                           |

The launch form also lists **Biznet Gio**. It follows the same steps and is not covered in detail here.

## Before any provider

- An SSH key in dPanel. See [Before you start](./before-you-start.md).
- A credential that can do only what dPanel needs. Each provider page gives the minimum.
- Read [Cloud credentials and security](./cloud-credentials-security.md) once. It explains what dPanel keeps and what happens if you revoke a key.

The launch itself is the same for every provider: [Create a cloud server](./create-a-cloud-server.md).
