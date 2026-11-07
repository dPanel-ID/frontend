---
title: Build timeout
description: dPanel stops a build after 20 minutes by default. Set build.timeout between 1 minute and 3 hours to give a slow application build more time.
sidebar_position: 7
sidebar_icon: timer
---

dPanel stops a build after **20 minutes** by default, and you can raise the limit per application up to 3 hours with `build.timeout`. Every build and release runs as one job: clone, runtime setup, build steps and service start.

A **build** is the job that turns your repository into something that can run, for example by compiling it. See the [Glossary](../getting-started/glossary.md).

Most applications finish well inside that. A build that compiles a lot, such as a Docker image with many PHP extensions on a small server, may not. When the limit is reached the build fails, and its log ends with `context deadline exceeded`.

## Give a build more time

In the web app:

1. Open the application and go to **Settings**.
2. Press **Edit** on the **Deployment** block. The **Edit application** panel opens.
3. Under **Build**, set **Time limit** to a duration such as `45m`, `90m` or `2h`, between `1m` and `3h`. Leave it on **Default** to keep 20 minutes.
4. Press **Save**. The new limit applies from the next build.

From the terminal, set `build.timeout` in the application definition. It takes the same durations.

```yaml
build:
  timeout: 90m
```

dPanel checks the value when it starts a build. A value it cannot read, such as `90 minutes`, or one outside 1 minute to 3 hours, stops the build with an error that says so. Leave it out to keep the default.

Pass the definition, a `.devetek/*.yml` file, with the dnocs command-line tool's `--definition` option, on `dnocs application create` or `dnocs application deploy`.

## Before you raise it

- Read the failed build's **Logs** first. A step that hangs waiting for input fails the same way, and more time will not help.
- Try a bigger server. A build that takes an hour on the smallest size often takes minutes on the next one. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).
- See all of a build's output in [Deployments and rollback](./deployments-and-rollback.md#read-a-builds-logs).

## Frequently asked questions

### What is the longest build dPanel allows?

3 hours. Set `build.timeout: 3h`. Anything longer is refused when the build starts.

### Does the timeout include starting the service?

Yes. The limit covers the whole job: clone, runtime setup, build steps and service start.

### Can I set the timeout in the web app?

Yes. Open the application's **Settings**, press **Edit** on **Deployment**, and set **Time limit** under **Build**. See [Give a build more time](#give-a-build-more-time).
