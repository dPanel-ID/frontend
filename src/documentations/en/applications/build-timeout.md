---
title: Build timeout
description: How long a build may run, and how to give a slow build more time.
sidebar_position: 7
sidebar_icon: timer
---

Every build and release runs as one job: clone, runtime setup, build steps and service start. By default that job stops after **20 minutes**.

Most applications finish well inside that. A build that compiles a lot, such as a Docker image with many PHP extensions on a small server, may not. When the limit is reached the build fails, and its log ends with `context deadline exceeded`.

## Give a build more time

Set `build.timeout` in the application definition. It is a duration such as `45m`, `90m` or `2h`, between `1m` and `3h`.

```yaml
build:
  timeout: 90m
```

dPanel checks the value when it starts a build. A value it cannot read, such as `90 minutes`, or one outside 1 minute to 3 hours, stops the build with an error that says so. Leave it out to keep the default.

:::note[Not in the web form yet]
The **Create Application** and **Update Application** forms have no field for the timeout. Set it in a `.devetek/*.yml` application definition and pass it with the dnocs command-line tool's `--definition` option, on `dnocs application create` or `dnocs application deploy`.
:::

## Before you raise it

- Read the failed build's **Logs** first. A step that hangs waiting for input fails the same way, and more time will not help.
- Try a bigger server. A build that takes an hour on the smallest size often takes minutes on the next one.
