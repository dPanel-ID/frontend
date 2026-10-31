---
title: 'What a server is here'
description: 'One Linux machine that dPanel looks after for you, and the two ways to add one.'
sidebar_position: 1
---

A server is one Linux machine that dPanel looks after for you. It can be a machine dPanel created in your cloud account, or one you already rent and connect yourself.

Once a server is in dPanel, everything below happens in your browser, with no terminal on your own computer.

- See whether it is healthy, and how much processor, memory and disk it is using.
- Install software on it, such as a database or a language runtime.
- Start and stop the services running on it.
- Manage its Linux user accounts.
- Browse its files and read its logs.
- Open a terminal on it.

## The two ways to add a server

|                  | Launch a cloud server                           | Connect your own server             |
| ---------------- | ----------------------------------------------- | ----------------------------------- |
| Who it suits     | You want a new machine and have a cloud account | You already have a machine running  |
| What dPanel does | Creates the machine, then sets it up            | Connects over SSH, then sets it up  |
| You need         | A cloud project and an SSH key in dPanel        | A reachable Ubuntu or Debian server |
| Time             | About 10 to 20 minutes                          | About 5 minutes                     |

![The create server page, offering a cloud server or your own server](../../assets/servers/create-choose-path.png 'Servers, then Create Server, offers both paths.')

This guide follows the first path, from an empty list to a working database server and back to an empty list again.
