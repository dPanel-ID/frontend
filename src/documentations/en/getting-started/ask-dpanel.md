---
title: Ask dPanel (AI assistant)
description: Ask dPanel is the AI assistant built into dPanel. Open it from any page, ask in plain language, and approve the changes it proposes. Start here in two minutes.
sidebar_position: 6
sidebar_icon: sparkles
sidebar_label: Ask dPanel
---

**Ask dPanel** is the AI assistant built into dPanel. Press **Ask dPanel** at the bottom right of any page, ask a question or describe what you want in plain language, and it answers from your workspace and this documentation. Any change it prepares waits on a card until you press **Approve**.

![The dPanel assistant panel open beside the dashboard, with three example questions](../../assets/getting-started/assistant.webp 'The assistant works in your current workspace, with your own access.')

## Start in two minutes

1. Press **Ask dPanel** at the bottom right of any page. The **dPanel assistant** panel opens.
2. Press an example question, such as **Which of my servers are stopped?**, or type your own in **Ask about your servers, apps, domains…**.
3. Press Enter. While it works, the panel says **Checking dPanel…**.
4. Read the answer. **Checked:** under it lists what the assistant looked at.
5. When it proposes a change, read the card marked **Waiting for your approval**, then press **Approve** or **Reject**.

The full walkthrough, with screenshots, is [Your first AI conversation](../ai/first-conversation.md).

## What you can ask

- "How do I connect my own server?" (answered from the docs, with a link)
- "Why is application Shop failing on server 145?"
- "On server 145, create a MariaDB database named wordpress with a user named wp."
- "Put application Shop on shop.example.com with HTTPS."
- "On server 145, allow TCP port 8080 and apply the firewall."

More in the [prompt cookbook](../ai/prompt-cookbook.md).

## Everything about the assistant

The [AI assistant](../ai/overview.md) section covers it in full:

- [What Ask dPanel is](../ai/overview.md): what it can and cannot do, and how it keeps you safe.
- [Approve or reject changes](../ai/approvals-and-secrets.md): reading cards, secrets, and what happens when you close the chat.
- [Diagnose problems with AI](../ai/diagnose-problems.md): let it find why something fails.
- [Use AI in the terminal](../ai/ai-in-the-terminal.md): `dnocs ai chat` and `dnocs ai approve`.
- [Use your own AI agent](../ai/your-own-ai-agent.md): Claude Code, Cursor and others, plus `llms.txt`.
- [AI limits and privacy](../ai/limits-and-privacy.md): what it sees, stores and sends.

## Frequently asked questions

### Can the assistant change my servers without asking?

No. Questions only read. Every change waits for you to press **Approve** on its card.

### Can it see other workspaces or other people's data?

No. It works in your current workspace, with your own access, exactly like the pages you open yourself.

### Should I type passwords in the chat?

Never. Messages go to an AI model service. When a change needs a password, the card gives you a field for it instead. See [Approve or reject changes](../ai/approvals-and-secrets.md).
