# Applications: UI/UX redesign plan

Status: in progress, 2026-10-24. Done so far: the application list at
`/applications`, rebuilt on the house style in `UI_UX_STANDARD.md` and the
blocks the servers module introduced (`SERVERS_UI_REDESIGN_PLAN.md`). Next,
in this order: the detail page, the create flow, the update page.

This is the largest module in the product — about 13,800 lines across four
routes — so it is deliberately being done one route per pull request rather
than in one change.

## Who this module is for

The misconception here is that dNocs hosts your code. It does not. It reads
the repository you point it at, builds that into an artifact, and installs
the artifact on a server you already own. Someone arriving from shared
hosting or from a PaaS expects "deploy" to mean "upload to their cloud", and
will not understand why the page keeps asking which server to use, or why
nothing can be deployed before a server exists.

## What changed on the list

| Before                                                   | After                                                                                                                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PageHeader` with an outline button.                     | `FlowHero` in the sky accent: breadcrumb, description that says where the code runs, links to Servers and the docs, and the primary "Create an application" action.                                    |
| No explanation of the repo → artifact → server path.     | A three-step `Guide` strip, ending at the create flow.                                                                                                                                                 |
| No sense of how many applications exist or how they are. | Four `StatTile`s: total, running, building, needs attention. They report rather than filter: `AllowedFilterQuery` in `pkg/dapplication` has no `installer_status`, so a clickable tile would be a lie. |
| Filter strip in a `Card` with an unlabelled refresh.     | The servers filter strip: collapsible search over names, refresh with `aria-label`/`title`, the view control, and a clearable keyword badge.                                                           |
| A hand-rolled CSS-grid table with `min-w-[980px]`.       | The shared `Table` atoms at `min-w-[840px]`: name and bundle, a status pill, the repository, the servers it runs on, last modified, actions.                                                           |
| Generic 🙇 `EmptyState`.                                 | The accented empty state saying a server comes first, with a link to server creation; a separate dashed state when a search hides results.                                                             |
| Loading shimmer that did not match the view.             | Shimmers shaped like the grid or the table that is loading.                                                                                                                                            |
| No help panel.                                           | `AsideHelpSupport` on `xl` and up, using the `application` topic that already existed in both dictionaries but had no caller.                                                                          |

### Two defects fixed on the way

**The list could be blanked by one bad record.** `-model/apps-data.ts` mapped
the response with `toApplicationCard(...).unwrap()`, which throws. This is
the third module with the same defect, after domains and load balancers.

**The page showed four applications at a time.** `limit: 4`, where every
other list uses eight or ten. With a table header above it, four rows looked
like a bug. It is now eight.

### A deliberate deviation

As with load balancers, this module offers **grid and table only**, and
`auto` resolves to the table on desktop. An application row is inherently
tabular, and the existing `full` card variant was already a five-column grid
row rather than a standalone card. `?viewMode=list` still resolves, to the
table, so older bookmarks keep working.

## Honest gaps

- An application carries two states, the last build and the running service.
  The list shows one headline status derived from both, with the service
  winning; that is a judgement, and the detail page should show both
  separately.
- `AppCard` is 699 lines and still carries both variants, although only the
  compact one is used now. The `full` branch is dead and should go when the
  detail work touches this file.

## Next

1. **The detail page** (`/applications/$id`), on the detail anatomy: hero,
   stat tiles, the artifact history, logs, and a danger zone last.
2. **The create flow** (`/applications/create`), a six-step wizard of about
   4,000 lines — the largest single piece left in the product.
3. **The update page** (`/applications/$id/update`).
