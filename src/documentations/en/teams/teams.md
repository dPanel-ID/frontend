---
title: Teams
description: Create a team workspace in dPanel to share servers, applications and cloud accounts with your team, then rename it or delete it when you are done.
sidebar_position: 1
sidebar_icon: users
---

A team in dPanel is a shared workspace (a separate space with its own servers, applications and settings; see the [Glossary](../getting-started/glossary.md)). Servers, applications, load balancers, domains, cloud accounts and SSH keys created in it belong to the team, and every member can reach them according to their [role](./members-and-roles.md). Use a team so colleagues never have to share a server password or SSH key.

![The Teams page in table view, listing a team with its status, your role and its member count](../../assets/teams/teams-list.webp 'Teams: every team workspace you belong to, with your role in each.')

The page starts with counts: the teams you belong to, those **Owned by you**, those **Shared with you**, and your **Active workspace**. The table lists each team with its **Status**, **Your role**, **Members**, and when it was created and updated.

## Create a team

1. Open the workspace switcher at the top of the sidebar and press **New workspace**. Or open **Teams** and press **Add Team**.
2. **Workspace name**: a name your team will recognise in pickers, such as "Backend Squad".
3. Add a description if it helps teammates who switch in later.
4. Press **Create workspace**.

You are the **Owner** of the new team.

## What happens next

Switch to the new workspace (see [Workspaces](../getting-started/workspaces.md)), then add the people you work with. See [Members and roles](./members-and-roles.md).

## Open a team

On the **Teams** page, select a team's row, or press **Details** (the eye icon) on it. The team page shows its member count, **Your role**, its status and when it was created, then the **Members** table with each member's name, `@username`, roles and when they joined.

Below the members, the **Workers** card shows **Where jobs run** for this team: **Shared workers (dPanel)** or **Private workers**. Only team owners and admins can change it; everyone else sees it read-only. See [Workers overview](../workers/overview.md).

## Rename a team

1. Open the team.
2. Press **Edit**.
3. In **Edit Team**, change **Team Name** or the description.
4. Save.

## Delete a team

1. On the **Teams** page, press **Delete** (the bin icon) on the team's row. Only teams **Owned by you** can be deleted.
2. Confirm **Delete Team**.

:::danger[Move what you need first]
Deleting a team removes the workspace. Resources in a team cannot be moved to another workspace, so delete the team only when you no longer need anything in it. Delete its servers first if you want your cloud provider to stop billing for them. See [Delete a server](../servers/delete-a-server.md).
:::

## Frequently asked questions

### What is the difference between my personal workspace and a team?

Your personal workspace is yours alone. A team is a workspace you share: everything created in it belongs to the team, and each member works within their role.

### Can I move a server from my personal workspace into a team?

Yes, once, with the dnocs command-line tool: `dnocs transfer server --id <server ID> --to "<team name>"`. Add `--include-dependencies` to move its SSH key and cloud project too. You need editor rights in the team. After that the server stays in the team; it cannot move to another workspace or back. The same works for applications, domains, load balancers, cloud projects and SSH keys. See [AI in the terminal](../ai/ai-in-the-terminal.md) to install dnocs.

### Who can delete a team?

Only its owner. The **Delete** button shows only on teams **Owned by you**.

### Can a team run jobs on its own workers?

Yes. An owner or admin can switch the team to **Private workers** on the team page. See [Workers overview](../workers/overview.md).
