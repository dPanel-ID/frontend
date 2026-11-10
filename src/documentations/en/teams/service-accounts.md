---
title: Service accounts
description: Give scripts, CI jobs and AI agents their own dPanel login with a token that can expire and be revoked, without sharing a person's password or session.
sidebar_position: 4
sidebar_icon: key-round
---

A **service account** is a dPanel login for a program instead of a person. Use one when a script, a CI job (an automatic build, such as GitHub Actions) or an AI agent has to work with dPanel. It signs in with a **token**, a long secret string that works like a password for that one program.

Why not use your own login? Your session expires after 7 days, it can do everything you can, and it stops working if you leave the team. A service account keeps working, has only the access you give it, and can be switched off without touching anyone else.

## Personal or team

Where you create the account decides what it can reach.

|                       | In a team                                          | Personal                              |
| --------------------- | -------------------------------------------------- | ------------------------------------- |
| Create it in          | **Teams**, open the team, **Service accounts** tab | **Profile**, **Service accounts** tab |
| Who manages it        | Team owners and admins                             | You                                   |
| Who it acts as        | Itself, with its own identity                      | You                                   |
| What it reaches       | That team's workspace, limited by its role         | Your personal workspace only          |
| Linux user on servers | Its own, if you add one                            | Yours                                 |

Choose a team account for anything shared. It keeps working when people come and go.

## Create one

1. Open the **Service accounts** tab of your team or your profile.
2. Press **New service account**.
3. Enter a **Name** that says what uses it, such as `github-actions`, and an optional **Description**.
4. For a team, pick a **Role**. Give the smallest role that does the job:

   | Role          | Can do                                                  |
   | ------------- | ------------------------------------------------------- |
   | **Viewer**    | Only read.                                              |
   | **Developer** | Deploy and manage applications.                         |
   | **DevOps**    | Manage servers and infrastructure.                      |
   | **Admin**     | Manage the whole team. Only team owners can grant this. |

5. Name the token after where it will be used, and pick when it **Expires**: in 30 days, 90 days, 1 year, or **Never**. Prefer an expiry.
6. Press **Create**.

You should now see the token on screen. It starts with `dps_`.

:::warning[Copy the token now]
The token is shown once and cannot be shown again, because dPanel keeps only a fingerprint of it. Store it in a password manager or your CI's secret store. Treat it like a password: never put it in code, chat or a log.
:::

## Use the token

With the [dnocs command-line tool](../ai/ai-in-the-terminal.md), set `DNOCS_TOKEN`. Every command then uses the token instead of a signed-in session, so a CI job needs no login step:

```bash
DNOCS_TOKEN=dps_your_token dnocs server list
```

To call the API directly, send the token with each request:

```text
Authorization: Bearer dps_your_token
```

A token already belongs to one workspace, so the workspace you selected with `dnocs workspace set` does not apply to it.

## Replace or stop a token

- **Replace a token without downtime:** press **New token** on the account, switch your script to the new token, then press **Revoke** on the old one. An account can hold 5 active tokens.
- **Stop a token:** press **Revoke**. Anything using it stops working at once, and this cannot be undone.
- **Delete the account:** every token stops working at once. Applications it deployed keep running, but move them to another owner first.

Each token shows its status (**Active**, **Expired** or **Revoked**), its expiry and when it was last used. A token that is never used is a good one to revoke.

## Give it a Linux user on a server

A team service account can have its own Linux user on a server, so what it runs is kept apart from everyone else's files.

1. Open the server, go to **Users** and press **Add user**.
2. Set **Add for** to **Service account** and pick the account.
3. Save.

The Linux username comes from the account. It has no password, so nobody can log in with one. Deleting the service account leaves this Linux user on the server until you remove it; see [Your server page](../servers/your-server-page.md#users).

## From the terminal

`dnocs service-account` (short form `dnocs sa`) manages the accounts of the selected workspace. Add `--workspace personal` for your own.

```bash
dnocs service-account create --name deploy-bot --role developer --expires-days 90
dnocs service-account list
dnocs service-account token create --account-id <account id> --name rotation
dnocs service-account token revoke --account-id <account id> --token-id <token id> --yes
dnocs service-account delete --id <account id> --yes
```

These commands never print a token. dnocs saves it to a new private file (permissions `0600`) under `~/.devetek/service-account-tokens`, or at `--token-file`, and tells you the path.

## What a service account cannot do

A token can never create, change or delete service accounts or tokens, change a profile or password, open a terminal, use the database manager, or reach platform administration. Those always need a person. A user or a team can have up to 20 service accounts.

## Frequently asked questions

### I lost the token. Can I see it again?

No. Press **New token** to make another one, update your script, and revoke the lost one.

### Do I need a service account for an AI agent?

It is the safest way to give an agent access, because you pick its role and can revoke it at any moment. See [Use your own AI agent](../ai/your-own-ai-agent.md).
