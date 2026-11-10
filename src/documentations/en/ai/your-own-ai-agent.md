---
title: Use your own AI agent
description: Let Claude Code, Cursor, Codex or another AI coding agent operate dPanel safely through the dnocs CLI and the dPanel assistant, and read the docs from llms.txt.
sidebar_position: 7
sidebar_icon: bot
sidebar_label: Your own AI agent
---

If you already work with an AI coding agent, such as Claude Code, Cursor, Codex or GitHub Copilot, it can operate dPanel for you through **dnocs**, the dPanel command-line tool. The agent talks to the dPanel assistant with `dnocs ai chat`, and every change still goes through an approval with `dnocs ai approve`. It can also read this documentation from `llms.txt` and `llms-full.txt`.

## How it works

1. You install dnocs and sign in yourself. See [Use AI in the terminal](./ai-in-the-terminal.md).
2. You tell your agent how to use dPanel (the instructions below).
3. The agent asks the dPanel assistant for what you want, for example "Deploy my repository to server 145 and put it on shop.example.com".
4. The dPanel assistant proposes each change with an action ID (`aipa_…`).
5. The change runs only when `dnocs ai approve <action-id>` is run.

The agent never calls the dPanel API or your cloud provider directly, and never changes a server by hand. Everything goes through the dPanel assistant, so every change is proposed, approved and recorded the same way as in the web app. That rule is a request to your agent, not something dPanel enforces: a signed-in session can also run other dnocs commands, with no approval step. For a hard limit, give the agent a [service account](../teams/service-accounts.md) with a small role.

:::warning[Decide who approves]
The agent runs commands as you, with your dPanel session. If it may run `dnocs ai approve` itself, it can approve changes on your behalf. Tell it to show you each proposal and wait for your "yes" before approving, or run the approve commands yourself. Approve deletes and paid resources, such as new cloud servers, only after you have read them.

:::tip[Limit what the agent can do]
For an agent that runs without you watching, create a [service account](../teams/service-accounts.md) with the smallest role that works, and give the agent its token through `DNOCS_TOKEN`. You can revoke it at any moment, and it never gets your own access.
:::
:::

## Give your agent the instructions

Paste this into your agent's instructions file, such as `AGENTS.md`, `CLAUDE.md` or the Cursor rules, or into the chat:

```markdown
## dPanel

dPanel (https://dnocs.devetek.app) runs my servers, applications, databases, domains and load balancers.
Operate it only through the dnocs CLI and its assistant:

- `dnocs ai chat "<request>"` asks the dPanel assistant. Give it IDs and names. It reads what it needs
  and, for any change, proposes it and prints an action id (aipa\_…). Nothing changes yet.
- `dnocs ai chat --conversation <aic_id> "<request>"` continues the same conversation.
- `dnocs ai approve <aipa_id>` runs one proposed change, exactly as proposed. `--reject` declines it.
  Show me each proposal and wait for my explicit yes before approving.
- Approve one change at a time. Follow its job with `dnocs execution list --server-id <id> --limit 3`
  until it says succeeded or failed; if it failed, ask the assistant why.
- Never call the dPanel API or a cloud provider directly, never change a server by hand, and never put a
  password, token or key in a chat message. Secrets I must supply are prompted by `dnocs ai approve`;
  generated secrets are printed once by `dnocs ai approve`: hand them to me immediately.
- Do not choose ports: dPanel picks a free one. For an app without a .devetek definition, tell the
  assistant the language and version, build commands and start command.
- How-to questions: read https://dnocs.devetek.app/llms.txt and the pages it links to.
```

## Good requests to give your agent

- "Using dPanel, deploy this repository to server 145 and give it the domain shop.example.com with HTTPS."
- "Using dPanel, find out why the last deploy of application Shop failed and propose a fix."
- "Using dPanel, create a PostgreSQL database for this app on server 145 and set the app's database variables."
- "Using dPanel, open port 8080 on server 145 for the staging API."

More requests in the [prompt cookbook](./prompt-cookbook.md).

## Docs for AI: llms.txt and llms-full.txt

The dPanel documentation is published in two plain-text files that AI tools can read:

| File                                                     | What it holds                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [llms.txt](https://dnocs.devetek.app/llms.txt)           | A short index: every documentation page with its title, link and one-line description |
| [llms-full.txt](https://dnocs.devetek.app/llms-full.txt) | The whole English documentation as Markdown, page after page                          |

Point your agent or chatbot at `llms.txt` to find the right page, or give it `llms-full.txt` to answer from everything at once. The dPanel assistant itself answers how-to questions from `llms-full.txt`.

## Frequently asked questions

### Does my agent need its own dPanel account?

No. It uses the dnocs session you signed in with, so it works with your access and your role. Anything it approves runs as you.

### Can my agent skip the approval step?

Not in dPanel: every change still needs `dnocs ai approve`. But an agent that is allowed to run commands can run that command itself, so tell it to wait for your yes, as in the instructions above.

### Can I give the agent my browser session instead of signing in?

Sign in with `dnocs auth login` yourself instead. A session is as powerful as your password; keep it out of chats, files you share, and screenshots.

### Which agents work?

Any agent that can run terminal commands, such as Claude Code, Cursor, Codex, Gemini CLI or GitHub Copilot in agent mode.
