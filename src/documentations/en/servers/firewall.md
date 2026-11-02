---
title: Firewall
description: Choose which ports of a server people can reach, review the change, and let dPanel apply it safely.
sidebar_position: 8
sidebar_icon: shield-check
---

A firewall decides which network traffic may reach your server. With it on, only the ports you allow can be reached from the internet; everything else is blocked. dPanel manages the firewall built into Ubuntu (ufw) for you: you keep a list of rules in dPanel, and dPanel applies the whole list to the server at once.

Open it from your server page: **Network** tab, then the **Firewall** tile. If the firewall module is installed, **Modules** also shows **Manage firewall**.

## How it works

1. **Add a rule** for each port people must reach, such as 443 for a website. Nothing changes on the server yet.
2. **Review and apply.** dPanel compares your rules with the firewall on the server and lists what it will add, remove and keep. Apply when it looks right.
3. dPanel runs a job on the server. The view shows **Applying** and refreshes by itself until the job finishes.

:::tip[The first apply installs the firewall]
A server that never had a firewall shows **The firewall module is not installed yet**. The first apply installs it, then sets your rules.
:::

## The status strip

| Item                   | What it tells you                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Firewall**           | **On** or **Off**, and the default for traffic no rule matches (normally: incoming deny, outgoing allow).             |
| **Docker ports**       | Whether Docker rules are enforced. See [Docker ports](#docker-ports).                                                 |
| **Stored and applied** | The version of your rules and the version the server runs. **Changes not applied yet** means you still need to apply. |
| **Last apply**         | The result of the last job, or **Applying** while one runs.                                                           |

**Server differs from dPanel** appears when someone changed the firewall on the server by hand. Review and apply to put your stored rules back.

## Rules

Each rule has an action, a port, a protocol and who may connect.

| Action     | Meaning                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------- |
| **Allow**  | Let the traffic in.                                                                       |
| **Deny**   | Drop it without an answer.                                                                |
| **Reject** | Refuse it and tell the sender.                                                            |
| **Limit**  | Let it in, but block an address that connects too often. Useful for SSH. Host ports only. |

- **Port**: one port (`443`), a range (`8000:8100`), or empty for every port. A range needs TCP or UDP.
- **From**: empty for anyone, or one address (`203.0.113.10`) or network (`10.0.0.0/8`).
- **Note**: a reminder of why the rule exists.

Adding or removing a rule only changes what dPanel stores. The server picks it up on the next apply.

### System and legacy rules

Some rules carry a lock instead of a remove button:

- **System** rules keep dPanel working: SSH (port 22), and ports 80 and 443 on servers that run a dPanel load balancer. They always come first.
- **Legacy** rules were adopted from an older setup and are kept on purpose.

You cannot remove locked rules. Removing other rules on a workspace server needs the workspace admin role; if you lack it, dPanel shows the reason.

## Docker ports

Docker publishes container ports past the normal firewall, so a host rule does not protect them. To control them:

1. Turn on **Docker ports** in the status strip.
2. Add a rule with **This port belongs to a Docker container** turned on, using the container's port.
3. Review and apply.

While Docker filtering is off, Docker rules are stored but have no effect.

## Rules not managed by dPanel

**Not managed by dPanel** lists rules someone added on the server by hand. Applying keeps them. **Adopt** stores them in dPanel so they show up as your rules; it adopts every rule dPanel can represent at once, not only the one you selected. Rules dPanel cannot represent are skipped and left alone.

If this section says the live firewall cannot be read, the firewall module is not installed yet or the server's agent is too old. That is normal before the first apply.

## Safety: SSH and automatic rollback

- SSH always stays open, so dPanel can still reach the server. The review says **SSH stays open** before you apply.
- Turning the firewall on asks you to confirm, because every port without an allow rule is blocked.
- If SSH or the dPanel agent stop working after a change, the server restores its previous firewall by itself within a few minutes, and the job is marked failed.

## Turn the firewall off

**Turn off firewall** queues a job that switches the firewall off, so every port can be reached again. Your rules are kept for the next time you apply.

## See which ports are open

On the **Network** tab, the **Active ports** view has a **Firewall** column: for each port in use it says whether a rule allows it from anywhere, from some addresses only, or not at all. While the firewall is off it adds **Not enforced**.
