---
title: Update or delete an app
description: Change an application's build steps, start command, variables, build time limit and description in dPanel, see what stays fixed, or delete it and stop its service on every server.
sidebar_position: 6
sidebar_icon: settings-2
sidebar_label: Update or delete an application
---

You can change how a dPanel application is built and run at any time, from one setting to the whole form, or delete it. Changes take effect from the next release.

## Review the setup

Open the application and go to **Settings**. **How this application is set up** shows four blocks.

| Block      | Shows                                                                                 |
| ---------- | ------------------------------------------------------------------------------------- |
| Repository | The repository, its language and framework.                                           |
| Deployment | The build time limit and the description.                                             |
| Build      | The language runtime, the build steps, and the build-time environment variables.      |
| Run        | The service name, the port, the start command, and the runtime environment variables. |

![The Settings tab, with the Repository, Build and Run blocks and the Danger zone](../../assets/applications/app-settings.webp)

## Make a quick change

Each item with an **Edit** button opens a panel for just that part.

| Edit next to                               | Opens                      | Change                                    |
| ------------------------------------------ | -------------------------- | ----------------------------------------- |
| Deployment                                 | Edit application           | The build time limit and the description. |
| Language                                   | Edit Setup Configuration   | The language and its version.             |
| Build steps, Environment variables (Build) | Edit Build Configuration   | The build steps and build-time variables. |
| Start command, Environment variables (Run) | Edit Runtime Configuration | The start command and runtime variables.  |

Press **Save** in the panel, or **Cancel** to close it; with unsaved changes, dPanel asks you to confirm first. The change applies from the next release, so release again with **Build and release** or **Redeploy**.

Variable values are hidden in these panels. Leave a hidden value as it is to keep it, or press **Show values** in **Edit Runtime Configuration** to see the runtime values. See [Environment variables](./environment-variables.md#see-a-saved-value).

## What stays fixed

Four settings are set when you create the application and cannot change: the **Repository**, the **Work directory** (the folder the application lives in on the server), the **Port** and the **Service name**. Servers keep the application in that folder and run it as that service, and load balancers send traffic to that port. The **Edit application** panel lists them under **Fixed settings**.

To use other values, create a new application, release it, point your load balancer at it, then delete the old one.

## Change everything at once

**Edit settings** at the top of the application opens **Update Application**. It is the same five-step form you created the application with, filled in with the current values: server and modules, name, commands, port and environment. The port is read-only here; see [What stays fixed](#what-stays-fixed).

1. Press **Edit settings**.
2. Walk through the steps and change what you need. On **Environment**, values are hidden; **Show values** shows them and **Hide values** hides them again. A hidden value you leave untouched keeps what is stored.
3. On **Preview**, tick **Run bootstrap playbooks** if you changed modules or the server's dependencies need to be applied again.
4. Press **Save changes**.

![The Update Application form, opened from Edit settings](../../assets/applications/app-edit.webp)

dPanel updates the application definition (the saved description of how to build and run it) and submits the playbook inputs for it.

## Delete an application

First take the application off its servers, then delete it.

1. Open the **Deployments** tab and switch to **On servers**.
2. Press **Delete** on each release and confirm. dPanel stops the service and removes it from that server. Wait until the release shows as deleted.
3. Open **Settings**. The **Danger zone** sits at the bottom.
4. Press **Delete this application**.
5. Confirm in the **Delete Application** dialog.

You do not need **Delete permanently** on the releases first: deleting the application removes them too. While a release is still on a server, dPanel refuses to delete the application and tells you to delete its releases first.

:::danger[This cannot be undone]
Deleting removes the application, its builds and its release history from dPanel. Your server and your Git repository are left untouched.
:::

## Frequently asked questions

### Do my changes apply straight away?

No. They apply from the next release. Press **Build and release** or **Redeploy** after saving.

### Can I change an application's port?

No. The port, the service name, the work directory and the repository are fixed once the application exists. Create a new application with the new port instead. See [What stays fixed](#what-stays-fixed).

### When should I tick Run bootstrap playbooks?

When you added or changed modules, such as a new runtime version. dPanel then installs them on the server again before the next build.

### Does deleting an application delete my repository or server?

No. Your Git repository and your server stay. Deleting a release stops its service on that server; deleting the application then removes the application, its builds and its release history from dPanel.

### Can I delete an application from the terminal?

Yes. Delete each release with `dnocs application detail deployment delete --id <app> --deployment-id <release>`, which stops the service on its server, then run `dnocs application delete --id <app>`. Like the web UI, `dnocs application delete` refuses while a release is still on a server.
