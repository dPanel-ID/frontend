---
title: Your server page
description: What each tab on a server is for.
sidebar_position: 11
---

Every server has one page, and everything you can do to that server is on it.

The header shows the name, the status, the address, the Ubuntu release, where it runs, the SSH login dPanel uses, the agent, the workspace it belongs to and when it was created. **Open terminal** is there too. See [Connect over SSH](./connect-over-ssh.md).

## Overview

**Live usage** reads CPU, memory and disk from the agent every few seconds while the page is open. Below it are counts of applications, load balancers, databases and modules, then **Server details** and **What runs here**.

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

| Card        | Button                | What it does                                                           |
| ----------- | --------------------- | ---------------------------------------------------------------------- |
| Connection  | **Edit connection**   | Changes the address, SSH login and agent ports dPanel uses.            |
| Setup       | **Reinstall**         | Reconnects over SSH, reinstalls the agent and refreshes the inventory. |
| Ownership   | **Migrate ownership** | Moves the server to another workspace, or to your personal space.      |
| Danger zone | **Delete server**     | Removes the server. See [Delete a server](./delete-a-server.md).       |

![The Settings tab with Connection, Setup, Ownership and Danger zone](../../assets/servers/server-settings.webp)
