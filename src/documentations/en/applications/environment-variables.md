---
title: Environment variables
description: Give the build and the running service the settings they need, without putting them in the repository.
sidebar_position: 3
sidebar_icon: variable
---

dPanel keeps two separate lists, so a setting only the build needs never reaches the running service.

| List                 | Used                           | Typical contents                       |
| -------------------- | ------------------------------ | -------------------------------------- |
| Build-time variables | Only while the build steps run | `CGO_ENABLED=0`, `NODE_ENV=production` |
| Runtime variables    | By the running service         | A port, a database address, API keys   |

## Set them when you create the application

In step 4, **Environment**, type one `KEY=value` pair per line in **Build-time variables** or **Runtime variables**.

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
3. Add, change or remove variables, then press **Save**.
4. Release again with **Build and release** or **Redeploy**, so the service starts with the new values. See [Deployments and rollback](./deployments-and-rollback.md).

You can also change both lists in **Edit settings**, the full form. See [Update or delete an application](./update-or-delete.md).

## Keeping secrets safe

- dPanel never shows a variable's value after you save it. **Settings** lists the names only, with the value masked.
- Keep secrets in **Runtime variables** unless the build really needs them.
- Do not commit secrets to the repository. dPanel passes these variables in for you.
