---
title: Cloud providers
description: The six cloud providers dPanel launches servers on: AWS EC2, Google Compute Engine, DigitalOcean, IDCloudHost, Alibaba Cloud ECS and Tencent Cloud CVM.
sidebar_position: 0
---

dPanel launches Ubuntu servers in your own account at six cloud providers: **AWS** (EC2), **Google Cloud** (Compute Engine), **IDCloudHost**, **DigitalOcean** (Droplets), **Alibaba Cloud** (ECS) and **Tencent Cloud** (CVM). Each one has its own page: how to create a least-privilege credential, how to connect it, the launch-form fields, and the provider's gotchas.

Whichever you pick, the finished server is the same: same agent, same tabs, same modules.

## At a glance

|                        | [AWS](./provider-aws.md)                            | [Google Cloud](./provider-gcp.md)         | [IDCloudHost](./provider-idcloudhost.md) | [DigitalOcean](./provider-digitalocean.md) | [Alibaba Cloud](./provider-alibabacloud.md) | [Tencent Cloud](./provider-tencent.md)     |
| ---------------------- | --------------------------------------------------- | ----------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------- | ------------------------------------------ |
| Credential             | Access key + secret key                             | Service account JSON key                  | API key                                  | API token                                  | AccessKey ID + secret                       | SecretId + SecretKey                       |
| Location               | Region                                              | Region, then zone                         | Region, such as `jkt01`                  | Region                                     | Region, then zone                           | Region, then zone                          |
| Size                   | CPU and RAM sliders, cheapest `t3a`/`t3` type first | CPU and RAM sliders, an E2 machine type   | CPU and RAM sliders, exact size          | CPU and RAM sliders, cheapest Droplet      | CPU and RAM sliders, cheapest ECS type      | CPU and RAM sliders, cheapest CVM type     |
| Network                | `dpanel-network`, created on first use              | `dpanel-network`, created on first use    | Chosen for you per region                | Provider default, or a VPC you pick        | `dpanel-network`, created on first use      | `dpanel-network`, created on first use     |
| Firewall               | Security group per server, TCP 22, 80, 443          | Firewall rule per server, TCP 22, 80, 443 | None created by dPanel                   | None created by dPanel                     | Security group per server, TCP 22, 80, 443  | Security group per server, TCP 22, 80, 443 |
| Login user             | `ubuntu`                                            | `ubuntu`                                  | **Default User**, `dpanel` by default    | **Default User**, `dpanel` by default      | `root`                                      | `ubuntu`                                   |
| Disk                   | 20 to 500 GB                                        | 20 to 500 GB                              | 20 to 500 GB                             | Comes with the Droplet size                | 40 to 500 GB                                | Provider default                           |
| Extra step in the form | None                                                | None                                      | **Access**: user and bootstrap password  | **Access**: user                           | None                                        | None                                       |

The launch form also lists **Biznet Gio**. It follows the same steps, with its own **Product** and **Billing Cycle** pickers instead of the size sliders, and is not covered in detail here.

Whichever provider you use, the finished server runs Ubuntu 24.04 LTS or 26.04 LTS.

## Before any provider

- An SSH key in dPanel. See [Before you start](../before-you-start.md).
- A credential that can do only what dPanel needs. Each provider page gives the minimum.
- Read [Cloud credentials and security](./cloud-credentials-security.md) once. It explains what dPanel keeps and what happens if you revoke a key, and how to replace one.

The launch itself is the same for every provider: [Create a cloud server](./create-a-cloud-server.md).

## Frequently asked questions

### Which provider should I pick?

The one you already have an account with. dPanel works the same on every provider once the server is up. If you have none, any of them is fine for a first server.

### My provider is not listed. Can I still use dPanel?

Yes. Create the machine at your provider yourself, then [connect your own server](../connect-your-own-server.md) over SSH.

### Do I pay dPanel for the machine?

No. The provider bills you for the machine directly; dPanel does not resell machines.
