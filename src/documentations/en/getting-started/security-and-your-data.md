---
title: Security and your data
description: Where your code, databases, secrets and logs live when you use dPanel, how each is protected, what goes to outside services, and what you control.
sidebar_position: 7
sidebar_icon: shield-check
sidebar_label: Security and your data
---

This page explains, in plain words first and exact detail after, where your things live when you use dPanel and how they are protected. The short version:

- **Your code, your databases and your files stay on your servers.** dPanel never stores your source code, your builds or the rows in your databases.
- **dPanel keeps what it needs to manage your servers**: your account, settings, a history of every job, and your secrets, which it seals.
- **Outside services only get what the job needs**: your cloud provider, GitHub, your DNS provider, an AI model service for the assistant, and Let's Encrypt.

## How dPanel reaches your server

A small program, the **dPanel agent**, runs on each server as the `dpanel-agent` service. It opens the connection to dPanel itself, over an encrypted WebSocket, so your server needs **no open port** for dPanel.

- **Who it is:** each server gets its own credential when it joins, exchanged for the one-time code in its install command. A credential works for that server only.
- **What it reports:** a heartbeat every 30 seconds with CPU, memory and disk use, the modules it runs, and the system and app logs under `/var/log` and the journal (see [Logs](#logs)).
- **What dPanel can ask it to do:** install and remove modules, build and deploy your applications, start and stop services, read and change files, add Linux users, reboot, and update itself. Each change is a job that shows in your activity history.
- **What it does not do:** it does not accept incoming connections, and it does not run free-form shell commands sent by dPanel.
- **The browser terminal:** when the terminal is turned on for a server, people in your workspace with access to that server can open a root shell on it from the web app or with `dnocs server exec`. The session is relayed through dPanel to the agent and closes after an hour without input.

Servers you connected over SSH instead work differently: dPanel's workers sign in with the SSH key you gave dPanel. See [Connect over SSH](../servers/connect-over-ssh.md).

## Your code and builds

When you deploy, **your server** downloads your code straight from GitHub and builds it there. The download uses a short-lived token that can only **read** that one repository. The build and every release stay in the application's folder on your server; dPanel stores only details such as the commit, the branch and whether the build worked. See [Connect GitHub](./connect-github.md).

## Your databases

MariaDB, PostgreSQL, MongoDB and Redis run on your server, and their data stays there.

- Passwords you set when installing a database are stored **only on the server**. dPanel keeps a hidden placeholder in its records, not the password.
- dPanel reads rows only while **you** have the database tool open, through an access grant that lasts 15 minutes. The database password you type there is not stored.
- Databases listen on `127.0.0.1` by default, so they are not reachable from the internet unless you choose another address. Redis also asks for a password when it listens on the network.

## Secrets: app variables, tokens and keys

| What                                             | Where it is kept                 | How it is protected                                                                                                                                                                                       |
| ------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application build and runtime variables          | dPanel's database                | Sealed with AES-256-GCM under a key kept outside dPanel's code, which can be rotated. Shown masked in the web app, the CLI and the API.                                                                   |
| The same variables on your server                | `/etc/dpanel/apps/<service>.env` | Owned by `root`, mode `0600`, in a `0700` folder. The service unit only points to the file, so `systemctl show` reveals nothing. Build variables come from a `0600` file that is removed after the build. |
| Sign-in tokens (your dPanel and GitHub sessions) | dPanel's database                | Sealed the same way.                                                                                                                                                                                      |
| Cloud and DNS provider keys                      | dPanel's database                | Encrypted with a key kept outside the database, and never sent back to a browser. See [Cloud credentials and security](../servers/cloud-providers/cloud-credentials-security.md).                         |
| Passwords inside a running job                   | dPanel's job queue               | Sealed while the job waits. The job's copy is deleted 7 days after it finishes; the activity record of what ran stays, without secrets.                                                                   |

**Seeing a value again.** People who may change an application can press **Show values** on its variables, or run `dnocs application env list --show-values`. Every reveal is recorded with who did it. Everyone else sees only the names.

**What never happens:** build logs list variable **names** only, never values; database passwords never appear on a command line; and passwords are never written into the Ansible files dPanel keeps for you.

## Logs

The agent sends your servers' system and app logs to dPanel so you can read them in the web app and the CLI.

- **Masked first:** before a line leaves your server, the agent hides passwords, tokens, cookies, `Authorization` headers, JWTs and private keys.
- **Kept 3 days:** after that, dPanel deletes them. For an application's older lines, `dnocs application logs --raw` reads up to 10 days straight from the server's own journal, unmasked, for one server at a time.
- Logs can still contain other details, such as visitors' IP addresses in access logs and usernames in `auth.log`.

See [Reading logs](../logs/reading-logs.md).

## What dPanel keeps about you

- **Your account:** your email address and username, from the sign-in service.
- **Your workspaces:** members and roles, servers, applications, load balancers, domains and their settings.
- **History:** every job, with who started it, when, how long it took and which step failed, so you and your team can see what changed.
- **Ask dPanel conversations**, so you can reopen them. See [AI limits and privacy](../ai/limits-and-privacy.md).

Your public profile, if you use one, shows your name and username, never your email. See [Public profiles](../teams/public-profiles.md).

## Outside services

dPanel sends data to these services only to do what you asked:

| Service                                                                                          | What it receives                                                                      | Why                                                        |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Your cloud provider (AWS, Google Cloud, DigitalOcean, IDCloudHost, Biznet Gio, Alibaba Cloud, Tencent Cloud) | Requests made with the key you connected                                              | To create and delete your VMs                              |
| GitHub                                                                                           | Requests made with dPanel's GitHub App and your sign-in                               | To list your repositories and let your server download one |
| Your DNS provider (Cloudflare, DigitalOcean)                                                     | Records for your domain                                                               | To point your domain at your server                        |
| An AI model service                                                                              | Your Ask dPanel messages and what the assistant reads to answer, with secrets removed | To write the assistant's answers                           |
| Let's Encrypt                                                                                    | Your domain name                                                                      | To issue its HTTPS certificate                             |

Your visitors connect to **your** server, not to dPanel.

## What you control

- **Remove access at once.** Removing a member from a workspace, or lowering their role, takes effect on their next request. See [Members and roles](../teams/members-and-roles.md).
- **Give automation its own token.** Service accounts have their own tokens that you can revoke on their own. See [Service accounts](../teams/service-accounts.md).
- **Limit and rotate cloud keys.** Give dPanel a key that can only manage VMs, and replace it whenever you like. See [Cloud credentials and security](../servers/cloud-providers/cloud-credentials-security.md).
- **Run jobs on your own machines.** Private workers run your workspace's jobs on a GitHub workflow or a VM of yours. See [Workers](../workers/overview.md).
- **Keep your infrastructure.** Everything dPanel sets up is written as Ansible, and your servers stay ordinary Ubuntu or Debian machines with systemd services, so you can keep running them without dPanel.

## Frequently asked questions

### Does dPanel read my database?

Only through the database tool, while a signed-in person with access to that server has it open. Nothing reads your data in the background.

### Can people in my workspace see my app's passwords?

They see the variable names. Only people who may change the application can show the values, and each time they do it is recorded.

### What happens to my data if I stop using dPanel?

Your servers, code, databases and files are yours and keep running. To remove a VM dPanel launched, delete the server in dPanel, which also deletes the VM at your cloud provider. See [Delete a server](../servers/delete-a-server.md).

### Is this a privacy policy?

No. This page describes how the product handles your data, so you can judge it. It is not a legal agreement.
