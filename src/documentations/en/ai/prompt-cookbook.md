---
title: Prompt cookbook
description: Copy-ready requests for Ask dPanel, the dPanel AI assistant: deploy WordPress or Laravel, add a database, open a port, add a domain, and fix a failing app.
sidebar_position: 3
sidebar_icon: list-checks
---

This cookbook collects requests you can copy into **Ask dPanel**, the dPanel AI assistant, for common tasks. Replace the names and numbers with your own. Questions run at once; anything that changes your workspace comes back as a card for you to approve. See [Approve or reject changes](./approvals-and-secrets.md).

:::tip[How to write a good request]
Say **what** you want and give the facts the assistant cannot know: which server, which repository and branch, which domain. Use IDs when you have them (`server 145`, `application 35`). You don't need to know the commands; the assistant works out the steps and asks when something is missing.
:::

## Find your way around

| Goal                      | Request                                                      |
| ------------------------- | ------------------------------------------------------------ |
| See your servers          | `Which of my servers are stopped?`                           |
| See what runs where       | `Which applications run on server 145, and on which ports?`  |
| Check recent jobs         | `Did any job fail in the last 24 hours?`                     |
| List domains              | `List my domains and their DNS providers.`                   |
| Check disk space          | `Which of my servers is running out of disk?`                |
| Learn a concept           | `What is a load balancer, and do I need one for my website?` |
| Find a page in dPanel     | `Where do I change an application's build commands?`         |
| See who changed something | `Who deleted a load balancer in this workspace this week?`   |

## Launch a server

```text
Create a VM in my Google Cloud project 7 named web-1: Ubuntu 24.04, 2 vCPU and 4 GB of memory, the cheapest machine type, 30 GB disk, region asia-southeast1, with SSH key 37.
```

The assistant looks up your cloud accounts, regions, machine types and SSH keys, then proposes the server with an **estimated** price. The real price is what your cloud provider charges. A new server takes 10 to 20 minutes to be ready; ask "Is server web-1 ready?" to check.

To set up a server again after a failed setup: `Run server setup again on server 145.`

The assistant launches servers that join over SSH, so it uses one of your SSH keys, as in the example. To launch a server that joins through the dPanel agent, with no SSH key, use the form or `dnocs server create-cloud`. See [Create a cloud server](../servers/cloud-providers/create-a-cloud-server.md). To add a server you already have, run `sudo dnocs machine register` on it; see [Connect a server with the dPanel agent](../servers/register-a-private-machine.md).

## Install software on a server

```text
Server 145 is ready. Propose installing MariaDB, PHP 8.5 and FrankenPHP on it.
```

Ask "Which versions of PostgreSQL can I install?" first if you are not sure. Approve one install at a time and wait for it to finish. See [Install software](../servers/install-software.md).

## Add a database for your app

```text
On server 145, create a MariaDB database named wordpress with a user named wp.
```

For PostgreSQL: `On server 145, create a PostgreSQL database named shop with a user named shop.` (PostgreSQL names are lowercase.)

The server needs MariaDB or PostgreSQL installed first; the assistant checks and proposes the install if it is missing. When you approve, dPanel creates the database and user and shows the generated password **once** on the card. Copy it straight away.

To look inside your databases: `Which databases are on server 145? Give me the DB Manager links.`

## Deploy WordPress

Ask in steps, approving each card and waiting for its job before the next:

1. `Server 145 is ready. Propose installing MariaDB, PHP 8.5 and FrankenPHP on it.`
2. `On server 145, create a MariaDB database named wordpress with a user named wp.` Save the generated password.
3. `Create an application named Blog from https://github.com/dPanel-ID/wordpress-example, branch main. Language PHP 8.5 with FrankenPHP, build command ./scripts/build.sh, start command ./scripts/start.sh. Runtime variables: WORDPRESS_DB_HOST=127.0.0.1:3306, WORDPRESS_DB_NAME=wordpress, WORDPRESS_DB_USER=wp, WORDPRESS_HOME=https://blog.example.com, WORDPRESS_SITEURL=https://blog.example.com, and WORDPRESS_DB_PASSWORD as a secret I type when approving.` On the card, type the password you saved in step 2.
4. `Deploy application Blog from main to server 145.`
5. `Put Blog on blog.example.com with HTTPS.`

The step-by-step version with screenshots is [Deploy WordPress](../tutorials/deploy-wordpress.md).

## Deploy Laravel

Ask in steps, approving each card and waiting for its job before the next:

1. `Server 145 is ready. Propose installing PostgreSQL, PHP 8.5, FrankenPHP and Node.js on it.`
2. `On server 145, create a PostgreSQL database named laravel with a user named laravel.` Save the generated password.
3. Create the application:

```text
Create an application named Shop from https://github.com/dPanel-ID/laravel-example, branch main. Language PHP 8.5 with Node.js as an extra runtime, build command ./scripts/build.sh, start command ./scripts/start.sh. Runtime variables: APP_ENV=production, APP_DEBUG=false, APP_URL=https://shop.example.com, DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=laravel, DB_USERNAME=laravel, OCTANE_SERVER=frankenphp, and DB_PASSWORD as a secret I type when approving.
```

