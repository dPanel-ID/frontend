# Load balancers: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: the load balancer list at
`/backend/load-balancers` and the create flow at
`/backend/load-balancers/create`, both rebuilt on the house style in
`UI_UX_STANDARD.md` and the blocks the servers module introduced
(`SERVERS_UI_REDESIGN_PLAN.md`). Next: the detail route.

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

## The create flow (`/backend/load-balancers/create`)

### What it was

One file of 2,657 lines holding a three-step wizard — gateway, routing,
preview — plus every picker, every rule builder, and about thirty helper
functions. `RULES.md` asks for a slice anatomy and the standard forbids a
numbered wizard that hides what is missing; this was both problems at once.

Worse for the user: the wizard gated progress. You could not see what the
routing step wanted until the gateway step validated, and the preview step
existed only to show you what you had already typed.

### What it is now

The flow-page anatomy from the standard, the same shape as
`/servers/create/vm-instant`:

- `FlowHero` instead of `PageHeader`, with the breadcrumb and the docs link.
- **Three `StepCard`s, all visible at once**: Gateway (server and engine),
  Domain and HTTPS, Routing. The number becomes a check mark as each one is
  satisfied, and the first unfinished card carries the accent.
- A sticky **`ReviewPanel`** holding the six facts that matter — gateway
  server, engine, domain, HTTPS, routing mode, routes — and the one primary
  action, enabled only when the form parses and an engine runtime resolved.
- The preview step is gone. It said nothing the review panel does not say
  continuously, and it cost a click.

One validation pass over the whole form drives every "done" mark, so the
panel can never disagree with what submit will accept — the same technique
the cloud VM flow uses.

### The split

| File                             | Holds                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| `index.tsx`                      | Route, hero, the three steps and the review panel.               |
| `-model/form.ts`                 | Form types, `DEFAULT_VALUES`, page size.                         |
| `-model/resources.ts`            | `useLoadBalancerCreateResources` and its `CreateResources` type. |
| `-lib/modules.ts`                | Module catalog, inventory merge, engine metadata, runtime item.  |
| `-lib/payload.ts`                | Route preview rows and `toCreateLoadBalancerPayload`.            |
| `-usecase/use-create.ts`         | The create request, its toasts and the redirect.                 |
| `-view/SectionGateway.tsx`       | Server picker, engine picker and their option cards.             |
| `-view/SectionDomain.tsx`        | Domain field, external and managed.                              |
| `-view/SectionRouting.tsx`       | Mode picker, protocol and TLS, L7 and L4 rule builders.          |
| `-view/-presentation/fields.tsx` | `SectionIntro`, `FormField`, `ChoiceButton`, `StateBlock`.       |

The pickers and rule builders were kept as they were. They are the part
`AGENTS.md` cares about — they already expose upstreams, applications,
static paths, engine modules and their installation state — and rewriting
them would have risked that detail for no gain.

### Still open on this page

- The engine picker can install an infrastructure module as part of
  creation. That is a long-running action, and the flow says nothing about
  how long it takes or what happens if it fails mid-way; the standard asks
  every long-running action to say what happens next.
- `-view/SectionRouting.tsx` is still 540 lines. The L7 rule builder and its
  destinations want their own files once someone touches them again.
