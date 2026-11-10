---
title: Delete a server
description: Delete a server you no longer need in dPanel: what it destroys at your cloud provider, and why a server you connected yourself keeps running.
sidebar_position: 9
sidebar_icon: trash-2
---

Deleting a server in dPanel destroys a cloud VM at your provider, or only disconnects a server you connected yourself. Your provider bills a cloud machine for as long as it exists, so remove one as soon as you are done with it.

## What you need first

Deletion is refused while applications or load balancers still use the server. Delete those first:

- [Delete an application](../applications/update-or-delete.md)
- [Load balancers](../networking/load-balancers.md)

## Delete it

1. Open the server and go to **Settings**.
2. In **Danger zone**, press **Delete server**. The same command is in the header, under **More actions** (⋯).
3. Read **What happens**.
4. Type the server's name to confirm, then press **Delete server**.

![The Delete server dialog, listing what happens and asking for the server name](../../assets/servers/server-delete.webp)

:::danger[This cannot be undone]
For a server dPanel launched, deleting uninstalls the agent and destroys the machine at your cloud provider, with its disk and everything on it. For a server you connected yourself, dPanel removes its agent and forgets the server. Your machine and your data stay.
:::

## What happens next

The server shows **Deleting** while the provider tears the machine down, then reads **Deleted**.

Check two places:

1. The **Servers** list.
2. Your provider's own console. dPanel reports what the provider told it, so a delete that half fails at the provider shows up there.

## Remove a server dPanel can no longer reach

Sometimes a server is gone before you delete it in dPanel: you deleted the VM at your provider yourself, the machine died, or it was switched off for good. dPanel then cannot clean up its applications and load balancers on the machine, so a normal delete is refused.

In that case **Delete server** offers **Remove from dPanel** instead. It shows when the agent last reported and what will be removed:

- the server, with its deployments, builds and load balancers in dPanel;
- its unfinished jobs, which are stopped;
- the DNS records dPanel created for its load balancers.

Nothing on the machine is changed or deleted, and removing a server here never deletes a VM at your provider. Tick **I understand that this only removes the records from dPanel** and press **Remove from dPanel**. For a cloud server whose provider dPanel cannot check, it also asks you to tick that you already deleted the VM at your provider. Check your provider's console first, so you do not keep paying for a VM you can no longer see in dPanel.

From the terminal:

```bash
dnocs server delete --id <server id> --forget
```

Add `--vm-deleted` when dPanel asks you to confirm that you deleted the cloud VM at the provider.

### If the server comes back

dPanel cannot know whether a machine is gone for good or only down for a while. If a removed server starts again, its agent is refused and goes quiet; nothing on the machine changes, and its applications keep running. A notice on **Servers**, such as **1 removed server came back**, lists it with the commands below. Then either:

- run `sudo dnocs machine register` on it to manage it in dPanel again, or
- stop its agent with `sudo systemctl disable --now dpanel-agent`.

## Frequently asked questions

### Why is Delete server refused?

Applications or load balancers still use the server, or it is a node of a Kubernetes cluster. Delete those first, or uninstall and delete the cluster. See [Server groups and clusters](../clusters/overview.md).

### Delete server says the server cannot be reached. What now?

The machine is off or gone. If it is only down, start it again and wait for the agent to report, then delete it normally. If it is gone for good, use **Remove from dPanel**. See [Remove a server dPanel can no longer reach](#remove-a-server-dpanel-can-no-longer-reach).

### Can I get a deleted server back?

No. A cloud server's disk is destroyed at the provider. Back up anything you need before you delete it.

### Does deleting a server I connected myself wipe it?

No. dPanel removes its agent and forgets it; the machine, your applications and their data stay.
