---
title: 'Delete a server'
description: 'Stop paying for a machine you have finished with.'
sidebar_position: 8
---

A cloud machine is billed by your provider for as long as it exists, so remove one as soon as you are finished with it. Open the server, go to Settings, and look at the danger zone.

![The delete dialog, listing what happens and asking for the server name](../../assets/servers/server-delete.png 'The dialog lists what will happen and asks you to type the name to confirm.')

:::danger[This cannot be undone]
For a server dPanel created, deleting removes it from dPanel and destroys the machine at your cloud provider, with everything on it. For a server you connected yourself, dPanel only forgets it and your machine keeps running.
:::

Deletion is refused while applications or load balancers still use the server, so remove those first. The row then shows Deleting while the provider tears the machine down, and disappears from the list.

## Checking that it is gone

The Servers list is the first check. The second is your provider's own console: dPanel reports what the provider told it, so a delete that half fails at the provider shows up there.
