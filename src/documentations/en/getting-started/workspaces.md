---
title: Workspaces
description: How dPanel workspaces work: your personal workspace, shared team workspaces, and how to switch between them so you see the right servers and apps.
sidebar_position: 2
sidebar_icon: building-2
---

A workspace in dPanel is the boundary (a separate box) around a set of servers, applications, load balancers, domains, cloud accounts and SSH keys. You only see what belongs to the workspace you are in, and you switch workspace from the top of the sidebar.

## Two kinds of workspace

| Kind     | Who sees it              | Use it for                       |
| -------- | ------------------------ | -------------------------------- |
| Personal | Only you                 | Trying things out, side projects |
| Team     | Every member of the team | Shared servers and applications  |

Every account has a personal workspace. A team workspace is the same thing as a team: creating a team creates its workspace. See [Teams](../teams/teams.md).

## Switch workspace

The current workspace is shown at the top of the sidebar, under the dnocs logo.

1. Press the workspace name at the top of the sidebar.
2. In **Select workspace**, find the one you want. The tabs **All**, **Personal** and **Teams** narrow the list, and **Search workspaces** finds one by name, in any letter case. The workspace you are in is marked **Current**.
3. Press the row. dPanel reloads the data for that workspace.

![The Select workspace dialog listing the personal workspace and two team workspaces, with the current one marked](../../assets/getting-started/workspace-picker.webp 'Select workspace lists every workspace you belong to, with your role in each.')

dPanel remembers your choice in this browser. The next time you open dPanel here, you are in the same workspace.

:::note
Switching workspace changes what every page shows. If a server or application seems to have disappeared, check the workspace name in the sidebar first.
:::

## From the same dialog

- **New workspace** creates a team workspace. See [Create a team](../teams/teams.md#create-a-team).
- The people icon at the end of a team row (**Manage workspace**) opens that team's members page.

## A resource stays in its workspace

A server, application, load balancer, domain, cloud account or SSH key stays in the workspace it was created in. The web app does not move resources between workspaces, so switch to the right workspace before you create something. To share your work with other people, create it in a [team workspace](../teams/teams.md).

## Frequently asked questions

### Where do I find my personal workspace?

At the top of **Select workspace**, named **Personal workspace**, or under the **Personal** tab. Every account has one.

### Can I move a server or application to another workspace?

Mostly no. A server can move once, from your personal workspace to a team, with `dnocs transfer server --id <server ID> --to "<team name>"`. Add `--include-dependencies` to move its SSH key and cloud project too. Everything else stays where it was created, so create it again in the right workspace and delete the old one.

### Why does switching workspace change the Workers card on my profile?

Each workspace chooses where its jobs run, on dPanel's shared workers or on private workers. The profile shows the choice for the workspace you are in. See [Workers](../workers/overview.md).
