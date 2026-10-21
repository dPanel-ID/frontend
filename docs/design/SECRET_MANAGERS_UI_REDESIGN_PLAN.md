# Secret managers: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: the SSH key list, the SSH key
detail page and the create-key modal, rebuilt on the house style in
`UI_UX_STANDARD.md` and the blocks the servers module introduced
(`SERVERS_UI_REDESIGN_PLAN.md`, which left SSH keys explicitly out of scope).

## Who this module is for

Almost nobody opens `/backend/secret-managers/ssh-key` because they want an
SSH key. They open it because they want a server and something told them a
key comes first. A large share of them are PHP or WordPress developers who
have never run `ssh-keygen`, and the old page gave them a grid of cards, an
"Add more" tile and no explanation of what any of it was for.

So the module is designed around one journey:

> I want a VM → I am told I need an SSH key → I create one without learning
> anything I did not need → I go straight back to creating the server.

## What changed

### Route 1 — SSH key list (`/backend/secret-managers/ssh-key`)

| Before                                               | After                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader` with an outline "Add SSH Key" button.   | `FlowHero` in the sky accent: breadcrumb, key tile, one-sentence description, a link to Servers, docs, and the primary "Create SSH key" CTA.                                                                                  |
| No explanation of what an SSH key is.                | A three-step `Guide` strip: create a key → dNocs keeps it safe → pick it when you create a server, with "Create a server" as its CTA.                                                                                         |
| No sense of how many keys exist or who can use them. | Three `StatTile`s: total, personal, shared with a team. They report and do not pretend to filter, because the find endpoint has no ownership filter; when the workspace is larger than the 100-key sample, the strip says so. |
| Filter strip in a `Card` with an unlabelled refresh. | The servers filter strip: collapsible search, refresh with `aria-label`/`title`, four-way view control (auto, list, grid, table), and a clearable keyword badge.                                                              |
| `auto` resolved to a dense table on desktop.         | `auto` resolves to the rich list on desktop and the grid on phones, as on `/servers`.                                                                                                                                         |
| `ResourceCard.Compact` cards and a bespoke table.    | Three renderings of one view model: `SshKeyRow` (identity, access pill, owner, created, updated, five icon actions), `SshCard` (grid tile with a "more" menu), `SshTable` (shared `Table` atoms in a `rounded-2xl` surface).  |
| Generic 🙇 `EmptyState` with a dead CTA.             | The accented empty state: what a key is for, "Create SSH key" (which opens the modal) and a link to the create-server page; a separate dashed state when a search hides keys, with a clear button.                            |
| Loading shimmer that did not match the view.         | Shimmers shaped like the list, grid or table that is loading.                                                                                                                                                                 |
| Actions: details, migrate ownership, delete.         | Plus "Copy public key" (public half only, with an honest toast when the list payload carries none) and "Create a server with this key".                                                                                       |

### Route 2 — SSH key detail (`/backend/secret-managers/ssh-key/$id`)

- `FlowHero` header carrying the key's name and `type · bits`.
- Four stat tiles: type, bit length, created, last modified.
- A "what you can do with this key" strip whose action is creating a server.
- Public key panel, labelled safe to share, with a copy button that reports
  failure instead of silently doing nothing.
- Private key panel that explains where the key lives and why it is never
  shown. No reveal control exists, by design.
- Danger zone last, with the consequence spelled out.

### Modal — create SSH key (`features/ssh-create-modal`)

- Every string moved into both dictionaries; the modal had been English-only.
- Key-length choices use the shared accent tokens, carry `aria-pressed`, and
  keep the "Recommended" badge clear of the number.
- A "what happens next" note after the form, so the user knows the key is
  stored encrypted and where they will pick it up again.
- The name field now accepts hyphens, which the placeholder had been
  suggesting (`work-laptop`) while the validation rejected them.

## Removed

`-view/FilterBar`, `-view/ModeSshKey`, `-presentation/*` and
`$id/-presentation/*` were dead or superseded card templates. Deleting them
leaves one card system in the module.

## Honest gaps

- The find endpoint takes only `name`, `page` and `limit`. There is no
  ownership filter and no "used by N servers" count, so the UI does not
  pretend to offer either. Both are worth asking the backend for: "which
  servers use this key" is the question users actually have on the detail
  page.
- Counts other than the total come from the first 100 keys. The strip says so
  rather than quietly rounding.
- The create modal cannot yet hand the user straight to the create-server
  page after a key is made; the natural follow-up is to offer that in the
  success toast or to return the new key to the caller.

## Next

1. **Verify against a signed-in environment.** The redesign was built and
   type-checked locally, but the dev API was not reachable from this machine,
   so the pages were not exercised with real data. Do this before release.
2. **Other secret-manager surfaces.** Whatever joins SSH keys under
   `/backend/secret-managers` follows this same anatomy.
3. **Close the gaps above** with the backend, in this order: key usage per
   server, then an ownership filter.
