---
title: Load balancers and HTTPS
description: Create a load balancer in dPanel to publish an app on your domain with free Let's Encrypt HTTPS, path routing and DNS set up for you.
sidebar_position: 1
sidebar_icon: network
sidebar_label: Load balancers
---

A load balancer in dPanel publishes your application on a domain with HTTPS. It takes the traffic arriving at the domain, gets and renews a free Let's Encrypt SSL certificate, and forwards each request to an application or to a port on a server. With a domain managed in dPanel, it also creates the DNS record for you.

dPanel builds the load balancer on one of your own servers, the **gateway**, and runs a web server engine (Caddy) there. Nothing runs outside your servers.

## What you need first

- **A ready server** to act as the gateway, with ports 80 and 443 reachable from the internet. Servers dPanel launches have them open. See [Servers](../servers/overview.md).
- **A domain.** Either add the zone to dPanel under **Domain & DNS** so dPanel can create the record ([Domains and DNS](./domains-and-dns.md)), or use a hostname you manage yourself.
- **Something to send traffic to**: a dPanel [application](../applications/overview.md), or a service listening on a port.

:::warning[Pick a name nobody uses]
With a managed domain, dPanel creates a new DNS record. It refuses a subdomain that already has one, so existing records are never overwritten. Use a fresh name, such as `app`.
:::

## Create a load balancer

Open **Load Balancers** in the sidebar and press **Create a load balancer**. The form has three numbered steps. The **Load balancer** review panel on the right reads **Start with a gateway server** until you pick one, then counts what is still missing.

### Step 1: Gateway

1. Under **Gateway server**, pick the server that will answer public traffic. Each row shows the server's name, status, address and operating system. Only ready servers can be picked; any other row says **Only ready servers can run a load balancer.**
2. Under **Web server engine**, pick **Caddy Server**. If it is already on the server, it is listed under **Reported on selected gateway** as **Installed**. If not, find it under **Install an engine** and press **Install**.

![Step 1: the Gateway step, with a ready gateway server selected and Caddy Server installed](../../assets/networking/lb-create-gateway.webp)

### Step 2: Domain and HTTPS

1. Under **Domain Name**, pick the mode:
   - **Managed**: type a **Subdomain**, then **Select domain** from your domains in **Domain & DNS**. dPanel creates the DNS record for you.
   - **External**: type a hostname you manage yourself, and point its DNS at the gateway's public address.
2. Under **Protocol and HTTPS**, the protocol is **HTTP / HTTPS** for websites and APIs.
3. Leave **HTTPS** on. dPanel requests the certificate and renews it for you. Turn it off only for a plain-HTTP setup.

![Step 2: a managed subdomain on terpusat.me, HTTP / HTTPS, with HTTPS on](../../assets/networking/lb-create-domain.webp)

### Step 3: Routing

1. Under **Routing mode**, pick **L7** for websites and HTTP APIs. It routes by path, such as `/api`. **L4** forwards raw TCP or UDP ports, for databases and other non-HTTP services, without looking at paths.
2. Under **Routes**, set up the first **Rule**:
   - **Type**: **Application** sends traffic to a dPanel application. **Proxy Pass** sends it to an address and port.
   - **Matching Path**: `/*` takes every request. A path ending in `/*` shows a **Wildcard** badge.
   - **Application**: pick the application. dPanel uses the application's server and port.
3. Press **Add New Rule** to send other paths elsewhere, such as `/api/*`.

