---
title: Environment variables
description: Set build-time and runtime environment variables for an app in dPanel, keep secrets out of your repository, and apply new values with a release.
sidebar_position: 3
sidebar_icon: variable
---

dPanel passes environment variables to your application from two separate lists, so a setting only the build needs never reaches the running service, and secrets such as API keys stay out of your Git repository.

An **environment variable** is a named setting, such as `PORT=9307`, that your program reads when it starts instead of having the value written into the code. See the [Glossary](../getting-started/glossary.md).

| List                 | Used                           | Typical contents                       |
| -------------------- | ------------------------------ | -------------------------------------- |
| Build-time variables | Only while the build steps run | `CGO_ENABLED=0`, `NODE_ENV=production` |
| Runtime variables    | By the running service         | A port, a database address, API keys   |

## Set them when you create the application

In step 4, **Environment**, write one variable per line, such as `KEY=value` or `KEY="value"`, in **Build-time variables** or **Runtime variables**. See [Edit many variables at once](#edit-many-variables-at-once) for every form a line can take.

![The Environment step, with one build-time variable and two runtime variables](../../assets/applications/apps-create-environment.webp)

```bash
PORT=9307
APP_ENV=production
```

:::tip[Match the port]
If your code reads its port from a variable, as go-example reads `PORT`, set it to the same value as **Application port** in step 3. Otherwise dPanel and your service expect different ports.
:::

## Change them later

1. Open the application and go to **Settings**.
2. Under **Build** or **Run**, find **Environment variables** and press **Edit**.
3. Add, change or remove variables, then press **Save**. Values you leave untouched keep what is stored, even while they are hidden.
4. Release again with **Build and release** or **Redeploy**, so the service starts with the new values. See [Deployments and rollback](./deployments-and-rollback.md).

You can also change both lists in **Edit settings**, the full form. See [Update or delete an application](./update-or-delete.md).

You can also ask **Ask dPanel** to do this for you; see [Prompt cookbook](../ai/prompt-cookbook.md). Secret values are never typed in the chat: the approval card asks for them, and the assistant only sees the names.

:::note[Restart is not enough]
**Restart** on a release starts the service again with the values it already had on the server. Only a release (**Build and release**, **Redeploy** or a rollback) writes the new values to the server.
:::

## Edit many variables at once

Every place that edits variables has two views, switched with **Per variable** and **Text** above the list. Both edit the same list, so you can switch at any time without losing what you typed.

In **Text**, write one variable per line and press **Save**: a new line adds a variable, a changed line updates it, and a line you delete removes it. This is the quickest way to paste the contents of a `.env` file.

```bash
# Lines starting with # are ignored, and so are empty lines
APP_NAME="My shop"
APP_KEY='base64:abc=='
export LOG_LEVEL=info   # "export" and a comment after the value are fine
MESSAGE="Line one\nLine two"
```

- `KEY_NAME="VALUE"` is the usual form. Inside double quotes, write `\"` for a quote, `\\` for a backslash and `\n` for a line break.
- `KEY=value` without quotes and `'VALUE'` in single quotes also work. Single quotes keep the value exactly as written.
- After a value without quotes, a space followed by `#` starts a comment. A `#` inside a value, as in `COLOR=#fff` or a URL, is kept. Put a value in quotes to keep ` #` in it.
- A name uses letters, digits and underscores, and does not start with a digit.
- A value stays on one line. For a certificate or another value with several lines, write each line break as `\n` inside double quotes.

If a line cannot be read, dPanel lists it under the box with its line number, for example _Line 12: missing "="_, marks the line number in red, and keeps **Save** off until it is fixed. While values are hidden, a line shows `KEY="••••••••"`; leave it as it is to keep the stored value, or type over it to change it. **Show values** fills in the real values in this view too.

## See a saved value

dPanel hides every value once it is saved: the web app and the API show `••••••••` in its place, and `dnocs` lists names only. When you need a value back, you can show it on request.

1. Open **Settings** and press **Edit** next to **Environment variables** under **Run**. The panel says **Values are hidden. Unchanged ones keep their stored value.**
2. Press **Show values**. The real values fill the hidden fields; anything you already typed stays as it is.
3. When you are done, press **Hide values**, especially before you share your screen.

Build-time values are shown the same way in **Edit settings**, on the **Environment** step.

Only people who may change the application can show values; people who can only view it cannot. Each time values are shown, dPanel records who did it and for which application, never the values themselves.

## From the terminal

The [dnocs CLI](../ai/ai-in-the-terminal.md) works on the runtime variables:

```bash
dnocs application env list --id 76                 # names only
dnocs application env list --id 76 --show-values   # names and values
dnocs application env set --id 76 APP_ENV=production LOG_LEVEL=warning
printf %s "$TOKEN" | dnocs application env set --id 76 API_TOKEN --value-stdin
dnocs application env unset --id 76 APP_DEBUG
```

`set` and `unset` change only the variables you name. `--value-stdin` reads a secret from standard input, so it stays out of your shell history. The change reaches the servers on the next release, for example `dnocs application deploy --id 76 --server-id <server ID>`.

## Where the values live on the server

For experts, this is what dPanel does with the values on your server:

| Variables | On the server                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime   | Written to `/etc/dpanel/apps/<service name>.env`, owned by root with mode `0600` (directory `0700`). The application's systemd unit only refers to this file. Deleting the release removes it. |
| Build     | Written to a file only the build user can read (mode `0600`), read by each build step, and removed after the build, even when a step fails. They never appear on a command line.               |

The build log lists variable names, never values. Values reach your program exactly as you typed them, including spaces, quotes, `$` and `%`.

Applications created before this layout move to it on their next release.

## Keeping secrets safe

- Values are hidden everywhere until someone who may change the application asks to show them.
- Keep secrets in **Runtime variables** unless the build really needs them.
- Do not commit secrets to the repository. dPanel passes these variables in for you.
- Passwords of modules installed with the application, such as a database administrator password, are kept out of the setup files dPanel stores for your workspace.

## Frequently asked questions

### Do I need to redeploy after changing a variable?

Yes. The running service keeps the values it started with, and **Restart** does not change them. Release again with **Build and release** or **Redeploy** so it starts with the new ones.

### Can I see a secret after I saved it?

Yes, if you may change the application. Press **Show values** in the **Run** panel, or in **Edit settings** for build-time values, or run `dnocs application env list --id <application ID> --show-values`. Each time is recorded. See [See a saved value](#see-a-saved-value).

### Should a database password be a build-time or a runtime variable?

Runtime. Only the running application connects to the database, so the build never needs it. Run database migrations as a **release command** (the Laravel preset adds `php artisan migrate --force` for you): release commands run after the build with the runtime variables, so the password is needed in one place only. See [Release commands and processes](./update-or-delete.md#release-commands-and-processes).

### Can I put variables in a .env file in my repository?

You can, but anything committed to Git can leak. Keep secrets in dPanel's **Runtime variables** instead.

### Can other users on the server read my variables?

No. The runtime file is readable by root only, and build values live in a file only the build user can read, removed after the build.
