---
title: Reading logs
description: Where each log lives in dPanel, and how to read and narrow the log table.
sidebar_position: 1
---

dPanel shows four kinds of log. They share one table, so once you can read one you can read them all.

## Where logs live

| Log                      | Where to find it                                                                           | What it covers                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Server logs              | Server page, **Logs** tab                                                                  | Log files on the machine: system, security, provisioning, the dPanel agent, and the web server. |
| Application runtime logs | Application page, **Logs** tab, **Runtime**                                                | What your service prints while it runs.                                                         |
| Load balancer logs       | Application page, **Logs** tab, **Load balancer**; or the load balancer's own **Logs** tab | Requests reaching the load balancer.                                                            |
| Build logs               | Application page, **Deployments**, **Logs** on a build                                     | The output of one build: clone, build steps, service start.                                     |

## The log table

![An application's Logs tab: the log source, time range, filter, Download and Refresh controls above the table](../../assets/applications/app-runtime-logs.webp 'A quiet window shows "No runtime logs in this window." Widen the time range to look further back.')

Each row is one line, with these columns:

| Column  | Shows                                                              |
| ------- | ------------------------------------------------------------------ |
| #       | The line's position on this page.                                  |
| Time    | When it was written, in your time zone.                            |
| Level   | debug, info, notice, warn, error or fatal, when the line says.     |
| Source  | The file, service or domain it came from.                          |
| Message | The text. A **JSON** badge means the line carries structured data. |

Newest lines come first.

## Narrow it down

- **Filter this page** keeps the lines that contain your text. It searches the lines already loaded, not the whole time range.
- **Level chips** sit above the table, one per level present, with a count. Select **error** to see only errors; select **All** to go back. The chips are hidden when every line has the same level.
- When nothing matches, **Clear search** removes both filters.

## Open one entry

Select a row, or its **Open entry** button. The **Log entry** panel opens beside the table with:

- **Message**: the full text, never cut off.
- **Structured payload**: any JSON in the line, pretty-printed.
- **Context**: time, level and source.
- **Raw line**: exactly what was written. **Copy raw line** copies it.

![The Log entry side panel beside a server's log table, showing the level, time, source, message and raw line of one entry](../../assets/logs/logs-entry-panel.webp)

## Server logs

The server's **Logs** tab reads the newest lines of one log file.

1. Open the server and go to **Logs**.
2. Pick a file in **Log source**. They are grouped as Overview, System, Security, Provisioning, dPanel and Network. **Auth** is selected first; **All VM logs** reads them together.
3. Pick how many lines to read: 20, 50, 100, 200 or 500.

![The Logs tab of a server, with the log source and line count pickers](../../assets/servers/server-logs.webp)

:::note[No time range on server logs]
Server logs read the newest lines of a file, not a time window. The time range, paging and download described in [Time range and refresh](./time-range-and-refresh.md) apply to application and load balancer logs.
:::

## Build logs

**Artifact Logs** opens over the page with the newest 500 lines of that build. It has **Filter this page**, the level chips, **Download**, and **Refresh** with **Auto-refresh**, which is handy while a build is still running. Select a line to expand it in place.
