# Load balancers: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: the load balancer list at
`/backend/load-balancers`, rebuilt on the house style in `UI_UX_STANDARD.md`
and the blocks the servers module introduced (`SERVERS_UI_REDESIGN_PLAN.md`).
Next: the create flow and the detail route.

`AGENTS.md` singles this module out: it "MUST not be treated as a secondary
or simplified module", and the list must expose gateway machine, public
address, routing rules, engine, ownership, lifecycle timestamps and
provisioning status. The card written before this plan already did most of
that; what was missing was the page around it.

## Who this module is for

"Load balancer" sounds like a traffic-splitting appliance for people with
fleets. Most users here want the simpler thing it also is: **the front door**.
One public address that holds the HTTPS certificate and forwards each path to
an application, a port on a server, or a folder of files. Someone who has only
ever used shared hosting has never had to name that component, and will not
look for it under "load balancer" when what they want is "put my app on my
domain".

## What changed

### Route — load balancer list (`/backend/load-balancers`)

| Before                                                                                     | After                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader`, a prose footnote pointing at YouTube, "View your load balancers here."       | `FlowHero` in the sky accent: breadcrumb, network tile, a description that says what the thing does, links to Servers and the docs, and the primary "Create a load balancer" action.                                                  |
| No explanation of what a load balancer is for.                                             | A three-step `Guide` strip: pick a gateway server, point a domain at it, send paths where they belong.                                                                                                                                |
| No sense of how many exist or whether they serve traffic.                                  | Four `StatTile`s: total, serving traffic, setting up, needs attention. **These filter**: `pkg/drouter/variables.go` lists `installer_status` in `AllowedFilterQueryRouter`, so the narrowing is server-side.                          |
| Filter strip in a `Card` with an unlabelled refresh.                                       | The servers filter strip: collapsible search over domains, refresh with `aria-label`/`title`, the view control, and an active-filter row where the search term and the status clear independently.                                    |
| A hand-rolled CSS-grid table with `min-w-[1080px]`, rendered by the "card list view" icon. | The shared `Table` atoms in a `rounded-2xl border bg-card` surface at `min-w-[820px]`: domain and engine, status pill carrying the state message as its tooltip, gateway server and address, routing summary, last modified, actions. |
| Generic 🙇 `EmptyState`.                                                                   | The accented empty state saying what you need first — a gateway server and a domain — with a link to server creation; a separate dashed state when filters hide results.                                                              |
| Loading shimmer that did not match the view.                                               | Shimmers shaped like the grid or the table that is loading.                                                                                                                                                                           |
| No help panel.                                                                             | `AsideHelpSupport` on `xl` and up, which needed `widget.helpAndSupportFull.topic.loadBalancer` in both dictionaries.                                                                                                                  |

### A deliberate deviation from the standard

The standard says `auto` resolves to a **list** of row cards on desktop. This
module offers **grid and table only**, and `auto` resolves to the table on
desktop. A load balancer row is inherently tabular — domain, status, gateway,
routing, timestamps — and the existing `full` card variant was already a
five-column grid row rather than a standalone card. Rather than keep a
"card list view" icon that renders a table, as the domains module did, the
option is gone. `?viewMode=list` still resolves, to the table, so older
bookmarks keep working.

### A crash fixed on the way

`-models/lb-data.ts` mapped the response with
`toLoadBalancerCard(router).unwrap()`, which throws. One malformed router
would blank the entire list instead of hiding one card. It now drops the bad
row, as the overview does. This is the same defect the domains module had.

## Honest gaps

- **An L7 load balancer with no routing rules cannot be represented at all.**
  `schemaLoadBalancerCard` requires `configuration.rules` to have at least
  one entry for an `l7` kind, and `ctorConfiguration` only falls back to a
  legacy `upstream` field. A router that exists but has not been given a rule
  yet — which is what a half-finished creation looks like — therefore fails
  to parse and is dropped. Before this PR it threw and took the page with it;
  now it is silently missing. Neither is right: a provisioning load balancer
  should be visible, with its state. Fixing it means relaxing the entity
  schema, which the detail panel also depends on, so it is reported rather
  than changed here. There is a test pinning the current behaviour.
- An empty `domain` string still produces a card rather than being rejected,
  so such a row renders with whatever the domain transform falls back to.
  Worth a look when the schema above is revisited.
- The tiles' per-state counts come from the first 100 routers; the strip says
  so. The total is exact.

## Next

1. **Verify on a signed-in environment** with load balancers in more than one
   state, and ideally one that is still provisioning, to see the gap above.
2. **The create flow**, which should follow the flow-page anatomy:
   `StepCard`s for gateway, domain and routes, with a `ReviewPanel`.
3. **The detail route**, on the detail anatomy: stat tiles, a "what you can
   do next" strip, the routing rules, access and error signals, and a danger
   zone last.
