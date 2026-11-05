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

dnocs is a single file for macOS and Linux, on Intel/AMD (`amd64`) and Apple Silicon or ARM (`arm64`) machines. It is published at [github.com/dPanel-ID/artifacts](https://github.com/dPanel-ID/artifacts/tree/main/cli), one folder per version, and the file `cli/LATEST` names the newest version.

1. Open a terminal.
2. Download the newest version for your machine:

   ```bash
   VERSION=$(curl -fsSL https://raw.githubusercontent.com/dPanel-ID/artifacts/main/cli/LATEST)
   OS=$(uname -s | tr '[:upper:]' '[:lower:]')
   ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')
   curl -fsSLo dnocs "https://raw.githubusercontent.com/dPanel-ID/artifacts/main/cli/$VERSION/dpanelprod-cli-$OS-$ARCH"
   ```

3. Make it runnable and put it on your path:

   ```bash
   chmod +x dnocs
   sudo mv dnocs /usr/local/bin/dnocs
   ```

4. Check that it works: `dnocs --help` lists the commands.

Each version folder also holds a `SHA256SUMS` file, if you want to check the download's checksum.

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
| `dnocs server list`       | Your servers                                         |
| `dnocs server setup`      | Runs server setup again                              |
| `dnocs server firewall`   | Shows and changes a server's firewall                |
| `dnocs module list`       | Software you can install on a server                 |
| `dnocs application list`  | Your applications                                    |
| `dnocs load-balancer log` | The requests a load balancer served                  |
| `dnocs cluster kinds`     | The Kubernetes engines and versions you can use      |
| `dnocs worker list`       | Whether the workspace uses shared or private workers |

## Frequently asked questions

### Does dnocs work on Windows?

There is no Windows build. Use it in WSL (Windows Subsystem for Linux) with the Linux file.

### I sign in to dPanel with Google. Can I use dnocs?

`dnocs auth login` signs in with a dPanel username or email and a password; it has no Google sign-in.

### Are terminal and web conversations shared?

They are the same kind of conversation, stored by dPanel for your account and workspace. The web panel shows the last conversation you had in that browser, and a terminal conversation continues with `--conversation`. You can approve a card from the web panel in the terminal with its action ID, as the same user in the same workspace.
