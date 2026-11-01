---
title: Connect over SSH
description: Open an SSH terminal to your server in the browser with dPanel, or connect from your own machine with ssh and your own public key.
sidebar_position: 7
sidebar_icon: square-terminal
---

dPanel gives you an SSH terminal in the browser: press **Open terminal** at the top of a server page, and dPanel signs in with the key it holds and opens a shell. Most of the time you won't need one, because the tabs cover services, users, files and logs.

![A shell session on the server, inside the browser](../../assets/servers/server-terminal.webp)

You install nothing on your computer, and you don't need the private key. The session belongs to the login user dPanel set up. The server header shows it, for example `dpanel@203.0.113.10:22`.

| Provider                         | Login user                     |
| -------------------------------- | ------------------------------ |
| Google Cloud, AWS, Tencent Cloud | `ubuntu`                       |
| Alibaba Cloud                    | `root`                         |
| DigitalOcean, IDCloudHost        | `dpanel`                       |
| A server you connected           | The **Linux user** you entered |

## From your own machine

If you prefer your own terminal, connect with any SSH client using the login in the server header.

```bash
ssh ubuntu@203.0.113.10
```

For that to work, your computer's own public key has to be on the server. The key dPanel generated stays inside dPanel. Add yours to the server's `authorized_keys`, through the browser terminal or the file manager.

```bash
echo "ssh-ed25519 AAAA... you@example.com" >> ~/.ssh/authorized_keys
```

Paste your own public key in place of the example. On your machine it is usually `~/.ssh/id_ed25519.pub`.
