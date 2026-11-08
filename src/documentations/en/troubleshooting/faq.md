---
title: Common problems and fixes
description: Fixes for common dPanel problems: servers, cloud launches, builds, GitHub, load balancers, firewalls, HTTPS, DNS, logs, workers and the AI assistant.
sidebar_position: 1
sidebar_icon: circle-help
sidebar_label: Common problems
---

This page collects the problems dPanel users run into most, with what you see and what to do. Each answer starts with the message or symptom as dPanel shows it. If yours is not here, ask [Ask dPanel](../ai/diagnose-problems.md) to look into it, or [contact support](#getting-help). Words you don't know are explained in the [Glossary](../getting-started/glossary.md).

## Servers

### The server page says "Setup did not finish"

The red banner means the provider or the setup stopped with an error. Press **See what happened** to read the reason. The usual causes are a cloud account without enough quota, and credentials that have expired or lack a permission. Each provider's page lists the quotas and permissions to check: see [Cloud providers](../servers/cloud-providers/index.md).

Fix the cause at your provider, then open the server's **Settings** tab and use **Reinstall** under **Setup**, or **Reinstall server** under **More actions** (⋯), to run setup again. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).

### A launch fails with a provider error

Read the reason under **See what happened**. These come up most:

| Error from the provider                         | What to do                                                                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `QUOTA_EXCEEDED`, or a VPC or Droplet limit     | Raise the quota or limit at the provider, or free one up.                                                                                                            |
| `Forbidden.RiskControl` (Alibaba Cloud)         | Finish real-name verification and add a payment method. See [Alibaba Cloud](../servers/cloud-providers/provider-alibabacloud.md#the-account-must-be-allowed-to-buy). |
| `UnauthorizedOperation` about payment (Tencent) | Grant the sub-user payment rights. See [Tencent Cloud](../servers/cloud-providers/provider-tencent.md#the-sub-user-must-be-allowed-to-pay).                          |
| No credit, or billing refused (IDCloudHost)     | Top up the billing account. See [IDCloudHost](../servers/cloud-providers/provider-idcloudhost.md).                                                                   |

### The size card says "This provider can't serve that CPU and memory pair"

The provider sells no machine with exactly that CPU and RAM. Move one of the sliders to another value. Values the provider cannot serve are crossed out.

### A cloud account reads "Could not connect"

The provider refused the key. Check it at the provider, then replace it with **Update credentials** in the account's **More** (⋯) menu. See [Rotating a credential](../servers/cloud-providers/cloud-credentials-security.md#rotating-a-credential).

### I cannot delete a server

Deletion is refused while applications or load balancers still use the server. Delete those first, then try again. See [Delete a server](../servers/delete-a-server.md).

### A port is blocked after I turned on the firewall

With the firewall on, only ports with an **Allow** rule can be reached; everything else is blocked. SSH (22) always stays open, and 80 and 443 stay open on a server that runs a dPanel load balancer. For anything else, such as a database port published by a TCP load balancer, add an **Allow** rule for that port and protocol, then review and apply. Check the **Firewall** column under **Active ports** on the server's **Network** tab to see which ports are allowed. See [Firewall](../servers/firewall.md).

### A firewall change failed and the old rules came back

If SSH or the dPanel agent stop working after a change, the server restores its previous firewall by itself within a few minutes and marks the job failed. Check the rules you added, then apply again. See [Safety: SSH and automatic rollback](../servers/firewall.md#safety-ssh-and-automatic-rollback).

### The dashboard says "No contact" with a server

The dPanel agent on that server has not reported in for a while. The server may be off, overloaded or out of network. Open it from **Needs your attention** with **Open server** and check whether it is reachable.

## Applications

### Continue stays disabled on the App setup step

Check the **Application name**. It may only contain letters, numbers and spaces. A name such as `my-app` or `my_app` is refused, and the field explains why under it. Use `My App` instead. The bar at the bottom of the form lists anything else still missing.

### "No ready servers found" when I pick a server

Only servers that are **Ready** can host an application. Wait until a new server finishes setup, fix a server whose setup failed, or press **Add new server**. See [Servers in dPanel](../servers/overview.md).

### "Port … is already used on this server"

Another service already listens on that port. Pick a port that is not listed under **Ports already in use**. dPanel suggests a free one between 7000 and 10000 when you start.

### The build failed

Open **Deployments**, find the build marked **Failed**, and press **Logs**. The last lines usually name the step and the error. Fix it in your repository or in **Settings**, then press **Build and release**. See [Deployments and rollback](../applications/deployments-and-rollback.md#read-a-builds-logs).

### The build stops after about 20 minutes

Every build and deployment job has a time limit of 20 minutes by default, and its log ends with `context deadline exceeded`. A build that compiles a lot, or a server with little CPU, can hit it.

Raise the limit per application with `build.timeout` in the application definition, as a duration between `1m` and `3h`:

```yaml
build:
  timeout: 90m
```

The web form does not have this field yet. Set it in the definition file you deploy with the dPanel command-line tool. Otherwise, a larger server shortens the build. See [Build timeout](../applications/build-timeout.md).

### "GitHub session expired" or "Reconnect GitHub"

GitHub no longer confirms your saved account. Press **Reconnect GitHub** or **Relogin GitHub** and sign in to GitHub again. Your applications keep running in the meantime. See [Connect GitHub](../getting-started/connect-github.md).

### My GitHub organisation is not in the list

Open **GitHub team** in **Create Application** and choose **Add GitHub account**. Install the dnocs-id GitHub App on the organisation, and give it access to the repository.

## Load balancers, HTTPS and DNS

### The load balancer shows "Load balancer change failed"

The red banner on the list and on the load balancer's page means the last change did not finish. Press **See why it failed** to read the reason; in the table, press the failed status instead. The reason reads like `Load balancer create failed. Ansible task failed on <server>: <step>. Detail: …`, where the step names what dPanel was doing on the gateway (Ansible is the tool dPanel uses to run setup steps on a server). Check, in this order:

1. The gateway server is **Ready** and the dashboard does not show **No contact** with it.
2. The engine is installed on the gateway. The first load balancer on a fresh server installs it, which takes about 10 minutes.
3. With a **Managed** domain, the domain still connects under **Domain & DNS**, and the name is not already in the zone.
4. The application is running, and the **How the gateway reaches this application** choice fits where it runs.

Fix the cause, then delete the failed load balancer and create it again. **Ask dPanel** can also update an existing load balancer for you to approve. See [Load balancers](../networking/load-balancers.md).

### A TCP or UDP load balancer does not answer on its port

An L4 load balancer listens on the port you chose. If the gateway's firewall is on and has no **Allow** rule for that port and protocol, connections are dropped. Add the rule and apply it. See [Firewall](../servers/firewall.md). When you ask **Ask dPanel** to create such a load balancer, its approval card warns you when the firewall would block the port.

### I cannot pick my server as the gateway

Only ready servers can run a load balancer. Wait until setup finishes, or fix the server first.

### The site does not resolve right after I created the load balancer

Your resolver may have cached the "not found" answer from before the record existed. Wait a few minutes, or check with a public resolver: `dig @1.1.1.1 app.example.com`. With an **External** domain, check that you pointed its DNS at the gateway's public address yourself.

### The HTTPS certificate is not issued

Let's Encrypt must reach the gateway on ports 80 and 443, and the name must already resolve to the gateway. Check both; Caddy on the gateway keeps retrying and gets the certificate once it can. Servers dPanel launches have 80 and 443 open; on DigitalOcean or IDCloudHost, or a server you connected, check your own firewall.

### dPanel refuses my subdomain

With a **Managed** domain, dPanel will not overwrite an existing DNS record. Pick a name that is not in the zone yet; search the domain's [DNS records](../networking/dns-records.md) to check.

## Workers and jobs

### Jobs wait and never start

A job such as a deployment, a server setup or a module install sits waiting. If your workspace uses **Private workers**, its jobs go only to your own workers, and wait until one of them is running. Start your worker, or switch the workspace back to **Shared workers (dPanel)** on your profile or team page. See [Workers](../workers/overview.md).

## Logs

### "This application has no run command or server yet"

Runtime logs come from the running service. An application without a start command, or not yet released to a server, has none. Finish its setup and release it first.

### The logs are empty

Logs only show the time range you picked. Widen the range; the longest is 10 days. If the application was just released, wait a minute and press **Refresh**. See [Reading logs](../logs/reading-logs.md).

### "More than 100,000 lines" and I cannot download

**Everything in this time range** stops at 100,000 lines. Narrow the time range, or save the loaded lines. See [Download logs](../logs/download-logs.md).

### Search does not find something I can see

Searches ignore upper and lower case, so `WordPress` and `wordpress` find the same thing. If a list still shows nothing, check that you are in the right workspace, and clear any filter beside the search box.

## Workspaces and access

### My servers or applications have disappeared

You are probably in a different workspace. Check the workspace name at the top of the sidebar and switch back. See [Workspaces](../getting-started/workspaces.md).

### I cannot find Migrate Ownership

dPanel does not move resources between workspaces, so the action is hidden. A server, application, load balancer, domain, cloud account or SSH key stays in the workspace it was created in. Create new resources in the right workspace.

### "You cannot see this workspace's health"

Every member of a workspace can read its execution and agent status. If you still see this, you are probably not a member of the selected workspace: check the workspace switcher, or ask a workspace owner to add you. See [Members and roles](../teams/members-and-roles.md).

### The assistant says it "isn't available yet"

**The assistant isn't available yet** means dPanel could not reach the assistant service, or the assistant is not turned on for you. Press **Check again** after a moment. The rest of dPanel keeps working without it. See [Limits and privacy](../ai/limits-and-privacy.md).

### Where is Secret Managers for my passwords?

**Secret Managers** in the sidebar opens the **SSH keys** page; it holds SSH keys only. Keep application passwords in [environment variables](../applications/environment-variables.md).

## Getting help

Most list pages end with **Help & Support**:

- **Documentation** opens these guides.
- **Chat team** opens a WhatsApp chat with the dPanel team.
- **Email support** writes to the team by email.

When you write, include the name of the server or application, what you pressed, and what you saw.

## Frequently asked questions

### Where do I see why something failed?

On the item itself: a server shows **See what happened**, a load balancer **See why it failed**, and a build its log under **Deployments**. The dashboard's **Needs your attention** list collects every recent failure in one place.

### Can the assistant fix a problem for me?

It can read what failed and propose a fix, such as a firewall rule or a corrected setting. Nothing changes until you approve it. See [Diagnose problems](../ai/diagnose-problems.md).

### Does a failure on one server affect my other servers?

No. Each job runs against one server, and a failed job leaves the others alone.
