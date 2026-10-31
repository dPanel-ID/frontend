---
title: Workspaces
description: Your personal workspace, team workspaces, and how to switch between them.
sidebar_position: 2
sidebar_icon: building-2
---

Everything in dPanel belongs to a workspace: servers, applications, load balancers, domains, cloud accounts and SSH keys. A workspace is a boundary. You only see what belongs to the workspace you are in.

## Two kinds of workspace

| Kind     | Who sees it              | Use it for                       |
| -------- | ------------------------ | -------------------------------- |
| Personal | Only you                 | Trying things out, side projects |
| Team     | Every member of the team | Shared servers and applications  |

Every account has a personal workspace. A team workspace is the same thing as a team: creating a team creates its workspace. See [Teams](../teams/teams.md).

## Switch workspace

The current workspace is shown at the top of the sidebar, under the dnocs logo.

1. Press the workspace name at the top of the sidebar.
2. In **Select workspace**, find the one you want. The tabs **Recent**, **All**, **Personal** and **Teams** narrow the list, and **Search workspaces** finds one by name.
3. Press the row. dPanel reloads the data for that workspace.

![The Select workspace dialog listing a personal and a team workspace](../../assets/getting-started/workspace-picker.webp 'Select workspace lists every workspace you belong to, with your role in each.')

dPanel remembers your choice in this browser. The next time you open dPanel here, you are in the same workspace.

:::note
Switching workspace changes what every page shows. If a server or application seems to have disappeared, check the workspace name in the sidebar first.
:::

## From the same dialog

- **New workspace** creates a team workspace. See [Create a team](../teams/teams.md#create-a-team).
- The people icon at the end of a team row (**Manage workspace**) opens that team's members page.

## Moving things between workspaces

A server, application, load balancer, domain, cloud account or SSH key can move to another workspace. Use **Migrate Ownership** in the item's menu, or **Migrate ownership** on a server's **Settings** tab. See [Move a resource to another workspace](../teams/members-and-roles.md#move-a-resource-to-another-workspace).
