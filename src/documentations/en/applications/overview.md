---
title: How applications work
description: How dPanel deploys an app from GitHub: it builds your repository on your own server, runs it as a systemd service and keeps every build for rollback.
sidebar_position: 1
sidebar_icon: app-window
---

An application in dPanel is your code from a GitHub repository, built and running as a systemd service on one of your own servers. dPanel does not host the code itself: it reads the repository and branch you point it at, runs your build commands on the server, starts the result as a service, and keeps each build so you can roll back.

## The three steps

1. **Point at a repository.** Connect GitHub and pick the repository and branch to build from.
2. **dPanel builds it.** Each build is kept, so you can see what shipped and roll back to an earlier one.
3. **It runs on your server.** dPanel installs the build and starts it as a systemd service.

:::info[Builds stay on the server]
A build is not shared between machines. Each server builds and installs the application on its own.
:::

## What you need first

- A server that is **Ready**. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).
- A GitHub account connected to dPanel. See [Connect GitHub](../getting-started/connect-github.md).
- A repository with a build command and a start command. A single script for each is enough.

## The Applications page

Open **Applications** in the sidebar. The page lists every application in the current workspace, with counts at the top.

![The Applications page in table view, listing an application with its status, source repository, server and address](../../assets/applications/apps-list.webp 'Applications, with one application running.')

| Status          | What it means                                                      |
| --------------- | ------------------------------------------------------------------ |
| Running         | The service is up on its server.                                   |
| Building        | A build or a release is in progress.                               |
| Needs attention | The last build or release failed. Open the application to see why. |
| Not running     | Nothing has been released yet, or the service is stopped.          |

The list opens as a table, with the status, the source repository, the servers and the public address of each application. Use **Search by application name** to find one quickly. Select a row to open the application.

The GitHub button in the header shows which account dPanel reads repositories with, such as **Connected to GitHub as** your login. If it says **Reconnect GitHub**, GitHub stopped accepting the saved sign-in. Sign in again before you build.

## The application page

Each application has four tabs.

| Tab         | Use it to                                                               |
| ----------- | ----------------------------------------------------------------------- |
| Overview    | See what is serving right now, open the site, read logs, or redeploy.   |
| Deployments | Browse builds and releases, build again, or roll back.                  |
| Logs        | Read the running service's logs, and the load balancer's if it has one. |
| Settings    | Review and edit how it is built and run, or delete it.                  |

## Next steps

- [Create an application](./create-an-application.md) from a GitHub repository.
- [Deployments and rollback](./deployments-and-rollback.md): release a new commit, or go back to an earlier build.
- [Environment variables](./environment-variables.md) for settings and secrets.
- Publish it on a domain with HTTPS through a [load balancer](../networking/load-balancers.md).
