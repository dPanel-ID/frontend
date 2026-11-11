---
title: How a website runs
description: New to servers? The ideas behind every dPanel tutorial in plain words: server, module, database, repository, build, port, domain and HTTPS.
sidebar_position: 1
sidebar_icon: circle-help
sidebar_label: Start here
---

You don't need to have run a server before to follow the dPanel tutorials in this section. This page explains, in plain words, the handful of ideas they use. Read it once; each tutorial then links back here when a word comes up. For any other word, see the [Glossary](../getting-started/glossary.md), and for the whole beginner path, [Your first steps](../getting-started/first-steps.md).

## The picture

When someone opens your website, this is what happens:

1. They type your address, such as `blog.example.com`. **DNS** turns that name into the address of your **server**.
2. The **load balancer** on your server answers. It holds the **HTTPS certificate**, so the browser shows a padlock, and passes the visit on to your **application**.
3. Your application, such as WordPress or Laravel, builds the page. When it needs stored data, such as posts or users, it asks the **database** on the same server.
4. The page goes back the same way to the visitor.

dPanel sets up every piece of that chain for you, from forms in the web app. The tutorials go through them in the order they have to exist: server, software, database, application, then the address.

## The words

| Word                      | What it means here                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server**                | A computer that stays on all the time: one rented from a cloud provider such as Google Cloud or AWS, which dPanel can launch in your own cloud account with Ubuntu Linux, or one you already have, such as a VPS or a machine at home. |
| **Module**                | A piece of software dPanel installs on your server for you: a database such as MariaDB, a language such as PHP or Node.js, or a web server such as FrankenPHP. You pick it from a list instead of typing install commands.                   |
| **Database**              | Where an application stores its data. One database program (MariaDB or PostgreSQL) can hold many databases; each application gets its own, with its own user and password, so it can't touch the others.                                     |
| **Repository**            | The folder of your application's code on GitHub. dPanel copies (clones) it to the server.                                                                                                                                                    |
| **Build**                 | The commands that turn the code into something ready to run: downloading libraries, compiling, preparing files. They run on the server each time you deploy.                                                                                 |
| **Runtime**               | The language program a build or an application needs, such as PHP or Node.js. An application can need more than one: Laravel uses PHP to run and Node.js to build its pages' styles and scripts.                                             |
| **Environment variables** | Settings given to the application from outside its code, such as the database name and password. You type them in dPanel, so passwords never go into your repository.                                                                        |
| **Deploy / release**      | Building the code on the server and starting it. Each deploy makes a new release; dPanel keeps the old ones so you can roll back.                                                                                                            |
| **Port**                  | A numbered door on the server. Your application listens on one, such as `9102`. dPanel picks a free one for you. Visitors never see it: the load balancer forwards to it.                                                                    |
| **Domain and DNS**        | Your address on the internet, such as `example.com`, and the records that point names under it, such as `blog.example.com`, at a server. dPanel creates the record when the domain is in **Domain & DNS**.                                   |
| **Load balancer**         | The front door of your website. It answers on the normal web ports (80 and 443), handles HTTPS, and sends each visit to the right application.                                                                                               |
| **Firewall**              | The guard on the server that decides which ports people can reach. dPanel keeps 22 (SSH) open, and 80 and 443 on a server that runs a load balancer. See [Firewall](../servers/firewall.md).                                                 |
| **HTTPS and certificate** | The encryption that gives the padlock in the browser. dPanel gets a free certificate from Let's Encrypt and renews it for you.                                                                                                               |

## What you need before any tutorial

Set these up once; every tutorial uses them.

1. **A dPanel account**, signed in. See [Sign in](../getting-started/sign-in.md).
2. **GitHub connected**, so dPanel can read your code. See [Connect GitHub](../getting-started/connect-github.md).
3. **A server.** If you already have one, such as a VPS or a machine at home, [connect it with the dPanel agent](../servers/register-a-private-machine.md): one command on the machine, no SSH key needed. Otherwise connect a **cloud account** in dPanel, where the server is created and billed; see [Before you start](../servers/before-you-start.md).
4. **A domain** added under **Domain & DNS**. See [Domains and DNS](../networking/domains-and-dns.md).

## Good habits from the start

- **Do one thing at a time and wait for it to finish.** Installing software and deploying take a few minutes each. dPanel shows progress on the server's **Modules** tab, the application's page and the job list.
- **Keep passwords in a password manager.** When the assistant generates a password, it shows it once. Copy it before you close the chat.
- **Never put a password in your code or in a chat**, including the [assistant](../ai/overview.md). Put it in an environment variable.
- **Delete what you don't use.** A cloud server costs money every hour it exists, even when idle.

## Pick a tutorial

- [Deploy WordPress with MariaDB](./deploy-wordpress.md): a blog or company site. The simplest place to start.
- [Deploy Laravel with PostgreSQL](./deploy-laravel.md): a PHP web application that also needs Node.js to build.

Prefer to chat? You can also do every tutorial with [Ask dPanel](../ai/overview.md): describe what you want, then approve each change. See the [Prompt cookbook](../ai/prompt-cookbook.md).

## Frequently asked questions

### Which tutorial should I start with?

[WordPress](./deploy-wordpress.md). It needs one language (PHP) and one database, so it has the fewest moving parts.

### Do I need my own server?

You need one server: either launched by dPanel in your cloud account, or one you already have and [connect with the dPanel agent](../servers/register-a-private-machine.md). The tutorials work the same on both. To publish the site on the internet, visitors must reach the server on ports 80 and 443: a VPS with a public IP does that by itself, and a home server needs those ports forwarded on your router.

### How much does a tutorial cost?

A cloud server is billed by your cloud provider for every hour it exists, and a domain costs whatever your registrar charges. A server you already have costs nothing extra. Delete the server when you are done to stop the cost.
