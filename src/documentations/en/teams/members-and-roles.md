---
title: Members and roles
description: Add people to a team, give each the access they need, and move resources between workspaces.
sidebar_position: 2
sidebar_icon: user-cog
---

Each member of a team has one or more roles. A role decides what that person can see and change in the team's workspace.

![A team page listing members with their roles and join dates](../../assets/teams/team-detail.webp 'A team page: members, their roles, and when they joined.')

## Add a member

The person needs a dPanel account first. Ask them to sign up, then:

1. Open **Teams** and open the team.
2. Press **Add Member**.
3. In **Add New People**, open **Select a user…** and search by username or name.
4. Under **Workspace roles**, choose what they should get. See the table below. Owner and Admin are **Protected**: only a workspace owner can give them.
5. Press **Add member**.

They see the team in their workspace switcher straight away.

## The roles

Every role uses the same three levels on every kind of resource:

| Level      | Read | Create | Update | Delete |
| ---------- | ---- | ------ | ------ | ------ |
| **Viewer** | Yes  | No     | No     | No     |
| **Editor** | Yes  | Yes    | Yes    | No     |
| **Admin**  | Yes  | Yes    | Yes    | Yes    |

Preset roles apply across the whole workspace.

| Role          | Can do                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**     | Everything, including members, roles, billing, destructive operations and ownership transfer                                          |
| **Admin**     | Create, read, update and delete every resource, and manage members                                                                    |
| **DevOps**    | Editor on cloud projects, servers, databases, load balancers, secrets, domains and applications; reads everything else; cannot delete |
| **Developer** | Editor on applications, builds and deployments; reads everything else; cannot delete                                                  |
| **Viewer**    | Read-only access to every resource and its status                                                                                     |
| **Billing**   | Billing, packages and subscriptions                                                                                                   |

For finer control, each kind of resource also has its own **Viewer**, **Editor** and **Admin** role: Workspace, Cloud Project, Server, Application, Database, Domain, Load Balancer, Billing and Secret. For example, **Application Editor** can create and deploy applications but cannot delete them.

:::tip
Start people on the narrowest role that lets them do their job. **Developer** suits most people who only ship code; **Viewer** suits anyone who only needs to look.
:::

## Change a member's roles

1. Open the team.
2. On the member's row, open the menu and choose **Manage roles**.
3. Tick the roles they should have. **Select group** ticks a whole group; **Clear** unticks everything.
4. Press **Save roles**.

Saving replaces the member's role set. A member holds one preset role, so ticking **Admin** replaces **Developer** or **DevOps**.

Owner and Admin are marked **Protected**. Only a workspace owner can tick them, or change or remove a member who holds one. For everyone else they are shown but disabled.

## Remove a member

1. Open the team.
2. On the member's row, open the menu and choose **Remove**.
3. Confirm **Remove Member**.

They lose access to the team's workspace immediately. Resources they created stay with the team.

## Check your own roles

Your **Profile** lists every workspace with your role in it. **View active workspace roles** shows the full role list for the workspace you are in.

## Move a resource to another workspace

Servers, applications, load balancers, domains, cloud accounts and SSH keys can move between workspaces, for example from your personal workspace into a team.

1. Find the resource in its list and open the row menu. For a server, open it and go to **Settings**.
2. Choose **Migrate Ownership** (on a server: **Migrate ownership**).
3. Under **New Owner**, pick the team, or **Personal**.
4. Leave **Move what it needs too** on to bring along the SSH key, cloud account or server it depends on, when nothing else still uses them.
5. Confirm.

:::warning
The move takes effect immediately. People in the old workspace lose management access to the resource.
:::
