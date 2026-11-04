---
title: Workers overview
description: Workers run your dPanel jobs, such as deployments, server setup and module installs. Use dPanel's shared workers, or run jobs on your own GitHub Actions workflow or VM.
sidebar_position: 1
sidebar_icon: settings-2
---

A **worker** is the program that runs your workspace's jobs: setting up a server, installing a module, deploying an application, applying a load balancer. It connects to your servers over SSH and reports back to dPanel.

You do not need to set anything up. **dPanel's shared workers** run every job unless you choose your own.

![The Workers card on the Profile page, with Shared workers (dPanel) selected, Private workers off and an Add worker button](../../assets/workers/workers-card.webp 'Workers on Profile: shared workers run your jobs until you add your own.')

## Shared or private

| | Shared workers (dPanel) | Private workers (yours) |
| --- | --- | --- |
| Setup | None | Add a GitHub workflow or a VM |
| Who runs your jobs | dPanel | Only the workers you add |
| Good for | Getting started, most workspaces | Servers reachable only from your network, your own CI minutes, compliance |

Each workspace chooses on its own: your personal workspace on **Profile**, a team on its team page. Only team owners and admins can change a team's workers.

## Two kinds of private worker

| | GitHub workflow | VM |
| --- | --- | --- |
| How it runs | dPanel starts your workflow when a job is waiting. One run takes one job and ends. | Runs all the time and asks dPanel for jobs. |
| Secret to keep | None. The run signs in with GitHub's identity token. | A token, shown once when you add it. |
| Setup | One short workflow file | Install and run the executor on the machine |
| Guide | [GitHub Actions worker](./github-actions.md) | [VM worker](./vm.md) |

:::tip[Easiest start]
A GitHub workflow worker takes about five minutes and needs no server and no secret. Start with [GitHub Actions worker](./github-actions.md).
:::

## Where jobs wait

When a workspace uses private workers, its jobs go **only** to those workers. If none of them is running, jobs wait until one is. Switching back to **Shared workers (dPanel)** sends new jobs to dPanel again; your workers stay registered so you can switch back later.