- If the repository has no `.devetek` definition, the assistant asks for the language, version, build commands and start command rather than guessing. It may suggest values from your `composer.json`, `package.json` or `.env.example`; confirm them.
- **Don't choose a port.** dPanel picks a free port on the server when it deploys, and tells you which.
- If the build also uses Node.js (for example `npm` to build front-end assets), say so, as above. dPanel puts only the runtimes declared on the application on the build's path; the assistant installs Node.js and declares it for you.

Then: `Deploy application Shop from main to server 145.` and `Put Shop on shop.example.com with HTTPS.` The full walkthrough is [Deploy Laravel](../tutorials/deploy-laravel.md).

## Set environment variables

| Goal                  | Request                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Add a normal variable | `On application Shop, set the runtime variable APP_DEBUG=false.`                             |
| Add a secret          | `On application Shop, set MAIL_PASSWORD as a secret runtime variable I type when approving.` |
| Add a build variable  | `On application Shop, set the build variable NODE_ENV=production.`                           |
| Check what is set     | `Which environment variables does application Shop have?` (names only, never values)         |

Never write a secret value in the chat. Ask for it "as a secret I type when approving", and type the value in the field on the card. A change applies from the next deploy, so the assistant offers to deploy afterwards. See [Environment variables](../applications/environment-variables.md).

## Put an app on a domain

```text
Put application Shop on shop.example.com with HTTPS.
```

- With a domain managed in dPanel, the assistant also creates the DNS record. See [Domains and DNS](../networking/domains-and-dns.md).
- To pick the engine: `Use the APISIX engine.` (Caddy is the default; HAProxy is also available.)
- Cloudflare proxying stays off unless you ask: `Proxy it through Cloudflare.`
- The application needs a ready deployment first.

To reach a database from outside with a TCP load balancer:

```text
Create a TCP load balancer named pg-ext on server 145 that exposes its PostgreSQL on port 15432, reachable only from 203.0.113.7.
```

If the server's firewall is on, the assistant warns you that the port must be allowed too and offers the rule. See [Load balancers](../networking/load-balancers.md).

## Open or close a port

| Goal                       | Request                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| See the rules              | `Show the firewall rules on server 145.`                                |
| Preview what would change  | `What would change if I applied the firewall on server 145?`            |
| Open a port                | `On server 145, allow TCP port 8080 from anywhere, then apply it.`      |
| Open a port to one address | `On server 145, allow TCP port 5432 only from 203.0.113.7, then apply.` |
| Close a port               | `On server 145, remove the rule for port 8080 and apply the firewall.`  |

Adding or removing a rule only changes the saved list; **applying** puts it on the server, so you approve two cards. SSH, and HTTP/HTTPS on servers with a load balancer engine, always stay open. See [Firewall](../servers/firewall.md).

## Read logs

| Goal                 | Request                                                            |
| -------------------- | ------------------------------------------------------------------ |
| An app's recent logs | `Show the last errors in the runtime logs of application Shop.`    |
| Why a build failed   | `Show the build log of the last failed build of application Shop.` |
| Traffic to a domain  | `Show the last requests to shop.example.com and any 5xx errors.`   |
| HTTPS certificate    | `Check the HTTPS certificate of shop.example.com.`                 |

See [Reading logs](../logs/reading-logs.md) to read them yourself.

## Debug a failing app

```text
Why is application Shop failing on server 145?
```

```text
My site shop.example.com shows a 502 error. Find out why.
```

The assistant reads the deployment, its build and runtime logs and the server's usage, quotes the lines that matter, and proposes a fix. More in [Diagnose problems with AI](./diagnose-problems.md).

## Clusters, groups and workers

| Goal                   | Request                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| See the options        | `Which cluster engines can I use?`                                                    |
| Build a cluster        | `Create a k3s cluster named lab with server 150 as server and 151 and 152 as agents.` |
| Retry a failed install | `Run the install of cluster 12 again.`                                                |
| Group servers          | `Create a server group named web with servers 145 and 146.`                           |
| Where jobs run         | `Do my jobs run on shared or private workers?`                                        |
| Switch workers         | `Switch this workspace to private workers.`                                           |

See [Server groups and clusters](../clusters/overview.md) and [Workers](../workers/overview.md).

## Clean up

```text
Delete application Old Shop and everything it needs removed first.
```

Deletes cannot be undone. The assistant confirms the resource, shows its ID and name, and proposes deletes in the order dPanel accepts: load balancer, deployments, builds, then the application. Servers, load balancers and deployments are deleted in two steps: the first cleans them up, the second removes the record.

## Frequently asked questions

### Do I have to use these exact words?

No. They are examples. Write the way you speak, in English or Indonesian; the assistant asks when something is missing.

### Can I ask for several changes at once?

Yes. The assistant shows one card per change. Approve them one at a time and wait for each job, because dPanel runs one job at a time per server.

### What if I don't know an ID?

Use the name, or ask first: "Which applications do I have?" The assistant never guesses an ID; if a name matches more than one thing, it asks which one.

### Why didn't the assistant pick a port for my app?

It leaves the port to dPanel, which picks a free one on the server when it deploys. The deployment and the card tell you which port it took.
