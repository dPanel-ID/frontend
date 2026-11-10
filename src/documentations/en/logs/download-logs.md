---
title: Download logs
description: Download application and load balancer logs from dPanel as a .log file: the lines loaded in the list, or a whole time range of up to 100,000 lines.
sidebar_position: 3
sidebar_icon: download
---

dPanel downloads application and load balancer logs as a plain `.log` file, either the lines loaded in the list or every line in the time range, up to 100,000 lines. Download a log when you need to search it with your own tools, or attach it to a support request.

## Application and load balancer logs

1. Set the time range you want. See [Time range and refresh](./time-range-and-refresh.md).
2. Press **Download**. The menu reads **Download as a .log file**.
3. Choose what to save:
   - **Loaded lines**: the lines currently loaded in the list.
   - **Everything in this time range**: every line, fetched in batches.

The file name says what is in it: the name of the log and the time window, such as `my-app_2026-11-05T01-00Z_to_2026-11-05T01-10Z.log`. Lines are saved oldest first, as plain text you can open in any editor. Each line holds the time in UTC, the level, and the line exactly as it was written.

:::note[Request details are not in the file]
A load balancer writes each request as the short message `handled request`, with the method, path and status kept as separate fields. The download saves that message, not the readable `GET … → 200` line. To save request details, use `dnocs load-balancer log --id <load balancer ID> --json`.
:::

A long download shows its progress, such as **Downloading 12,000 / 40,000 lines**. Press **Cancel download** to stop it.

:::warning[Up to 100,000 lines at once]
**Everything in this time range** stops at 100,000 lines. For a bigger range, the option says **More than 100,000 lines** and is unavailable. Narrow the time range, or save the loaded lines. An application's runtime logs across all servers stop at 5,000 lines; pick one server in the **Server** menu for more.
:::

## Raw log from the server

The two options above read dPanel's log store, which keeps the last 3 days and shortens structured lines to their message. To get the real log, press **Download** on an application's Logs tab and choose **Raw log from the server**.

The file holds every line of the time range exactly as your application wrote it, oldest first, read from the journal on the server. Structured (JSON) lines stay whole. dPanel adds no time or level to the lines, so a line has a time only if your application wrote one. The file name ends in `.raw.log`.

An application on several servers needs one server picked first. In the web app a raw log covers the selected time range, at most 3 days. From a terminal it can reach back up to 10 days, as long as the server still keeps its journal. One download can be up to 1 GB. The server's agent must be up to date. From a terminal, use `dnocs application logs --id N --since 72h --raw --output app.log`.

:::warning[Nothing is masked]
Other log views hide text that looks like a password or token. A raw log does not, and it can hold request bodies and response headers. Anyone who can open the application can download it, and each download is recorded in the audit log.
:::

## Build logs

In **Artifact Logs**, open the **Log output** tab and press **Download**. Choose **Loaded lines** or **Everything in this time range** for the whole build. The file name starts with the commit, such as `build-04ccf00a1b2c`.

## Before you share a log

A log can hold anything your code printed, including tokens or personal data. Read it before you send it anywhere.

## Frequently asked questions

### How many lines can I download?

Up to 100,000 lines at once with **Everything in this time range**, or 5,000 for runtime logs across all servers. For more, narrow the time range or pick one server.

### Can I download server logs?

Not as a file. Server logs show the newest 20 to 500 lines of one file. Select a line and use **Copy raw line**, or read it over SSH. See [Connect over SSH](../servers/connect-over-ssh.md).

### What format is the file?

Plain text with a `.log` extension, one line per log entry, oldest first.
