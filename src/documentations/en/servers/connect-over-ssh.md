---
title: Connect over SSH
description: Open a terminal to your server in the browser with dPanel, or connect from your own machine with ssh and your own public key.
sidebar_position: 7
sidebar_icon: square-terminal
---

dPanel gives you a terminal in the browser: press **Open terminal** at the top of a server page and a shell opens. Most of the time you won't need one, because the tabs cover services, users, files and logs.

- On a server connected with the [dPanel agent](./register-a-private-machine.md), the terminal is relayed through the agent. It opens a root shell, with no SSH and no key at all.
- On a server connected over SSH, dPanel signs in with the SSH key it holds.

This page is about terminals. To choose how a server joins dPanel, see [dPanel agent or SSH: which one?](./register-a-private-machine.md#dpanel-agent-or-ssh-which-one).

![A shell session on the server, inside the browser](../../assets/servers/server-terminal.webp)

You install nothing on your computer, and you don't need a private key. On a server connected over SSH, the session belongs to the login user dPanel set up. The server header shows it, for example `dpanel@203.0.113.10:22`.

| Server                                   | Login user                     |
| ---------------------------------------- | ------------------------------ |
| Connected with the dPanel agent          | `root`, through the agent      |
| Google Cloud, AWS, Tencent Cloud (SSH)   | `ubuntu`                       |
| Alibaba Cloud                            | `root`                         |
| DigitalOcean, IDCloudHost (SSH)          | `dpanel`                       |
| A server you connected over SSH          | The **Linux user** you entered |

## From your own machine

If you prefer your own terminal, connect with any SSH client. This needs the server's address to be reachable from your computer: a public IP, or your own network for a home server. Use the login in the server header, or on a server connected with the agent, your own Linux user.

```bash
ssh ubuntu@203.0.113.10
```

For that to work, your computer's own public key has to be on the server. The key dPanel generated stays inside dPanel. Add yours to the server's `authorized_keys`, through the browser terminal or the file manager.

```bash
echo "ssh-ed25519 AAAA... you@example.com" >> ~/.ssh/authorized_keys
```

Paste your own public key in place of the example. On your machine it is usually `~/.ssh/id_ed25519.pub`.

## Frequently asked questions

### Do I need to install anything to use the browser terminal?

No. **Open terminal** works in the browser, through the agent or with the key dPanel holds.

### Can I run commands as root?

The login user can use `sudo`, so start a command with `sudo` when it needs administrator rights.

### Why does `ssh` from my computer say permission denied?

Your computer's public key is not on the server yet. Add it to `~/.ssh/authorized_keys` as shown above, as the same login user.

### Is there a terminal command instead of the browser?

`dnocs server exec` runs a shell script on a server through dPanel. See [AI in the terminal](../ai/ai-in-the-terminal.md) to install `dnocs`.
