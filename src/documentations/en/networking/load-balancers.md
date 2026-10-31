---
title: Load balancers
description: Put one public address with HTTPS in front of your applications and servers.
sidebar_position: 1
---

A load balancer is the front door. It takes the traffic arriving at your domain, handles the HTTPS certificate, and forwards each request to an application or to a port on a server.

dPanel builds it on one of your own servers, the **gateway**. It installs the web server engine there for you.

## What you need first

- A ready server to act as the gateway. It needs public ports 80 and 443 open. See [Servers](../servers/overview.md).
- A domain name. Either one you manage elsewhere, or one added to dPanel under **Domain & DNS** (see [Domains and DNS](./domains-and-dns.md)).
- Something to send traffic to: an application, or a service listening on a port.

![The Load balancers page with the explainer and an empty list](../../assets/networking/lb-list.webp 'Load balancers: what it does, then your list.')

## Create a load balancer

Open **Load Balancers** in the sidebar and press **Create a load balancer**. The form has three numbered parts, and a review panel on the right that fills in as you go.

![The Create a load balancer form with the gateway, domain and routing sections](../../assets/networking/lb-create.webp 'The review panel on the right counts what is still missing.')

### 1. Gateway

1. Under **Gateway Server**, pick the server that will answer public traffic.
2. Under **Web Server Engine**, pick the engine module. If the server already reports one, it is listed under **Reported on selected gateway**. Otherwise pick one from the catalogue and press **Install**.

### 2. Domain and HTTPS

1. Under **Domain Name**, choose the mode:
   - **External**: type a hostname you manage yourself. Point its DNS record at the gateway server's address.
   - **Managed**: type a **Subdomain** and **Select domain** from the domains in **Domain & DNS**. dPanel creates the DNS record for you.
2. Under **Protocol & Features**, keep **HTTP / HTTPS** for websites and APIs.
3. Turn on **SSL Enabled** to serve HTTPS. dPanel requests the certificate and renews it.

### 3. Routing

1. Under **LB Type Allocation**, pick the layer:
   - **L7** for websites and APIs. Routes by URL path.
   - **L4** for raw TCP or UDP, such as a database port. No path inspection.
2. For L7, each rule under **Upstream Rules Configuration** has:
   - **Type**: **Application** sends traffic to one of your dPanel applications. **Proxy Pass** sends it to an address and port.
   - **Matching Path**: which requests the rule takes, such as `/api/*`. A path ending in `/*` matches everything under it, and the rule shows a **Wildcard** badge.
   - **Destination**: the application, or the address and port. **Add Destination** adds more targets to share the load.
3. Press **Add New Rule** for more paths.

When the review panel reads **Ready to create**, press **Create load balancer**.

## What happens next

dPanel installs the engine on the gateway server if it is not there yet, then publishes the routes. The counts at the top of the list move it from **Setting up** to **Serving traffic**, or to **Needs attention** if something failed. When it is ready, open your domain in a browser.

## Look after a load balancer

Open a load balancer from the list to see its detail page.

| Tab           | Use it to                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **Graph**     | Follow a request from the domain to the gateway, the routes and the final targets                      |
| **Upstreams** | See every backend in order. **Add backend** adds one, **Remove backend** removes one                   |
| **Logs**      | Read gateway requests. Switch **All requests** and **Errors only**. The default is the last 10 minutes |
| **Config**    | Turn **Enable SSL** or **Enable Cloudflare proxy** on or off                                           |

Changes on **Upstreams** and **Config** are drafts until you press **Save changes**. Saving re-runs the gateway setup. **Reset draft** throws the draft away.

:::tip
Requests reaching an application through a load balancer also appear on that application's **Logs** tab, under the **Load balancer** source. See [Application logs](../applications/application-logs.md).
:::

## Move or delete

- **Migrate Ownership** in the row menu moves the load balancer to another workspace.
- **Delete** asks you to confirm. The routes stop serving. Your applications and the gateway server keep running.

:::warning
A server that still hosts a load balancer cannot be deleted. Delete the load balancer first.
:::