![Step 3: L7 routing with one rule sending /* to an application](../../assets/networking/lb-create-routing.webp)

### Create it

When the review panel reads **Ready to create**, every answer is in: gateway server, engine, domain, HTTPS, routing mode and routes. Press **Create load balancer**.

![The review panel reading Ready to create, with the gateway server, engine, domain, HTTPS, routing mode and routes](../../assets/networking/lb-create-review.webp)

## What happens next

You land on the list with **Load balancer created successfully.** The row reads **In Progress** while dPanel:

1. Creates the DNS record. For a managed domain this is an `A` record from the host to the gateway's public address.
2. Installs Caddy on the gateway if it is not there yet.
3. Publishes the routes and requests the HTTPS certificate.

This usually takes about a minute. The first load balancer on a server also installs Caddy, which takes about 10 minutes. The row then reads **Ready**, and the counters at the top move it to **Serving traffic**.

![The Load balancers list in table view, with each load balancer's engine, status, gateway server and address, and routing](../../assets/networking/lb-list.webp)

## Check that it is live

Open the host in a browser, or check it from a terminal:

```bash
curl -sI https://app.example.com
```

A live load balancer answers like this:

```text
HTTP/2 200
alt-svc: h3=":443"; ma=2592000
content-type: text/html; charset=utf-8
server: dPanel
```

What a healthy one shows:

| Check       | What you should see                                                       |
| ----------- | ------------------------------------------------------------------------- |
| DNS         | The host resolves to the gateway server's public address                  |
| Plain HTTP  | `308 Permanent Redirect` to the `https://` address                        |
| HTTPS       | `HTTP/2 200`, served by your application, with `server: dPanel`           |
| Certificate | Issued by Let's Encrypt for your host, valid for 90 days, renewed for you |
| Protocols   | HTTP/2, plus HTTP/3 (QUIC) advertised in `alt-svc`                        |

:::tip[A new name can take a minute to resolve]
If `curl` says it cannot resolve the host right after creation, your own resolver may have cached the "not found" answer. Wait a few minutes, or test against a public resolver such as `dig @1.1.1.1 app.example.com`.
:::

## The detail page

Select a load balancer in the list to open its page. The header shows the domain, the status, when it was last updated and **Open site**, then four facts: **Status**, **Routes** (with the routing mode), **Gateway server** and **Engine**.

| Tab           | Use it to                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------- |
| **Graph**     | Follow a request from the domain to the load balancer, the gateway, the routes and the targets  |
| **Upstreams** | See every backend in order, with its match path, destination and port. **Add backend** adds one |
| **Logs**      | Read the requests the gateway handled                                                           |
| **Config**    | Turn **Enable SSL** or **Enable Cloudflare proxy** on or off                                    |

![The load balancer detail page: the header with its four facts, and the traffic graph from domain to application](../../assets/networking/lb-detail-graph.webp)

![The Upstreams tab with one backend sending /* to an application](../../assets/networking/lb-detail-upstreams.webp)

Changes on **Upstreams** and **Config** are drafts until you press **Save changes**. Saving updates the routing definition and runs the gateway setup again. **Reset draft** throws the draft away.

![The Config tab with Enable SSL and Enable Cloudflare proxy](../../assets/networking/lb-detail-config.webp)

## Load balancer logs

The **Logs** tab lists the requests reaching the gateway, titled **Load balancer requests**. The same requests appear on the application's **Logs** tab under the **Load balancer** source. See [Application logs](../applications/application-logs.md).

![The Logs tab: time range, filter, Download and Refresh above the request table](../../assets/networking/lb-detail-logs.webp)

- **Time range**: the last 10 minutes by default. Pick a preset up to **Last 10 days**, or a **Custom range** within the last 10 days.
- **Paging**: 200 lines per page, newest first. The footer reads, for example, **Lines 1–200 of 201, newest first**, with the page buttons.
- **Download**: **This page**, or **Everything in this time range**, as a `.log` file.
- **Refresh** loads the newest lines. **Auto-refresh** is off by default; turn it on for every 30 seconds, minute or 5 minutes.

The shared controls are explained in [Time range and refresh](../logs/time-range-and-refresh.md) and [Download logs](../logs/download-logs.md).

## Delete a load balancer

1. In the list, open the **More** (⋯) menu on the load balancer's row and choose **Delete**.
2. Confirm **Delete Load Balancer**.

dPanel removes the routes from the gateway, and the row reads **Deleted**. Your application and the gateway server keep running. A load balancer stays in the workspace it was created in; it cannot be moved to another one.

:::warning[Check the DNS record]
Check at your DNS provider whether the record dPanel created is still there after a delete, and remove it from the domain's [DNS records](./dns-records.md) if you no longer need the name.
:::

:::note
A server that still hosts a load balancer cannot be deleted. Delete the load balancer first.
:::

## Frequently asked questions

### Is the SSL certificate free?

Yes. dPanel gets a Let's Encrypt certificate for your host and renews it before it expires, at no cost. It is valid for 90 days at a time.

### Do I need Cloudflare?

No. dPanel can create the DNS record at Cloudflare or DigitalOcean, or you can point any hostname at the gateway yourself with **External**. **Enable Cloudflare proxy** on the **Config** tab is only for domains hosted at Cloudflare.

### Can one load balancer serve several applications?

Yes. Add one route per path, such as `/*` for the website and `/api/*` for the API, each sending traffic to a different application or address.

### Which web server does dPanel use?

Caddy. dPanel installs it on the gateway server the first time, and the response header reads `server: dPanel`.

### Why can't I pick my server as the gateway?

Only servers that are ready can run a load balancer. A server still being set up, or one whose setup failed, is shown but cannot be picked.
