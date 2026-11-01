---
title: Ask dPanel (AI assistant)
description: Ask dPanel is the built-in AI assistant. Ask about your servers, apps, domains and failed jobs in plain language; changes run only after you approve them.
sidebar_position: 6
sidebar_icon: circle-help
sidebar_label: Ask dPanel
---

**Ask dPanel** is the AI assistant built into dPanel. It answers questions about the servers, applications, domains, load balancers, SSH keys, cloud accounts and recent jobs in your current workspace, and it can prepare a change for you to approve.

![The dPanel assistant panel, open beside the dashboard with example questions](../../assets/getting-started/assistant.webp 'The assistant works in your current workspace, with your own access.')

## Open the assistant

1. Press **Ask dPanel** at the bottom right of any page. On a phone the button shows only its chat icon.
2. The **dPanel assistant** panel opens beside the page.
3. Type in **Ask about your servers, apps, domains…**, or press one of the example questions.
4. Press Enter to send. Shift+Enter starts a new line.

While it works, the panel says **Checking dPanel…**. A longer question can take a minute or two. Under each answer, **Checked:** lists what the assistant looked at, so you can see where the answer came from.

## What to ask

The assistant reads dPanel through the same API you use, with your own role. Good questions are specific:

- "Which of my servers are stopped?"
- "Did any job fail in the last 24 hours?"
- "List my domains and their DNS providers."
- "Which application runs on dpanel-web-01, and on which port?"
- "Why did the last build of My App fail?"

It only sees the workspace you are in. Switch workspace first to ask about another one. See [Workspaces](./workspaces.md).

## Approve or reject a change

When you ask for a change, such as creating an application, releasing a build, creating a load balancer, installing a module or deleting something, the assistant does not do it straight away. It shows the change in the chat, marked **Waiting for your approval**.

1. Read what it is about to do.
2. Press **Approve** to run it, or **Reject** to cancel it.

| Status                         | Meaning                                         |
| ------------------------------ | ----------------------------------------------- |
| Waiting for your approval      | Nothing has changed yet                         |
| Approved and started           | dPanel started the change; follow it in the app |
| Rejected; nothing was changed  | The proposal was dropped                        |
| Approved, but it did not start | dPanel refused the change; the chat says why    |

Your role still applies: the assistant cannot do anything your account is not allowed to do. See [Members and roles](../teams/members-and-roles.md).

## Start over

Press **New conversation** at the top of the panel. dPanel remembers your last conversation per workspace in this browser, so closing the panel does not lose it.

## Frequently asked questions

### Can the assistant change my servers without asking?

No. Every change it proposes waits for you to press **Approve** in the chat. Questions are answered by reading dPanel only.

### Can it see other workspaces or other people's data?

No. It works in your current workspace, with your own access, exactly like the pages you open yourself.

### Why does the panel say the assistant isn't available yet?

dPanel could not reach the assistant service. Press **Check again** after a moment. If you are signed out, the panel asks you to **Sign in** first.
