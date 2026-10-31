---
title: Common problems
description: What to do when a server, an application, GitHub or the logs do not behave as expected.
sidebar_position: 1
sidebar_icon: circle-help
---

Each answer starts with what you see, then what to do.

## Servers

### The server page says "Setup did not finish"

The red banner means the provider or the setup stopped with an error. Press **See what happened** to read the reason. The usual causes are a cloud account without enough quota, and credentials that have expired or lack a permission. Each provider's page lists the quotas and permissions to check: see [Cloud providers](../servers/cloud-providers/index.md).

Fix the cause at your provider, then open the server's **Settings** tab and use **Reinstall** under **Setup** to run setup again. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md).

### I cannot delete a server

Deletion is refused while applications or load balancers still use the server. Delete or move those first, then try again. See [Delete a server](../servers/delete-a-server.md).

### The dashboard says "No contact" with a server

The dPanel agent on that server has not reported in for a while. The server may be off, overloaded or out of network. Open it from **Needs your attention** with **Open server** and check whether it is reachable.

## Applications

### I pressed Deploy application and nothing happened

Check the **Application name**. It may only contain letters, numbers and spaces. A name such as `my-app` or `my_app` is refused; the field shows an error under it. Use `My App` instead and deploy again.

### "Port … is already used on this server"

Another service already listens on that port. Pick a port that is not listed under **Ports already in use**. dPanel suggests a free one between 7000 and 10000 when you start.

### The build stops after about 20 minutes

Every build and deployment job has a time limit of 20 minutes by default. A build that compiles a lot, or a server with little CPU, can hit it.

The limit can be raised per application with `build.timeout` in the application definition, as a duration between `1m` and `3h`:

```yaml
build:
  timeout: 90m
```

The web form does not have this field yet. Set it in the definition file you deploy with the dPanel command-line tool. Otherwise, a larger server shortens the build.

### "GitHub session expired" or "Reconnect GitHub"

GitHub no longer confirms your saved account. Press **Reconnect GitHub** or **Relogin GitHub** and sign in to GitHub again. Your applications keep running in the meantime. See [Connect GitHub](../getting-started/connect-github.md).

### My GitHub organisation is not in the list

Open **GitHub team** in **Create Application** and choose **Add GitHub account**. Install the dnocs-id GitHub App on the organisation, and give it access to the repository.

## Logs

### "This application has no run command or server yet"

Runtime logs come from the running service. An application without a start command, or not yet released to a server, has none. Finish its setup and release it first.

### The logs are empty

Logs only show the time range you picked. Widen the range; the longest is 10 days. If the application was just released, wait a minute and press **Refresh**. See [Reading logs](../logs/reading-logs.md).

## Workspaces and access

### My servers or applications have disappeared

You are probably in a different workspace. Check the workspace name at the top of the sidebar and switch back. See [Workspaces](../getting-started/workspaces.md).

### "You cannot see this workspace's health"

Every member of a workspace can read its execution and agent status. If you still see this, you are probably not a member of the selected workspace: check the workspace switcher, or ask a workspace owner to add you. See [Members and roles](../teams/members-and-roles.md).

## Getting help

Most list pages end with **Help & Support**:

- **Documentation** opens these guides.
- **Chat team** opens a WhatsApp chat with the dPanel team.
- **Email support** writes to the team by email.

When you write, include the name of the server or application, what you pressed, and what you saw.
