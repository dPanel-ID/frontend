---
title: Search and delete DNS records
description: Find any DNS record of a domain in dPanel by name or content, filter by type, copy a value, delete a record, or add and change records from the terminal.
sidebar_position: 3
sidebar_icon: file-text
sidebar_label: DNS records
---

Every domain in dPanel has its own page listing all of its DNS records (the entries that point a name at an address), read live from Cloudflare or DigitalOcean. You can search the records by name or content, narrow them to one record type, copy a name or value, and delete a record, without opening your DNS provider's console.

## Open a domain's records

1. Open **Domain & DNS** in the sidebar.
2. Select the domain, or press **Details** on its row.
3. Scroll to **DNS records**. The count beside the search box, such as **47 records**, is the size of the zone.

![The DNS records table of terpusat.me with the search box, the record type chips and the Type, Name, Content and TTL columns](../../assets/networking/domain-detail.webp)

Each row shows the record's **Type**, **Name**, **Content** and **TTL** (time to live: how long other computers may remember the answer before asking again). A name at the zone apex reads **root**, and a Cloudflare TTL of 1 second reads **Auto**. Records come 20 to a page; use the page buttons below the table for more.

## Find a record

1. Type part of a name or a value in **Search records, e.g. demo**. The list updates as you type, upper and lower case do not matter, and the text that matched is highlighted.
2. To narrow the list to one record type, press a chip: **A**, **AAAA**, **CNAME**, **MX**, **TXT**, **NS**, **SRV** or **CAA**. Press it again, or **All**, to see every type.
3. The count changes to the number of matches, such as **2 matches**.

![Searching terpusat.me for demo, which finds two matching records](../../assets/networking/domain-records-search.webp 'Search matches names and contents, and highlights the part that matched.')

When nothing matches, the table says so, for example **No A records match "demo".**, and **Clear search and filter** shows every record again.

## Copy a name or a value

On a record's row, press **Copy name** or **Copy content**. dPanel confirms with **Copied** and the value. Use it to paste a record into a support ticket, or to check what an old name pointed at.

## Delete a record

1. On the record's row, press **Delete**.
2. Confirm **Delete Domain Record**.

:::warning[It takes effect at once]
Deleting a record removes it at your DNS provider straight away. Anything that still uses that name stops resolving.
:::

There is no form to add or edit a record in the web app. dPanel creates the `A` record itself when a [load balancer](./load-balancers.md) uses a **Managed** domain, and the terminal can do the rest.

## Add or change records from the terminal

With the [dnocs command-line tool](../ai/ai-in-the-terminal.md) you can manage every record of a domain. Changes go straight to your DNS provider. `dnocs domain list` gives you the domain's ID.

```bash
dnocs domain record list --domain-id 2 --type A --search api
dnocs domain record create --domain-id 2 --name api --type A --content 203.0.113.10 --ttl 300
dnocs domain record create --domain-id 2 --name @ --type A --content 203.0.113.10
dnocs domain record update --domain-id 2 --record-id <record id> --content 203.0.113.20 --dry-run
dnocs domain record delete --domain-id 2 --record-id <record id> --dry-run
```

`@` means the domain itself, such as `example.com` with nothing in front. `--dry-run` shows the change without making it, so use it first. On Cloudflare, `--proxied` turns the proxy on, and `--proxied=false` turns it off.

A new `A` or `AAAA` record is refused only by records that cannot share its name, such as a `CNAME`. `MX`, `TXT`, `SPF`, `CAA` and `SRV` records can sit beside it, so email records do not block your website.

## Frequently asked questions

### Can I search DNS records by IP address?

Yes. The search matches a record's content as well as its name, so typing an IP address finds every record that points at it.

### Why does a record show TTL Auto?

Cloudflare uses a TTL of 1 second to mean "automatic", and lets Cloudflare pick the real value. dPanel shows it as **Auto**.

### Are the records up to date?

Yes. dPanel reads the zone from your DNS provider each time you open the page, search, or press **Refresh** at the top of the page.

### What should I clean up after deleting a load balancer?

Check whether its `A` record is still in the zone. Search for the host name and delete the record if you no longer need the name.

### Is the search case-sensitive?

No. `Demo`, `DEMO` and `demo` find the same records.
