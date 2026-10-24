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

---

# The detail page (`/applications/$id`)

Second pull request of the four. The list was shipped first; this is the
page it leads to.

## What a beginner was up against

The old page opened with the legacy `PageHeader`, then went straight into a
two-tab panel labelled **Artifacts** and **Deployments**. Neither word means
anything to someone who writes PHP and has just connected a repository, and
nothing on the page said how the two relate. There were no numbers at the
top, so the first question anyone has — _is my app actually running?_ — took
reading a card to answer. Configuration sat in the aside, although it is
the thing the page is most often opened for.

## The rebuild, block by block

Detail anatomy from the standard: hero, the numbers, what you can do next,
the resource's own sections, danger zone last.

| Block           | What it is now                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero            | `FlowHero` with the breadcrumb, the app name, a sentence naming the repository and the server, a `StatusPill` for the whole app, and the GitHub control. |
| Overview        | Four `StatTile`s: serving now, last build, builds kept, port. None of them filters anything, so none of them is a button.                                |
| Next steps      | Three cards — build and release, see what it is doing, change how it builds — above a sentence explaining that building and releasing are two steps.     |
| Builds/releases | One section, one segmented control: **Builds** and **On servers**. The tabs are gone and so is the word "artifact" in the UI.                            |
| Logs            | Unchanged in behaviour; the header matches the other sections and the block carries the anchor the next-steps card jumps to.                             |
| Configuration   | The old aside accordion, moved into the main column, retitled "How this application is set up".                                                          |
| Danger zone     | Last, and now says what deleting removes, what it stops, and what it leaves alone.                                                                       |
| Aside           | `AsideHelpSupport` at `xl` and up, carrying nothing the main column needs.                                                                               |

## Vocabulary

"Artifact" and "deployment" stay in the code, the models and the API. In
the interface they are **build** (your code packaged once) and **release**
(that build placed on one server), and the section header says exactly that
in one line.

## Defects fixed on the way

**The build status badge never rendered.** `ArtifactCard` keyed its status
badge and its coloured border off a `deploymentStatus` prop that `_List.tsx`
never passed, so `StatusBadge` returned `null` on every card and
`mapDeploymentStatus` in `_lib/` was dead code that nothing called. Every
build looked identical whether it had passed, failed or was still running.
The status is now computed by `releaseStatusOfArtifact` and passed down, and
the badge is a shared `StatusPill` rather than a hand-rolled one.

**One bad build could blank the page.** `-model/artifact-history.ts` used
`toCicdArtifact(...).unwrap()`. Fourth module with this defect, after
domains, load balancers and the applications list. A shared mapper helper
or a lint rule would be cheaper than finding the fifth.

**About 450 lines of dead code.** `ServiceActions/`, `ServerStats/` and
`-model/server-usage.ts` were never rendered and their provider was never
mounted — including a model that would have polled three endpoints every few
seconds had anything used it. Also removed: the duplicated `EmptyState`
presentation component, and `_lib/mapDeploymentStatus` described above.

**Hard-coded English.** "New Artifact", "Rollback", "Build ID", "Artifact
not found", "Start", "Stop", "Restart", "No description available" and about
twenty more were literals in JSX. All are now keys, in both dictionaries.

## The GitHub login that was not there

Reported while this page was being built: there is no way to connect GitHub
from `/applications`, `/applications/create` or the detail page.

The module had exactly one GitHub control, `GithubSessionBanner`, and it
only appeared when `!gitProfile || isGithubAuthFailure(response)`. Both
halves of that test are weaker than they look:

- `gitProfile` is non-null as soon as the account carries **any** stored
  token, a revoked one included, so it cannot stand for "connected".
- `isGithubAuthFailure` matches on a 401 or on the strings "bad credentials"
  and "requires authentication". Any other failure — a 403, a rate limit, a
  network error, different wording — is not recognised.

So a token that had quietly gone stale produced no banner and no button
anywhere, and someone who simply wanted to connect a different account had
nothing to click either.

`useGithubConnection` (`applications/-lib/github-connection.ts`) now reports
four states, and only a successful `/git/user` call counts as connected:

| State          | Meaning                                        | What is shown                          |
| -------------- | ---------------------------------------------- | -------------------------------------- |
| `connected`    | GitHub confirmed the account                   | the handle, with "Reconnect" behind it |
| `unverified`   | a token is stored, GitHub would not confirm it | an amber "Reconnect GitHub" button     |
| `disconnected` | no token at all                                | "Connect GitHub"                       |
| `checking`     | the call is in flight                          | a disabled spinner                     |

`GithubAccountButton` renders that, and it is mounted in the hero of the
list, the hero of the detail page and the header of the create flow — so
there is always something to click, connected or not. The banner now raises
on `unverified` as well, instead of waiting for an error whose wording the
matcher happens to know.

## Tests

`-lib/describe-detail.test.ts`, 15 cases over the status mapping: that a
running build outranks the release it is about to replace, that a failed
build only becomes the headline when nothing is serving, and that a server
with two releases is counted once.

## Honest gaps

- The page still has no live service state of its own. The running state
  comes from each deployment card's own poll of
  `/service/origin/$serverId/detail/$serviceName`; the hero's pill is
  derived from release records, not from the service. Wiring the service
  state up to the hero needs an endpoint that answers for the application
  rather than per service.
- `ApplicationDetail` has no `state` field, unlike `ApplicationCard`. That
  is why the headline is computed from history rather than read.
- `AppCard`'s dead `full` variant is still there; this pull request did not
  touch that file.

## Next

1. **The create flow** (`/applications/create`), a six-step wizard of about
   4,000 lines — the largest single piece left in the product.
2. **The update page** (`/applications/$id/update`).
