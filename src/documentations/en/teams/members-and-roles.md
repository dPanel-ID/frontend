---
title: Members and roles
description: Add people to a dPanel team and pick their role, from Viewer to Owner, so each person can see, deploy or delete only what they should.
sidebar_position: 2
sidebar_icon: user-cog
---

In dPanel, each member of a team has one or more roles, and a role decides what that person can see, create, change and delete in the team's workspace: from **Viewer**, who can only look, to **Owner**, who can do everything.

![A team page with its member count, your role and status, above the Members table with roles and join dates](../../assets/teams/team-detail.webp 'A team page: members, their roles, and when they joined.')

## Add a member

The person needs a dPanel account first. Ask them to sign up, then:

1. Open **Teams** and open the team.
2. Press **Add Member**.
3. In **Add New People**, open **Select a user…** and search by username or name. Upper and lower case do not matter.
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
2. On the member's row, press **Manage roles**.
3. Tick the roles they should have. **Select group** ticks a whole group; **Clear** unticks everything.
4. Press **Save roles**.

Saving replaces the member's role set. A member holds one preset role, so ticking **Admin** replaces **Developer** or **DevOps**. The change takes effect at once: a member whose role you lower loses the extra access on their next action, without signing out.

Owner and Admin are marked **Protected**. Only a workspace owner can tick them, or change or remove a member who holds one. For everyone else they are shown but disabled.

## Remove a member

1. Open the team.
2. On the member's row, press **Remove from team**.
3. Confirm **Remove Member**.

They lose access to the team's workspace immediately. Resources they created stay with the team.

## Check your own roles

Your **Profile** lists every workspace with your role in it. **View active workspace roles** shows the full role list for the workspace you are in.

## Resources stay in their workspace

Servers, applications, load balancers, domains, cloud accounts and SSH keys stay in the workspace they were created in, so create shared resources in the team workspace from the start. The one exception: a resource in your personal workspace can be moved into a team once, with `dnocs transfer`. See [Teams](./teams.md#can-i-move-a-server-from-my-personal-workspace-into-a-team) and [Workspaces](../getting-started/workspaces.md).

## See who did what

Across dPanel, people are shown by name with their avatar: who ran a build, who owns a server or a domain, who did each action in the dashboard's activity. Select a name to open their [public profile](./public-profiles.md).

## Frequently asked questions

### Which role should a developer get?

**Developer**. It can create applications, build and deploy them, and read everything else, but cannot delete anything.

### Who can give someone the Owner or Admin role?

Only a workspace owner. Owner and Admin are marked **Protected**; for everyone else they are shown but disabled.

### Does a new member need a dPanel account?

Yes. Ask them to [sign up](../getting-started/sign-in.md#create-an-account) first, then find them by username or name in **Add New People**.

### What happens to resources when I remove a member?

They stay with the team. The member loses access to the team's workspace immediately.
