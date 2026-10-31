---
title: Update or delete an application
description: Change how an application is built and run, or remove it and stop its service.
sidebar_position: 6
---

## Review the setup

Open the application and go to **Settings**. **How this application is set up** shows three blocks.

| Block      | Shows                                                                                 |
| ---------- | ------------------------------------------------------------------------------------- |
| Repository | The repository, its language and framework.                                           |
| Build      | The language runtime, the build steps, and the build-time environment variables.      |
| Run        | The service name, the port, the start command, and the runtime environment variables. |

![The Settings tab, with the Repository, Build and Run blocks and the Danger zone](../../assets/applications/app-settings.webp)

## Make a quick change

Each item with an **Edit** button opens a panel for just that part.

| Edit next to                               | Opens                      | Change                                    |
| ------------------------------------------ | -------------------------- | ----------------------------------------- |
| Language                                   | Edit Setup Configuration   | The language and its version.             |
| Build steps, Environment variables (Build) | Edit Build Configuration   | The build steps and build-time variables. |
| Start command, Environment variables (Run) | Edit Runtime Configuration | The start command and runtime variables.  |

Press **Save** in the panel. The change applies from the next release, so release again with **Build and release** or **Redeploy**.

## Change everything at once

**Edit settings** at the top of the application opens **Update Application**. It is the same five-step form you created the application with, filled in with the current values: server and modules, name, commands, port and environment.

1. Press **Edit settings**.
2. Walk through the steps and change what you need.
3. On **Preview**, tick **Run bootstrap playbooks** if you changed modules or the server's dependencies need to be applied again.
4. Press **Save changes**.

![The Update Application form, opened from Edit settings](../../assets/applications/app-edit.webp)

dPanel updates the application definition and submits the playbook inputs for it.

## Delete an application

The **Danger zone** sits at the bottom of **Settings**.

1. Press **Delete this application**.
2. Confirm in the **Delete Application** dialog.

:::danger[This cannot be undone]
Deleting removes the application, its builds and its release history from dPanel, and stops the service on every server it runs on. Your server and your Git repository are left untouched.
:::
