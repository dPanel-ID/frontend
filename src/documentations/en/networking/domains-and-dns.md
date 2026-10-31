---
title: Domains and DNS
description: Let dPanel manage DNS records for a domain you already own, with your existing DNS provider.
sidebar_position: 2
---

dPanel does not sell or transfer domains. You keep buying them where you do today. What dPanel needs is access to whoever answers DNS for the domain, so it can create the records that point a name at your servers.

## What you need first

- A domain whose DNS is hosted at **Cloudflare** or **DigitalOcean**.
- An API token from that provider that can read and edit DNS records for the zone.

:::tip
Use a scoped token. At Cloudflare, a token limited to "DNS edit" on that one zone is enough.
:::

![The Domains & DNS page listing two domains managed through Cloudflare](../../assets/networking/domains-list.webp 'Domains & DNS: each card shows the DNS provider, who can use it, and the wildcard record.')

## Add a domain

1. Open **Domain & DNS** in the sidebar.
2. Press **Add a domain**.
3. **Domain**: the zone you want dPanel to manage, such as `example.com`. A subdomain works too.
4. **Description**: optional. A note for your teammates, such as "Production marketing domain".
5. **Provider**: pick where the zone is hosted.
6. **API token**: paste the provider token.
7. When the review reads **Ready to add**, press **Add domain**.

![The Add Domain form with domain, provider and API token](../../assets/networking/domain-create.webp 'The token is sent once, on submit. The review never shows it.')

## What happens next

dPanel reads the zone first and lists the records already there. Nothing is changed until you use the domain somewhere, for example as a **Managed** domain on a load balancer.

## Use the domain on a load balancer

On a load balancer, choose **Managed** under **Domain Name**, type a **Subdomain** and pick the domain. dPanel creates an `A` record from that name to the gateway server. It refuses a name that already has a record, so existing records stay untouched.

In our walkthrough, `docs-demo` on `terpusat.me` became `docs-demo.terpusat.me`, pointing at the gateway `103.183.75.207`. See [Load balancers](./load-balancers.md).

## See and remove records

1. In the list, open the domain with **Details**.
2. **Domain Details** lists every record with its **Type**, **Name**, **Content** and **TTL**.
3. To remove a record, press the bin icon on its row and confirm **Delete Domain Record**.

There is no form to add a record by hand. dPanel creates records itself when a load balancer uses the domain. See [Load balancers](./load-balancers.md).

:::warning
Deleting a record takes effect at your DNS provider straight away. Anything that still uses that name stops resolving.
:::

## Share, move or delete a domain

- A domain added in a team workspace is shared with that team.
- **Migrate Ownership** in the row menu moves it to another workspace.
- **Delete** removes the domain from dPanel after you confirm **Delete Domain**.
