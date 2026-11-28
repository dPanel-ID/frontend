---
title: Deploy Laravel with PostgreSQL
description: Go from an empty dPanel account to a Laravel app on your domain with HTTPS. dPanel recognises Laravel and fills in the runtimes, build, migrations, health check and application key for you.
sidebar_position: 3
sidebar_icon: rocket
sidebar_label: Laravel
---

This tutorial takes you from an empty dPanel account to a Laravel application answering on your own domain with HTTPS. You launch an Ubuntu server, install PostgreSQL, PHP, FrankenPHP and Node.js on it, create a database, deploy the [dPanel-ID/laravel-example](https://github.com/dPanel-ID/laravel-example) repository, and put a load balancer in front of it.

dPanel recognises a Laravel repository (it has an `artisan` file) and fills in the settings for you: the runtimes, the build, the release commands, the start command and the health check. You check them and change what you need. Three things are worth knowing:

- **It needs two runtimes.** The build runs Composer with PHP, then `npm` to build the front end with Vite, so the application declares both PHP and Node.js.
- **Migrations run in the release step, not in the build.** After the build and before the restart, dPanel runs `php artisan migrate --force` and the other release commands with the **runtime** variables, so your database settings live in one place. If a release command fails, the version already running keeps serving.
- **dPanel keeps the application key.** It creates `APP_KEY` when the application is created and never replaces it, so sessions and encrypted data survive every deploy.

It takes about 45 minutes, most of it waiting for the server and the installs. Every step happens in the dPanel web app; you never need SSH.

:::tip[New to servers?]
Read [How a website runs on your server](./how-a-website-runs.md) first. It explains every word this page uses, such as module, build, port and load balancer, in a few minutes. The [Glossary](../getting-started/glossary.md) has the rest.
:::

## What you need first

- A dPanel account, signed in, in the workspace you want to use. See [Sign in](../getting-started/sign-in.md).
- GitHub connected, with access to the repository you deploy. To follow along exactly, fork **dPanel-ID/laravel-example** into your own account. See [Connect GitHub](../getting-started/connect-github.md).
- A server: a cloud account in dPanel to launch one, or a server of your own (a VPS with a public IP, so visitors can reach it) connected with the [dPanel agent](../servers/register-a-private-machine.md). See [Before you start](../servers/before-you-start.md).
- A domain in **Domain & DNS**, so dPanel can create the DNS record for you. See [Domains and DNS](../networking/domains-and-dns.md).

## Step 1: Launch a server

1. Open **Servers**, press **Create Server**, then **Launch a server**.
2. Pick your **Provider** and **Cloud project**, then a **Region** near your users. Under **How dPanel connects**, keep **dPanel agent** and **Give the VM a public IP** on: the site needs a public IP.
3. Set **Server name**, for example `laravel-1`, keep **Ubuntu release** 24.04 LTS, and move the sliders to at least **2 vCPU** and **4 GB** RAM. 30 GB of storage is enough.
4. When the Review panel says **Ready to launch**, press **Launch server**.

Wait until the server's status is **Ready**, usually 10 to 20 minutes. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md), or [connect a server you already have with the dPanel agent](../servers/register-a-private-machine.md) instead.

**You should see:** the server listed under **Servers** with the status **Ready**.

## Step 2: Install PostgreSQL

1. Open the server and go to **Modules**. Press **Add module**.
2. Press **Install** on **PostgreSQL**. Note the administrator user and set its password, and copy it somewhere safe. Press **Install role** and confirm.

![The module catalogue on a server, grouped by category](../../assets/servers/server-module-catalog.webp)

You do not need to install PHP, Node.js or FrankenPHP here: the application form offers them in step 3 with the versions your repository asks for. See [Install software](../servers/install-software.md).

**You should see:** PostgreSQL on the **Modules** tab, marked **Installed**.

## Step 3: Create and deploy the application

1. Open **Applications** and press **Create Application**.
2. **Repository**: pick your GitHub account, search for `laravel-example`, select it and keep the **main** branch. A **Laravel detected** panel appears: dPanel read the repository (the Laravel version, the PHP version it asks for, whether it uses Octane, how it builds its front end) and filled in the settings. Press **Continue**.
3. **Server & modules**: select your server. **What this Laravel app needs** lists PHP (8.4, or the version your `composer.json` asks for), Node.js 22 and FrankenPHP. Press **Use … on this server** for one that is already installed, or **Add** for one that is not. Nothing is added until you press a button. Press **Continue**.
4. **App setup**: the form is filled in. Check it:
   - **Application name**: `Laravel` (letters, numbers and spaces only).
   - **Required binaries**: PHP and Node.js are both selected, which puts `npm` on the build's path. FrankenPHP appears under **Other dependencies**.
   - **Build steps**: `composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist`, then `npm ci && npm run build` (pnpm or yarn when the repository uses them). The build needs no database and no application key.
   - **Runtime command**: Laravel Octane on FrankenPHP for this repository (`php artisan octane:frankenphp …`). A Laravel app without Octane gets FrankenPHP's classic mode, which serves the `public/` folder.
   - **Application port**: keep the free port dPanel suggests.
   - **Release and processes**: the **Release commands** are `php artisan storage:link --force`, `php artisan migrate --force` and `php artisan optimize`. **After the restart** runs `php artisan reload`. The **Health check** asks `/up`, the page Laravel 11 and newer answer on. The **Queue worker** and the **Scheduler** are off: turn the worker on if your app queues jobs (Laravel's default database queue needs it), and the scheduler if it schedules tasks. Each uses memory, so leave them off until you need them.
5. **Environment**: the **Runtime variables** already hold `APP_ENV=production`, `APP_DEBUG=false` and `LOG_CHANNEL=stderr` (and the Octane settings). Then:
   - Press **Create database** under **Database for this app**, pick **PostgreSQL**, keep the names dPanel suggests and confirm. dPanel creates the database and its user with a strong password and writes `DB_CONNECTION=pgsql` and the other `DB_*` settings into the **Runtime variables**. You never type the password.
   - Add your address: `APP_URL=https://app.example.com`.
   - Leave **Build-time variables** empty, and do not add `APP_KEY`: dPanel creates it.
6. **Preview**: check the summary. **Pre-flight checks** compares what the repository asks for (the PHP version and extensions in `composer.json` and `composer.lock`, the Node.js version in `package.json`) with what you chose. An error, such as a PHP version the app does not support, holds the deploy button: fix it, or tick **Deploy anyway** if you know better. Warnings do not hold anything. Press **Deploy application**.

![The App setup step for Laravel: Node.js and PHP both selected under Required binaries, FrankenPHP under Other dependencies](../../assets/tutorials/laravel-app-setup-runtimes.webp)

The first build takes 3 to 6 minutes, longer if dPanel installs PHP, Node.js and FrankenPHP first. Open the application to follow it; it shows **Running** when the release is live and `/up` answered. See [Create an application](../applications/create-an-application.md) and [Environment variables](../applications/environment-variables.md).

:::warning[npm: command not found]
If the build log stops at `npm: command not found`, Node.js is not declared on the application. Open the application's settings, add **nodejs** with the installed version under the additional languages, save, and deploy again.
:::

**You should see:** the application marked **Running**. It is not on the internet yet: that is the next step.

## Step 4: Publish it on your domain with HTTPS

1. Open **Load Balancers** and press **Create a load balancer**. The form has four steps: **Gateway**, **Domain**, **Routing** and **Review**.
2. **Gateway**: under **Gateway server**, select the same server. Under **Web server engine**, pick **Caddy Server** and press **Install** if it is not installed yet.
3. **Domain**: under **Domain Name**, choose **Managed**, type the **Subdomain** (for example `app`), and **Select domain**. If your domain's DNS is not at Cloudflare or DigitalOcean, choose **External**, type your hostname and add the record the form shows at your DNS provider.
4. **Routing**: keep **L7** under **Routing mode**, and **HTTP / HTTPS** with **HTTPS** on under **Protocol and HTTPS**. In the first rule, set **Type** to **Application**, **Matching Path** to `/*`, and pick the **Laravel** application.
5. **Review**: when the review panel reads **Ready to create**, press **Create load balancer**.

After a minute or two, open `https://app.example.com/`: the Laravel welcome page appears. See [Load balancers](../networking/load-balancers.md).

## When something does not work

| What you see                              | What to check                                                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm: command not found` in the build log | Declare Node.js on the application, as in the warning above.                                                                                                                   |
| A release command fails                   | The deployment log shows the command and its output; the previous version keeps serving. For `php artisan migrate`, check the `DB_*` **Runtime variables** match the database. |
| The deployment fails at the health check  | The log shows the last answer of `/up` and the app's last lines. A 500 often means a missing variable; read the [runtime log](../applications/application-logs.md).            |
| `MissingAppKeyException`                  | `APP_KEY` was removed from the runtime variables. Deploy again: dPanel creates one when it is missing. Sessions signed with an older key end.                                  |
| The application starts, then stops        | Read its runtime log. See [Application logs](../applications/application-logs.md).                                                                                             |
| The domain does not answer                | Wait a few minutes for DNS and the certificate, then check the load balancer's detail page and logs. A red **Load balancer change failed** banner has **See why it failed**.   |
| Anything else                             | See [Common problems and fixes](../troubleshooting/faq.md).                                                                                                                    |

A variable change applies from the next release: deploy again after changing one.

## Prefer to chat? Do the same with Ask dPanel

[Ask dPanel](../ai/overview.md) can prepare every step for you to approve. Name both runtimes when you ask it to create the application, for example:

> Create an application named Laravel from github.com/my-org/laravel-example on server laravel-1. Language PHP 8.5 with Node.js as an extra runtime, build command ./scripts/build.sh, start command ./scripts/start.sh.

It asks for `DB_PASSWORD` as a field on the approval card, so the password never goes into the chat. dPanel creates `APP_KEY` for a Laravel repository, whichever way you create the application. More ready-made requests are in the [Prompt cookbook](../ai/prompt-cookbook.md).

## Clean up

Delete in this order: the load balancer, the application, then the server. See [Load balancers](../networking/load-balancers.md#delete-a-load-balancer), [Update or delete an application](../applications/update-or-delete.md) and [Delete a server](../servers/delete-a-server.md).

## Frequently asked questions

### Why does the application need Node.js if Laravel is PHP?

The build runs `npm` to bundle the front end with Vite. dPanel puts only the runtimes declared on the application on the build's path, so Node.js must be declared next to PHP.

### Do the database variables go in the build-time variables too?

No. The build only installs packages and builds the front end. Migrations run as a release command, with the **Runtime variables**, so the `DB_*` settings belong there only.

### Can I change the preset?

Yes. Every field the preset fills in stays editable in the form and later under the application's **Settings**, in **Release and processes**. dPanel applies the preset once, when you pick the repository and branch.

### Can I run a queue worker or the scheduler later?

Yes. Open the application's **Settings**, press **Edit** on **Release and processes**, and add a process: a **service** for `php artisan queue:work`, or a **schedule** for `php artisan schedule:run`. It starts with the next deployment.

### Can I use MariaDB instead of PostgreSQL?

Yes. Install **MariaDB**, create the database from its **Manage** page, and set `DB_CONNECTION=mysql` and `DB_PORT=3306`.
