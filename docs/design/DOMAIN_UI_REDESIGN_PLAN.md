# Domains & DNS: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: the domain list at
`/backend/domain` and the add-domain flow at `/backend/domain/create`, both
rebuilt on the house style in `UI_UX_STANDARD.md` and the blocks the servers
module introduced (`SERVERS_UI_REDESIGN_PLAN.md`). Next: the domain detail
panel.

## Who this module is for

The confusion here is not what a domain is. Every user of this page owns one
already. The confusion is **registrar versus DNS provider**: people arrive
expecting to be asked to transfer the domain, and the page asks instead for
an API token from whoever answers DNS for it. If you have only ever bought a
domain and pointed it at shared hosting, those are the same company, and the
distinction is invisible until something asks you to separate them.

So the module is designed around one journey:

> I own a name → I want it to point at the server I just made → dNocs needs
> to talk to my DNS provider, not my registrar → the record is written for me.

## What changed

### Route — domain list (`/backend/domain`)

| Before                                                                                                                                                 | After                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader`, a prose footnote pointing at YouTube, and "View your registered domain and DNS here."                                                    | `FlowHero` in the sky accent: breadcrumb, globe tile, a description that names the registrar/provider split, links to Servers and the docs, and the primary "Add a domain" action.                        |
| Nothing explained what dNocs wants access to.                                                                                                          | A three-step `Guide` strip — add the domain, dNocs reads the zone, point a name at a server — opening with the sentence that dNocs neither sells nor moves domains.                                       |
| No sense of how many domains exist or who runs their DNS.                                                                                              | Four `StatTile`s: domains, DNS providers, shared with a team, only you. They report rather than filter: the find endpoint filters by `provider` but not by ownership, and these tiles describe ownership. |
| Filter strip in a `Card`, unlabelled refresh, three view modes.                                                                                        | The servers filter strip: collapsible search, refresh with `aria-label`/`title`, the four-way view control, and a clearable keyword badge.                                                                |
| **"Card list view" showed a table.** `derivedViewMode === 'list'` rendered `DomainTable`, so the control's icon lied and there was no row view at all. | Three honest modes: `list` is a real row, `grid` is the compact card, `table` is the dense view. `auto` resolves to list on desktop and grid on phones, as on `/servers`.                                 |
| A bespoke CSS-grid table with a hard `min-w-[1040px]`.                                                                                                 | The shared `Table` atoms in a `rounded-2xl border bg-card` surface, `min-w-[680px]`, matching servers, SSH keys and cloud accounts.                                                                       |
| The domain name was plain text; only the eye icon opened details.                                                                                      | The name is the link, as in every other list. The identity block emits `open--details` itself, so all three views behave the same.                                                                        |
| Generic 🙇 `EmptyState`.                                                                                                                               | The accented empty state explaining that you keep your registrar, with "Add a domain" and a link to server creation; a separate dashed state when a search hides domains.                                 |
| Loading shimmer that did not match the view.                                                                                                           | Shimmers shaped like the list, grid or table that is loading.                                                                                                                                             |
| No help panel.                                                                                                                                         | `AsideHelpSupport` on `xl` and up, like the other backend pages. This needed `widget.helpAndSupportFull.topic.domain`, added in both dictionaries.                                                        |

### A crash fixed on the way

`-models/domain-data.ts` mapped the API response with
`AdapterDomainFromDto.toDomainCard(domain).unwrap()`. `unwrap()` throws, and
the domain schema rejects anything `tldts` cannot parse into a hostname and a
public suffix. One malformed row — an empty `domain`, a hostname with no TLD,
a legacy record — would therefore throw inside the adapter and blank the
entire list rather than hiding one card. It now uses `.okay()` and drops the
bad row. The overview model does the same, and the behaviour is covered by a
test that feeds it an empty string and a space-separated non-domain.

## Honest gaps

- The tiles report instead of filtering. The find endpoint accepts a
  `provider` filter, so a provider chip row is the natural next step if users
  turn out to hold domains across several providers; ownership has no filter.
- The provider brand table in `entities/domain/ui/constants/provider.tsx`
  lists nine providers but has real brand icons for two, Cloudflare and
  DigitalOcean. The rest fall back to generic lucide glyphs, so a GoDaddy
  domain and a Netlify domain look alike. The servers module solved the same
  problem with logo files on white tiles; domains deserve the same.
- Several `page.domain` strings describe a detail view that this plan has not
  reached yet: `credentials`, `credentialsRedacted`, `zoneApex`, `managedDns`,
  `sections.*`. They are left in place for the detail work rather than being
  pruned now.

## Next

1. **Verify on a signed-in environment** with domains across more than one
   provider, and at least one record the schema rejects, to see the drop
   path rather than trusting the test.
2. **The add-domain flow** at `/backend/domain/create`, which is where the
   registrar/provider confusion actually bites, and which should follow the
   flow-page anatomy: `StepCard`s and a `ReviewPanel`.
3. **The domain detail panel**, on the detail anatomy: stat tiles, a "what
   you can do next" strip, the DNS records, and a danger zone last.

## The add-domain flow (`/backend/domain/create`)

### What it was

One file of 1,234 lines. It was already closer to the house shape than most
— three sections in a main column, an aside, a sticky action bar — but it
carried its own chrome for all of it:

- `PageHeader` rather than `FlowHero`.
- A bespoke `SetupProgress` strip plus a bespoke `SectionCard` wrapper, where
  the standard has one component, `StepCard`, that is both.
- **Three** aside cards — `ReviewCard`, `ReadinessCard` and `SecurityCard` —
  the first two saying overlapping things about the same form.
- **Two** copies of the submit and cancel buttons, one in the header and one
  in a sticky bottom bar, so "one clear next action per screen" was three.

### What it is now

- `FlowHero` whose description names the registrar/provider split, the same
  sentence the list page leads with.
- Three `StepCard`s: Domain, DNS provider, Credentials. The number becomes a
  check mark as each is satisfied and the first unfinished one takes the
  accent. The sections no longer wrap themselves; the step is the container.
- One `ReviewPanel` replacing `ReviewCard` and `ReadinessCard`, holding the
  three facts and the single primary action, which enables only when all
  three are done and a provider contract resolved.
- `SecurityCard` kept, under the panel. It says where the credential is
  stored, which is the one question this page provokes and nothing else
  answers.
- The duplicate action bars are gone.

### The split

| File                             | Holds                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| `index.tsx`                      | Route, hero, the three steps, the review panel.              |
| `-rules/form.ts`                 | The zod schema, its type, domain normalising and validation. |
| `-lib/providers.ts`              | Provider contracts, credential fields, payload and rules.    |
| `-usecase/use-create-domain.ts`  | The create request, its toasts and the redirect.             |
| `-view/SectionDomain.tsx`        | Domain and description fields.                               |
| `-view/SectionProvider.tsx`      | Provider picker, its options and loading state.              |
| `-view/SectionCredentials.tsx`   | Per-provider credential inputs.                              |
| `-view/-presentation/fields.tsx` | `FieldLabel`, `SecurityCard`, the requirement renderer.      |

1,234 lines became 916 across eight files, with the largest at 287.

### Still open on this page

- Nothing here says what happens after the domain is added: dNocs reads the
  zone, and the records it finds are not shown until the detail panel exists.
  The review panel's footnote says it; the flow does not show it.
- The credential fields come from the provider contract, so their labels and
  help text are the backend's. They have not been read with a beginner in
  mind, and "API token" means different things at different registrars.
