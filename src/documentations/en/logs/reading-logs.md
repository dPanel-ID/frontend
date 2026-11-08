---
title: Reading logs
description: Where to find server, application, load balancer and build logs in dPanel, and how to read, filter and search the log table by level and text.
sidebar_position: 1
sidebar_icon: file-text
---

dPanel shows four kinds of log in the browser, so you don't need SSH, `journalctl` or `tail -f`: server log files, application runtime logs, load balancer request logs and build logs. They share one table, so once you can read one you can read them all.

A **log** is a program's running record of what it did, one line per event, such as "started", "request served" or an error. See the [Glossary](../getting-started/glossary.md).

## Where logs live

| Log                      | Where to find it                                                                           | What it covers                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Server logs              | Server page, **Logs** tab                                                                  | Log files on the machine: system, security, provisioning, the dPanel agent, and the web server. |
| Application runtime logs | Application page, **Logs** tab, **Runtime**                                                | What your service prints while it runs.                                                         |
| Load balancer logs       | Application page, **Logs** tab, **Load balancer**; or the load balancer's own **Logs** tab | Requests reaching the load balancer.                                                            |
| Build logs               | Application page, **Deployments**, **Logs** on a build                                     | Where a build is, step by step, and its output: clone, build steps, service start.              |

## The log table

