---
title: Your server page
description: Every tab of a dPanel server page: live CPU and memory, modules, systemd services, Linux users, open ports, files, logs and settings.
sidebar_position: 5
sidebar_icon: gauge
---

Every server in dPanel has one page, and everything you can do to that server is on it: live usage, installed modules, systemd services, Linux users, open ports, files, logs and settings. Open it from **Servers** by selecting the server's row.

## The header

The header shows the name, the status, the address, the Ubuntu release and where it runs, then a line of facts: the SSH login dPanel uses (such as `ubuntu@203.0.113.10:22`), the agent version, the workspace, who created the server and when.

| Control              | What it does                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Refresh (↻)          | Reads the server's status, usage, services and modules again.                             |
| **Edit server** (✎)  | Changes the address, SSH login and agent ports dPanel uses.                               |
| **Open terminal**    | Opens a shell in the browser. See [Connect over SSH](./connect-over-ssh.md).              |
| **More actions** (⋯) | **Reinstall server** runs setup again; **Delete server** removes it. See the table below. |

Select the status badge to see what the status means. While dPanel is setting a server up, a blue banner says so, with **Follow the logs**. If setup fails, a red **Setup did not finish** banner offers **See what happened**.

## Overview

**Live usage** reads CPU, memory and disk from the agent every few seconds while the page is open. Below it are counts of applications, load balancers, databases and modules, then **Server details** (address, SSH login, operating system, agent, provider, ownership, **Created by** and when it was added) and **What runs here**.

![A server page on the Overview tab](../../assets/servers/server-overview.webp)

## Modules

Everything dPanel installed, with its version and status: **Installed**, **Installing** or **Failed**. **Add module** opens the catalogue. **Refresh inventory** asks the agent again. See [Install software](./install-software.md).

![The Modules tab listing installed modules and their status](../../assets/servers/server-modules.webp)

## Services

Every systemd unit the agent can see. A service is a program Linux keeps running in the background, such as a database or a web server. Use the row's actions to start, stop, restart or reload one.

Most servers have well over a hundred units, and many sit in **Dead** or **Exited** on purpose. A **Needs attention** count on a fresh machine is normal.

![The Services tab listing systemd units](../../assets/servers/server-services.webp)

## Users

The Linux accounts on the machine, with their UID, home directory and login shell. **Add user** creates a managed account. Most entries on a fresh server belong to the system, so leave them alone.

![The Users tab listing Linux accounts](../../assets/servers/server-users.webp)

## Network

Which ports are open, which process holds each one, where connections are allowed from, and their state. Check this tab when something can't be reached. An application listening on its port shows up here as **LISTEN**.

![The Network tab listing open ports](../../assets/servers/server-network.webp)

## Files

**Open file manager** lets you browse folders as a tree or a table, upload files, create folders and preview text files.

![The Files tab with the Open file manager button](../../assets/servers/server-files.webp)

## Logs

The newest lines of one log file, parsed into time, level, source and message.

1. Pick a file in the log source picker. **Auth** is first.
2. Pick how many lines to read: 20, 50, 100, 200 or 500.
3. Type in **Filter log lines** to narrow them.
4. Select a line to open the **Log entry** panel, with the full message and **Copy raw line**.

**Refresh** reads the file again. The menu beside it turns on **Auto-refresh**: off by default, or every 30 seconds, minute or 5 minutes.

![The Logs tab of a server, showing parsed log lines](../../assets/servers/server-logs.webp)

:::note[Server logs have no time range]
This tab reads the newest lines of a file. The time range, paging and download are on application and load balancer logs. See [Reading logs](../logs/reading-logs.md).
:::

## Settings

The changes you rarely need, each saying what it does.

| Card        | Button              | What it does                                                           |
| ----------- | ------------------- | ---------------------------------------------------------------------- |
| Connection  | **Edit connection** | Changes the address, SSH login and agent ports dPanel uses.            |
| Setup       | **Reinstall**       | Reconnects over SSH, reinstalls the agent and refreshes the inventory. |
| Danger zone | **Delete server**   | Removes the server. See [Delete a server](./delete-a-server.md).       |

**Setup** is hidden while a server is being set up or deleted, and on a deleted server, because there is nothing to reinstall then. A server stays in the workspace it was created in; it cannot be moved to another one.

![The Settings tab with the Connection, Setup and Danger zone cards](../../assets/servers/server-settings.webp)
