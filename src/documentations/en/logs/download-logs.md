---
title: Download logs
description: Save a page of log lines, or a whole time range, as a .log file.
sidebar_position: 3
sidebar_icon: download
---

Download a log when you need to search it with your own tools, or attach it to a support request.

## Application and load balancer logs

1. Set the time range you want. See [Time range and refresh](./time-range-and-refresh.md).
2. Press **Download**. The menu reads **Download as a .log file**.
3. Choose what to save:
   - **This page**: the lines on the page you are on.
   - **Everything in this time range**: every page, fetched one after another.

![The Download menu: This page, 200 lines on page 1, or Everything in this time range, 201 lines](../../assets/logs/logs-download.webp)

A long download shows its progress, such as **Downloading 12,000 / 40,000 lines**. Press **Cancel download** to stop it.

:::warning[Up to 100,000 lines at once]
**Everything in this time range** stops at 100,000 lines. For a bigger range, the option says **More than 100,000 lines** and is unavailable. Narrow the time range, or download page by page.
:::

## Build logs

In **Artifact Logs**, press **Download**. The file is named after the commit, such as `build-04ccf00a1b2c.log`, and holds the lines shown, up to the newest 500.

## Before you share a log

A log can hold anything your code printed, including tokens or personal data. Read it before you send it anywhere.