![An application's Logs tab: the log source, time range, filter, Download and Refresh controls above the table](../../assets/applications/app-runtime-logs.webp 'A quiet window shows "No runtime logs in this window." Widen the time range to look further back.')

Each row is one line, with these columns:

| Column  | Shows                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| #       | The line's number, counted from the newest line. Server logs count from the top of the file view.                              |
| Time    | When it was written, in your time zone.                                                                                        |
| Level   | debug, info, notice, warn, error or fatal, when the line says.                                                                 |
| Source  | The file, service or domain it came from.                                                                                      |
| Message | The text. A **JSON** badge means the line carries structured data; an **HTTP** badge means it is a request to a load balancer. |

Runtime and load balancer logs open on the newest line, at the bottom. Scroll up to load older lines, until the start of the time range. The footer says what is loaded, for example **Lines 1–200 of 1,250 loaded, newest at the bottom**. See [Time range and refresh](./time-range-and-refresh.md#scroll-up-for-older-lines).

**Query** above the table folds open to show the exact search dPanel ran. You only need it when you report a problem.

## Logs of an application on several servers

When an application runs on more than one server, its runtime logs merge every server into one list, newest at the bottom. The **Source** column says which server wrote each line, and a new server appears as soon as the application is deployed to it.

To look at one server, for example when only that one misbehaves, open the **Server** menu next to the run name and pick it. **All servers** brings the merged list back.

## Load balancer requests

Load balancer logs show each request as one readable line, marked **HTTP**:

![Load balancer requests to an application, with level chips Warn 5 and Info 3, one row per request](../../assets/logs/logs-http-requests.webp 'A 4xx status is a warning, a 5xx status an error.')

`GET shop.example.com/api/info → 401 · 7 ms` reads as: the method, the domain and path asked for, the status code sent back, and how long it took. The level follows the status code: `5xx` is **error**, `4xx` is **warn**, the rest is **info**. Open the entry to see every field, such as the visitor's IP address, the protocol and the request headers.

A TCP or UDP load balancer (L4, which forwards raw connections such as a database port instead of web pages) logs connections, not requests. The command-line tool prints each as a line such as `TCP 203.0.113.10 -> 10.0.0.12:5432 · in 78 B, out 199 B · 3ms`: the client, the upstream it reached, the bytes each way, and how long the connection lasted.

## Narrow it down

- **Filter loaded lines** keeps the lines that contain your text. Upper and lower case do not matter, so `error` also finds `ERROR`. It searches the lines already loaded, not the whole time range. For a request, it also matches the readable line, so `→ 500` finds server errors.
- **Level chips** sit above the table, one per level present, with a count. Select **error** to see only errors; select **All** to go back. The chips are hidden when every line has the same level.
- When nothing matches, **Clear search** removes both filters.

## Open one entry

Select a row, or its **Open entry** button. The **Log entry** panel opens beside the table with:

- **Message**: the full text, never cut off.
- **Structured payload**: any JSON in the line, pretty-printed.
- **Context**: time, level and source, shown at the top of the panel.
- **Raw line**: exactly what was written. **Copy raw line** copies it.

![The Log entry side panel beside a server's log table, showing the level, time, source, message and raw line of one entry](../../assets/logs/logs-entry-panel.webp)

## Server logs

The server's **Logs** tab reads the newest lines of one log file.

1. Open the server and go to **Logs**.
2. Pick a file in **Log source**. They are grouped as Overview, System, Security, Provisioning, dPanel and Network. **Auth** is selected first; **All VM logs** reads them together.
3. Pick how many lines to read: 20, 50, 100, 200 or 500.

![The Logs tab of a server, with the log source and line count pickers](../../assets/servers/server-logs.webp)

:::note[No time range on server logs]
Server logs read the newest lines of a file, not a time window. The time range, scrolling and download described in [Time range and refresh](./time-range-and-refresh.md) apply to application and load balancer logs.
:::

## Build logs

**Artifact Logs** opens over the page with two tabs.

**Steps** shows where the build is, and opens first. It refreshes by itself every few seconds while the build runs:

| Stage                        | What happens                                                |
| ---------------------------- | ----------------------------------------------------------- |
| Install runtimes and modules | The languages and tools the application needs.              |
| Get the source code          | The commit is cloned from your repository.                  |
| Prepare the build            | The application definition is read and the build is set up. |
| One row per build step       | Your build commands, shown by the name you gave them.       |
| Package the build            | The result is archived, on builds that make an archive.     |
| Deploy to the server         | The service is created and started.                         |

Each row shows its status, the number of steps and how long it took. The stage running now, or the one that failed, opens by itself; select any stage to see its steps.

**Log output** holds the lines the build printed, for the whole build: scroll up for earlier output. It has **Filter loaded lines**, the level chips, **Download**, and **Refresh** with **Auto-refresh**. Select a line to expand it in place.

:::note[Output arrives when a step ends]
A build step's output reaches **Log output** when that step finishes, so a long step can show nothing there while it runs. **Steps** tells you it is still working and for how long.
:::

## Frequently asked questions

### How far back can I read logs in dPanel?

Application and load balancer logs go back 10 days. Server logs show the newest 20 to 500 lines of a file. Build logs hold the whole build.

### Why does a running build show no log lines?

A build step's output arrives when the step ends. Open the **Steps** tab of **Artifact Logs** to see which step is running and for how long.

### Can I see the logs of only one server?

Yes. On an application that runs on several servers, pick the server in the **Server** menu on the **Logs** tab. See [Logs of an application on several servers](#logs-of-an-application-on-several-servers).

### Does Filter loaded lines search the whole time range?

No. It searches the lines already loaded. To look further back, scroll up or narrow the time range. See [Time range and refresh](./time-range-and-refresh.md).

### Can I follow logs live?

Yes. Turn on **Auto-refresh** next to **Refresh**, every 30 seconds, minute or 5 minutes. It pauses after you scroll up, until you return to the bottom or press **Jump to latest**.

### Can I save logs to a file?

Yes. Application and load balancer logs have **Download**, for the loaded lines or the whole time range. See [Download logs](./download-logs.md).

### Can I read load balancer logs from the terminal?

Yes. `dnocs load-balancer log --id <load balancer ID>` prints each request as `GET host/path → 200 · 148ms`, newest first. Use `--since` to look back up to `240h`, `--page` and `--limit` (up to 500) to page, and `--json` for every field. Find the ID with `dnocs load-balancer list`. See [AI in the terminal](../ai/ai-in-the-terminal.md) to install dnocs.

### Is the filter case-sensitive?

No. **Filter loaded lines** and every search box in dPanel ignore upper and lower case.
