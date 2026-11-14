---
title: AI limits and privacy
description: What the dPanel AI assistant can see and store, what it hides, where your messages go, its limits, and what to do when Ask dPanel is busy or unavailable.
sidebar_position: 8
sidebar_icon: key-round
sidebar_label: Limits and privacy
---

**Ask dPanel**, the dPanel AI assistant, works only inside dPanel, with your own access, in your current workspace. It never sees your passwords, tokens, keys or environment variable values. Your messages, and what the assistant reads to answer them, are sent to an AI model service to produce the answer, so never type a secret in the chat.

## What the assistant can see

- **Only your current workspace.** Switch workspace to ask about another one.
- **Only what your account can see.** It reads dPanel as you, through the same access as the pages you open.
- **Names, not secrets.** dPanel removes passwords, tokens, keys, cookies and credentials from everything before the assistant reads it, and shows it the names of environment variables but never their values.
- **Not your databases' data.** It cannot run SQL or read rows.
- **Not your servers directly.** It has no shell and no SSH access; it reads what dPanel and the dPanel agent report, such as logs and usage.
- **This documentation.** It answers how-to questions from the published dPanel docs.

## Where your messages go

1. Your message goes to dPanel.
2. dPanel sends it, with the conversation so far and the results of what the assistant reads, to an AI model service that writes the answer. Secrets are removed first, as above.
3. dPanel stores the conversation, so you can reopen it, and a record of every tool the assistant used, which is linked to the workspace's audit history.

That is why the rule is simple: **never type a password, token or key in the chat**. If you did, treat that value as exposed and change it. The assistant will not repeat or use it, and asks you to type it on the approval card instead. See [Approve or reject changes](./approvals-and-secrets.md#secrets-you-type).

Outside the chat, dPanel stores the secrets you give it encrypted and masks variable values on screen. See [Security and your data](../getting-started/security-and-your-data.md).

## Who can see your conversations

- **You.** A conversation belongs to the person who started it, in the workspace it was started in.
- **Not your teammates.** They cannot open your conversations or approve your cards.
- **Your changes are visible as usual.** An approved change runs as an ordinary dPanel job, so it appears in the workspace's activity and audit history, like a change made from the pages.

Your browser remembers which conversation was last open for each workspace, so the panel can show it again. Press **New conversation** to start a clean one.

## Limits

| Limit                                | What it means                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Only dPanel topics                   | Questions about anything else get "I can only help with dPanel"                                            |
| Approval cards expire after 24 hours | Ask again to get a fresh card                                                                              |
| One job at a time per server         | Approve changes to the same server one by one                                                              |
| It checks a long job once            | After a deploy or install, ask again for progress                                                          |
| Prices are estimates                 | Cloud server prices come from general public price knowledge, not from your provider's bill                |
| Not everything is in chat yet        | For example adding DNS records by hand, managing team members and connecting cloud accounts: use the pages |
| Very broad requests                  | A request that needs too many steps stops; ask about one thing at a time                                   |

The assistant can make mistakes. Read every card before you approve it, and check important answers against the page in dPanel; every answer gives IDs and names so you can.

## When the assistant is busy or unavailable

| Message                                                                     | What to do                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **The assistant isn't available yet**                                       | dPanel could not reach the assistant. Press **Check again** in a moment |
| **Sign in to use the assistant**                                            | Press **Sign in**; your session has ended                               |
| The assistant is busy right now. Please try again in a minute.              | Too many requests at once. Wait a minute and press **Try again**        |
| The AI model is unavailable right now. Please try again later.              | The AI model service is down. Try again later, or use the pages         |
| The assistant took too long to answer. Please try again.                    | Press **Try again**, or ask a narrower question                         |
| That request needed too many steps. Please ask for something more specific. | Split the request, and name the server or application                   |

Everything the assistant does, you can also do from the pages of dPanel or with the dnocs command-line tool, so you are never stuck when it is down.

## Frequently asked questions

### Does dPanel train an AI model on my conversations?

dPanel stores your conversation so you can reopen it and so approved changes can be audited; it has no feature that trains a model on it. The AI model service receives each request to write the answer. Because the messages leave dPanel, keep secrets out of them.

### Can I delete a conversation?

There is no delete button yet. **New conversation** starts a clean one, and the old one is no longer shown in your browser.

### Can the assistant see my environment variable values?

No. It sees variable names only. A secret value you type on an approval card goes with your approval straight to dPanel, which stores it encrypted. See [Security and your data](../getting-started/security-and-your-data.md).

### Is the assistant available in my personal workspace?

Yes. It works in your personal workspace and in every team workspace you belong to, each with its own conversations.
