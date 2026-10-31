---
title: The dashboard
description: What each dashboard tab tells you, and where to look first when something is wrong.
sidebar_position: 3
sidebar_icon: layout-dashboard
---

The dashboard is the first page after sign-in. It answers one question: is everything in this workspace all right? Open it any time from **Dashboard** in the sidebar.

![The dashboard Overview tab with the health verdict, resource counts and platform activity](../../assets/getting-started/dashboard-overview.webp 'Overview: the verdict at the top, then counts, activity and usage.')

## The tabs

| Tab           | What it shows                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| **Overview**  | A one-line verdict, counts of every resource, platform activity, resource usage, and what needs a look  |
| **Activity**  | The platform activity chart and the full **Recent activity** list                                       |
| **Resources** | Resource usage, server health and capacity, and short lists of servers, applications and load balancers |
| **Workspace** | Team workspaces only: members, cloud projects and workspace configuration                               |

## Overview

Read it from the top.

1. **The verdict.** Either everything is running normally, or a count of things that need your attention.
2. **The counts.** Servers, applications and load balancers, each with how many are ready and how many need a look. Then cloud projects, domains, databases and SSH keys. Press a tile to open that list.
3. **Platform activity.** Every operation dPanel ran in this workspace, split into **Succeeded**, **Failed** and **In progress or cancelled**. Pick **24 hours**, **7 days** or **30 days**. Beside it: the number of operations, the success rate and how many failed.
4. **Resource usage.** CPU, memory and disk across your servers. Each chart shows the fleet average and the busiest single server. Pick **1 hour**, **24 hours** or **3 days**.
5. **Needs your attention.** Servers that are not running, servers whose agent stopped reporting, and operations that failed. **Open server** takes you to the server in question.

:::tip
Usage appears a few minutes after a server becomes ready. Servers report every 30 seconds.
:::

## Activity

**Recent activity** lists what dPanel did to your infrastructure in the last two days: server setup, module installs, deployments. Each entry says what ran, on which target, who started it and how long it took. Open **Technical details** for the raw detail of a failed run. Press **Refresh** to load the newest entries.

## Resources

This tab is for capacity planning.

- **Server Health**: readiness and rollout state, by provider.
- **Capacity**: servers running close to full are listed by name.
- Short lists of your newest servers, applications and load balancers, each with **View all**.

## Workspace

Shown only in a team workspace.

- **Workspace Members**: who has access. **Manage** opens the team page.
- **Cloud Projects**: the provider accounts this team can launch servers in.
- **Workspace configuration**: the IaC repository dPanel writes this workspace's infrastructure to.

## If the dashboard says it cannot check

"You cannot see this workspace's health" means your role does not allow reading execution and agent status. Ask a workspace owner for a role that does. See [Members and roles](../teams/members-and-roles.md).
