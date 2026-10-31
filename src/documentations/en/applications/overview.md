---
title: How applications work
description: dPanel builds your code from GitHub and runs it on a server you already have.
sidebar_position: 1
sidebar_icon: app-window
---

An application is your code, running as a service on one of your servers. dPanel does not host the code itself. It reads the GitHub repository you point it at, builds it on the server, and keeps the service running there.

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

![The Applications page, listing the demo application Go Example Docs with its status and server](../../assets/applications/apps-list.webp 'Applications, with one application running.')

| Status          | What it means                                                      |
| --------------- | ------------------------------------------------------------------ |
| Running         | The service is up on its server.                                   |
| Building        | A build or a release is in progress.                               |
| Needs attention | The last build or release failed. Open the application to see why. |
| Not running     | Nothing has been released yet, or the service is stopped.          |

Use **Search by application name** to find one quickly. Select a row to open the application.

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

- [Create an application](./create-an-application.md)
- [Deployments and rollback](./deployments-and-rollback.md)
