---
title: Connect GitHub
description: Connect GitHub to dPanel so it can read your repositories and deploy apps from GitHub, including repositories that belong to a GitHub organisation.
sidebar_position: 4
sidebar_icon: git-branch
---

dPanel deploys applications from GitHub repositories, so before your first application you link a GitHub account. You do it once per dPanel account, and dPanel then lists every repository and branch that account, and the GitHub organisations you install the dnocs-id GitHub App on, can read.

## What you need first

- A GitHub account that can read the repositories you want to deploy.
- For an organisation's repositories, permission to install a GitHub App in that organisation, or someone who has it.

## Connect

1. Open **Applications** in the sidebar.
2. Press **Connect GitHub** at the top of the page.
3. GitHub asks you to sign in and approve dPanel. Approve it.
4. You come back to dPanel. The button now shows your GitHub login with a check mark.

Your profile shows the same link under **Account security**: **GitHub account** reads **Connected**.

## Add a GitHub organisation

The repository picker in **Create Application** lists your own account and every organisation dPanel can read.

1. Open **Applications**, then **Create Application**.
2. Open the **GitHub team** list.
3. If the organisation is missing, choose **Add GitHub account**. It opens the dnocs-id GitHub App on GitHub.
4. Install the app on the organisation, and give it access to the repositories you want.
5. Back in dPanel, the organisation appears in **GitHub team**.

## When GitHub stops answering

GitHub tokens expire. When dPanel can no longer confirm your account you see one of these:

- **Reconnect GitHub** on the Applications page.
- A banner on an application: **GitHub session expired**, with **Relogin GitHub**.
- In the branch list: "GitHub would not confirm your account".

Press the button and sign in to GitHub again. Nothing else changes. Your applications keep running while GitHub is disconnected; only reading repositories and branches stops.

## What happens next

Create your first application. See [How applications work](../applications/overview.md) and [Create an application](../applications/create-an-application.md).
