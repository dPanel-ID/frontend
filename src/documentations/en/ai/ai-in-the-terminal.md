---
title: Use AI in the terminal
description: Install the dnocs command-line tool, sign in, and talk to the dPanel AI assistant from a terminal with dnocs ai chat and dnocs ai approve.
sidebar_position: 6
sidebar_icon: terminal
sidebar_label: AI in the terminal
---

The dPanel AI assistant also works from a terminal through **dnocs**, the dPanel command-line tool. `dnocs ai chat` sends a message and prints the answer; `dnocs ai approve` approves or rejects a change it proposed. It is the same assistant as **Ask dPanel** in the web app, with the same rules: questions run at once, changes wait for your approval.

Use it when you prefer the keyboard, or when you want a script or your own AI coding agent to work with dPanel. See [Use your own AI agent](./your-own-ai-agent.md).

## Install dnocs

dnocs is a single file for macOS and Linux, on Intel/AMD (`amd64`) and Apple Silicon or ARM (`arm64`) machines. One command installs the newest version.

1. Open a terminal.
2. Run the installer:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | sh
   ```

3. Check that it works: `dnocs --help` lists the commands.

The installer picks the right file for your machine, checks it against the published checksum and puts it in `/usr/local/bin`. It asks for your password only if it needs administrator access to write there. Without that access, it installs to `~/.local/bin` and tells you how to add that folder to your path.

Run the same command again at any time to update to the newest version.

To install a specific version, or into another folder, set these before `sh`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | DNOCS_VERSION=v0.1.20 DNOCS_INSTALL_DIR="$HOME/bin" sh
```

You can [read the installer](https://dnocs.devetek.app/installer.sh) before you run it. Every version is published at [github.com/dPanel-ID/artifacts](https://github.com/dPanel-ID/artifacts/tree/main/cli).

## Sign in and pick a workspace

1. Sign in with your dPanel username. dnocs asks for your password without showing it:

   ```bash
   dnocs auth login -u your-username
   ```

2. Check who you are: `dnocs auth info`.
3. List your workspaces and choose one. Everything after this happens in that workspace:

   ```bash
   dnocs workspace list
   dnocs workspace set --id 5209311491061018854
   ```

   `dnocs workspace reset` goes back to your personal workspace.

## Ask a question

```bash
dnocs ai chat "Which load balancers do I have, and which engine does each use?"
```

dnocs prints **Asking the dPanel assistant…**, then the answer, the tools it used after **Checked:**, and the conversation ID:

```text
You have 2 load balancers, both using the Caddy engine:
| ID | Name | Domain           | Server     | Status |
| 31 | shop | shop.example.com | web-1 (145) | ready  |
| 46 | blog | blog.example.com | web-1 (145) | ready  |
Checked: loadbalancer_list
Conversation: aic_dbltova0ehgehnm7fvhg
```

To ask a follow-up in the same conversation, pass that ID:

```bash
dnocs ai chat --conversation aic_dbltova0ehgehnm7fvhg "and which of them use Cloudflare proxying?"
```

Without `--conversation`, every `dnocs ai chat` starts a new conversation.

## Approve or reject a change

When you ask for a change, the answer ends with the card's details and the two commands you can run:

```text
Waiting for your approval: aipa_dbltp7i0ehgehnm7g01g
  Add a firewall rule on server 145: allow port 8080/tcp from any. It is stored only; the server changes when the firewall is applied.
  approve: dnocs ai approve aipa_dbltp7i0ehgehnm7g01g
  reject:  dnocs ai approve --reject aipa_dbltp7i0ehgehnm7g01g
Conversation: aic_dbltp6q0ehgehnm7fvug
```

- **Approve:** `dnocs ai approve aipa_…`. The change runs once, exactly as proposed, with your session. The assistant then reports the outcome, and may propose the next step.
- **Reject:** `dnocs ai approve --reject aipa_…`. It prints `rejected` and nothing changes.

### Secrets in the terminal

- **Secrets you type:** when a change needs a value only you know, `dnocs ai approve` asks for each one without showing what you type, for example `WORDPRESS_DB_PASSWORD (runtime): `. In a script, pipe one value per line: `printf '%s\n' "$DB_PASSWORD" | dnocs ai approve aipa_…`.
- **Generated secrets:** a generated password is printed once, under **Generated secrets, shown only this once. Save them now:**. dPanel keeps no copy.

## Follow the jobs

Approving starts a job and returns at once. Follow it with:

```bash
dnocs execution list --server-id 145 --limit 3
```

Run it again until the job says `succeeded` or `failed`. If it failed, ask the assistant why: `dnocs ai chat "Why did the last job on server 145 fail?"`.

## Other dnocs commands

dnocs does much more than chat. `dnocs --help` lists every command, and `dnocs <command> --help` explains one. A few you will meet in these docs:

| Command                   | What it does                                         |
| ------------------------- | ---------------------------------------------------- |
| `sudo dnocs machine register` | Connects the machine you run it on, with the dPanel agent. See [Connect a server with the dPanel agent](../servers/register-a-private-machine.md) |
| `dnocs server create-cloud` | Launches a cloud server. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md#from-the-terminal) |
| `dnocs server list`       | Your servers                                         |
| `dnocs server setup`      | Runs server setup again                              |
| `dnocs server firewall`   | Shows and changes a server's firewall                |
| `dnocs module list`       | Software you can install on a server                 |
| `dnocs application list`  | Your applications                                    |
| `dnocs load-balancer log` | The requests a load balancer served                  |
| `dnocs cluster kinds`     | The Kubernetes engines and versions you can use      |
| `dnocs worker list`       | Whether the workspace uses shared or private workers |
| `dnocs domain record`     | Lists, adds, changes and deletes DNS records         |
| `dnocs server user`       | Lists, adds and removes a server's Linux users       |
| `dnocs service-account`   | Manages logins for scripts and AI agents             |
| `dnocs module adopt`      | Records a MariaDB that is already on a server        |

## Frequently asked questions

### Does dnocs work on Windows?

There is no Windows build. Use it in WSL (Windows Subsystem for Linux) with the Linux file.

### I sign in to dPanel with Google. Can I use dnocs?

`dnocs auth login` signs in with a dPanel username or email and a password; it has no Google sign-in.

### Are terminal and web conversations shared?

They are the same kind of conversation, stored by dPanel for your account and workspace. The web panel shows the last conversation you had in that browser, and a terminal conversation continues with `--conversation`. You can approve a card from the web panel in the terminal with its action ID, as the same user in the same workspace.
