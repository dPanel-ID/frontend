---
title: How applications work
description: How dPanel deploys an app from GitHub. It builds your repository on your own server, runs it as a systemd service and keeps every build for rollback.
sidebar_position: 1
sidebar_icon: app-window
---

An application in dPanel is your code from a GitHub repository, built and running as a service on one of your own servers. dPanel does not host the code itself: it reads the repository and branch you point it at, runs your build commands on the server, starts the result, and keeps each build so you can roll back.

A **service** here means a systemd service: a program Linux starts for you, keeps running in the background and restarts after a reboot. You never have to set it up by hand. See the [Glossary](../getting-started/glossary.md) for this and other terms.

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

The list opens as a table, with the status, the source repository, the servers and the public address of each application. Use **Search by application name** to find one quickly; upper and lower case do not matter. Select a row to open the application.

The GitHub button in the header shows which account dPanel reads repositories with, such as **Connected to GitHub as** your login. If it says **Reconnect GitHub**, GitHub stopped accepting the saved sign-in. Sign in again before you build.

## The application page

Each application has four tabs.

| Tab         | Use it to                                                               |
| ----------- | ----------------------------------------------------------------------- |
| Overview    | See what is serving right now, open the site, read logs, or redeploy.   |
| Deployments | Browse builds and releases, build again, or roll back.                  |
| Logs        | Read the running service's logs, and the load balancer's if it has one. |
| Settings    | Review and edit how it is built and run, or delete it.                  |

People are shown by name: who ran each build, who owns the application. Select a name to open that person's [public profile](../teams/public-profiles.md).

## Next steps

- [Create an application](./create-an-application.md) from a GitHub repository.
- [Deployments and rollback](./deployments-and-rollback.md): release a new commit, or go back to an earlier build.
- [Environment variables](./environment-variables.md) for settings and secrets.
- Publish it on a domain with HTTPS through a [load balancer](../networking/load-balancers.md).

## Frequently asked questions

### Does dPanel host my code?

No. Your code stays in your GitHub repository, and it runs on a server you own. dPanel connects the two: it clones the repository on the server, builds it there and starts it.

### Can one application run on several servers?

Yes. Each server builds and runs its own copy. Release a build to more than one server from **Build and release**, and see each copy under **On servers**.

### What does "Needs attention" mean?

The last build or release failed. Open the application, go to **Deployments**, and press **Logs** on the failed build. The last lines usually name the step and the error.

### Can I manage applications from the terminal?

Yes. The dnocs command-line tool has `dnocs application list`, `detail`, `create`, `deploy` and `delete`, plus `status`, `logs`, `service`, `env` for runtime variables and `runtime` to move to the new runtime. See [AI in the terminal](../ai/ai-in-the-terminal.md) to install it.
