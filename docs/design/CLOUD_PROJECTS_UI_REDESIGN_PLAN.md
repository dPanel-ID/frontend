# Cloud accounts: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: the cloud accounts list at
`/backend/cloud-projects`, rebuilt on the house style in `UI_UX_STANDARD.md`
and the blocks the servers module introduced (`SERVERS_UI_REDESIGN_PLAN.md`).
Next: the connect-account modal and the account detail modal.

## Who this module is for

The misconception this page has to clear up is not "what is a cloud account"
but "whose cloud is it". dNocs does not resell servers. You connect the
provider account you already pay for, and dNocs drives it on your behalf.
Someone who has not understood that cannot judge what connecting an account
commits them to, or who will bill them for the VM they are about to launch.

So the module is designed around one journey, the same one the SSH key page
serves from the other side:

> I want a VM → dNocs needs somewhere to create it → I connect the provider
> account I already have → I go straight back to creating the server.

## What changed

### Route — cloud accounts list (`/backend/cloud-projects`)

| Before                                                                                                                                 | After                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader` with an outline "Connect Account" button and a footnote listing supported providers in prose.                             | `FlowHero` in the sky accent: breadcrumb, cloud tile, one-sentence description, links to Servers and the docs, and the primary "Connect a cloud account" action.                                                                                           |
| No explanation of what connecting an account means.                                                                                    | A three-step `Guide` strip — connect your provider, dNocs reads what you can launch, launch a server — stating plainly that your provider bills you, with "Create a server" as its call to action.                                                         |
| No sense of how many accounts exist or whether they work.                                                                              | Four `StatTile`s: total, ready, connecting, needs attention. **These filter**, unlike the SSH key tiles: `pkg/dcloud/variables.go` lists `installer_status` in `AllowedFilterQuery`, so the narrowing happens server-side and the page count stays honest. |
| `installer_status` was read from the API, passed into the table's data, and then never rendered.                                       | Every view shows it as a `StatusPill`, pulsing while the state is still moving, with failed and connecting accounts also carrying a coloured card border.                                                                                                  |
| Filter strip in a `Card` with an unlabelled refresh and three view modes.                                                              | The servers filter strip: collapsible search, refresh with `aria-label`/`title`, the four-way view control, and an active-filter row where the search term and the status are each individually clearable.                                                 |
| `auto` resolved to a dense table on desktop.                                                                                           | `auto` resolves to the rich list on desktop and the grid on phones, as on `/servers`.                                                                                                                                                                      |
| Two copies of a `PROVIDER_META` map, one in `CloudCard` and one in `CloudTable`, each with its own provider list and its own fallback. | The shared `CloudProviderLogo` molecule, which already knows seven providers, renders them on a white tile so dark marks read in both themes, and falls back to initials. One list, one fallback.                                                          |
| `ResourceCard.Compact` cards and a bespoke table.                                                                                      | Three renderings of one view model: `CloudProjectRow`, `CloudCard`, `CloudTable`, all sharing the identity block, the status pill and the access pill.                                                                                                     |
| Generic 🙇 `EmptyState` with a dead CTA.                                                                                               | The accented empty state wired to the connect modal, plus a link to the create-server page; a separate dashed state when filters hide accounts, with a clear button.                                                                                       |
| Loading shimmer that did not match the view.                                                                                           | Shimmers shaped like the list, grid or table that is loading.                                                                                                                                                                                              |
| Actions: view regions, migrate ownership, delete.                                                                                      | Plus "Create a server here", which opens `/servers/create/vm-instant?provider=…` with this account's provider preselected.                                                                                                                                 |
| "Are you sure you want to delete X?"                                                                                                   | The dialog now says what disconnecting does: dNocs forgets the API key and stops managing the account, and servers already running at the provider keep running and keep billing you.                                                                      |

### Removed

`-view/FilterBar`, `-view/GridList` and the whole `-presentation/` folder
(`AddNewCard`, `CloudProjectCard`) were dead or superseded. Deleting them
leaves the module with one card system.

### Added outside the slice

- `src/shared/api/cloud.project.find.ts` gained an `installerStatus` param,
  mapping to the backend's documented `installer_status` filter. No new
  contract: the handler's annotations and `AllowedFilterQuery` already list it.
- `widget.helpAndSupportFull.topic.cloud` was missing from both dictionaries,
  so the help panel rendered the raw message key in production, exactly as
  `topic.ssh` did. Added in English and Indonesian.

## Honest gaps

- **The Find DTO claims `clouds` is always present.** It is typed
  non-optional, so the lint rule forbids a fallback, yet two other call sites
  (`DashboardView`, `SectionCloud`) guard it with `?? []`, and one of those,
  `cloudProjectsData?.clouds.length`, would throw if the field were ever
  absent. Either the type is wrong or those guards are. Fixing it means
  editing `DashboardView.tsx`, which is in another lane's hands right now, so
  this is reported rather than changed.
- Per-state counts come from the first 100 accounts; the strip says so. The
  total is exact.
- The page offers no provider filter, although the backend supports one. Four
  status tiles plus provider chips would crowd the top of the page; if users
  turn out to have accounts at many providers, chips are the natural next
  step.

## Next

1. **Verify on a signed-in environment.** Built and checked locally; the
   pages have not been exercised against real accounts in more than one state,
   since a test workspace tends to have everything `ready`.
2. **The connect-account modal**, which is where the real beginner anxiety
   lives: it asks for an API key and currently explains little about what
   dNocs will do with it.
3. **The account detail modal**, which should follow the detail anatomy in
   the standard: stat tiles, a "what you can do next" strip, the regions and
   sizes the account exposes, and a danger zone last.
