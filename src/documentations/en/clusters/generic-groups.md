---
title: Generic server groups
description: Create a generic server group in dPanel and install a module, deploy an artifact, refresh inventory, reboot or upgrade the agent on every server at once.
sidebar_position: 2
sidebar_icon: list-checks
sidebar_label: Generic groups
---

A generic group is a saved list of servers. Every action you run on the group runs on each of its servers, and you follow each server's result in one place. The servers stay independent: one failing doesn't stop the others.

## Create a generic group

1. Open **Servers**, then **Server groups**, and press **New group**.
2. Under **What should this group be?**, keep **Generic** and press **Next**.
3. Type a **Name**, for example "Production web", and an optional **Description**. Press **Next**.
4. Check the **Review** and press **Create group**.

![The first step of New group: What should this group be? with Generic selected and Kubernetes next to it](../../assets/clusters/wizard-type.webp 'Step 1: pick Generic for a plain list of servers, or Kubernetes for a cluster.')

The group starts empty. On its page, press **Add servers** and pick the servers. A server can be in one group only.

## Run an action on every server

Open the group and go to **Operations**. Under **Run on this group**:

| Action                | What it does                                                |
| --------------------- | ----------------------------------------------------------- |
| **Install module**    | Installs a module from the catalog on every server          |
| **Deploy artifact**   | Deploys one build of an application to every server         |
| **Refresh inventory** | Re-reads the installed modules and services on every server |
| **Reboot**            | Restarts every server; their applications are briefly down  |
| **Upgrade agent**     | Installs a dPanel agent release on every server             |

Each action records the servers in the group at that moment, then runs on each of them. **Operation history** lists everything that ran, newest first, with how many servers succeeded and failed. **Open** shows each server's result and links to its execution. If some servers failed, **Retry failed servers** runs the action again only on those.

## Change or delete the group

- **Add servers** and **Remove** change who is in the group. **Replace servers** sets the whole list at once.
- **Edit** changes the name and description.
- **Delete group** removes the group only. The servers keep running as they are, and past operations and their logs stay.
