---
title: Install software
description: Add a database or a runtime through the module catalogue.
sidebar_position: 7
---

dPanel installs software through modules. A module is a tested recipe: you answer a few questions, dPanel installs, configures and starts it on the server, then keeps track of what it put there.

## Open the catalogue

1. Open the server and go to **Modules**.
2. Press **Add module**.

The **Module catalog** groups what is available: **Containers**, **Databases**, **Infrastructure**, **Programming Languages Runtime** and **Utilities**. Modules already on the server are marked **Installed**, with **Manage** instead of **Install**.

![The module catalogue, grouped by category](../../assets/servers/server-module-catalog.webp)

## Install a database

1. Press **Install** on the module you want, for example **MariaDB**.
2. The form lists the **Roles to run** and asks only for what it can't decide for you. For MariaDB that is **MariaDB Version**, **Root Password** and **Bind Address**.
3. Press **Install role** and confirm.

![The MariaDB install form, with version, root password and bind address](../../assets/servers/server-module-install-form.webp)

:::warning[Choose the password yourself]
The root password is required and must be at least 8 characters. There is no default, because a database installed with a published default password is open to anyone who knows it. dPanel stores it only on the server and never shows it again, so keep your own copy somewhere safe.
:::

## What happens next

The module appears on the **Modules** tab as **Installing**. A database takes a few minutes. When it is done:

- The **Modules** tab shows it as **Installed**, with its version.
- The **Overview** tab lists it under **What runs here**.
- The **Services** tab shows its service running.

If it reads **Failed**, open the module to see why, fix the cause, and install it again.

:::tip[Runtimes for applications]
You don't have to install a language runtime first. When you [create an application](../applications/create-an-application.md), you pick its runtime as a dependency, and dPanel installs it on the server.
:::

## Many servers at once

A server group installs the same module on every member in one operation, and shows the result per server. Groups are under **Servers**, then **Server groups**.
