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

---

# Choosing a branch in the create flow

Reported after the detail page shipped: the GitHub step offers no branch.

`SectionSourceGithub` wrote `gitBranch: defaultBranch` both when a
repository was picked and when its detail response arrived, and nothing
could change it afterwards. Anyone whose work sits on `develop`, on a
release branch or on anything other than the repository default had to
create the application against the wrong branch and then edit it.

`BranchPicker` lists the repository's branches from
`/v1/git-branch/find` — the same endpoint the artifact sidepanel already
uses — under the "repository selected" strip, with the default marked as
such. Three details worth keeping:

- **The commit head moves with the branch.** `gitBranch` without `gitHead`
  would build the default branch's commit under another branch's name. The
  picker sets both, from the branch's own `commit.sha`.
- **The stale commit message is dropped.** `gitHeadDescription` holds the
  default branch's head message; the branch list carries no message, so
  picking another branch clears it rather than labelling the artifact with
  the wrong commit.
- **Config is seeded once per repository.** The detail response arrives
  again on every refetch, and re-seeding would have reset a branch the user
  had just picked. A ref records which repository has been seeded.

The preview step now names the branch that will be built, and the branch
list degrades honestly: a failed call says dNocs will build the default
branch, and a GitHub auth failure says to reconnect rather than showing an
empty list.

---

# The create flow and the update page

Third pull request. These two routes share one set of files —
`MainWizard`, `Layout`, the stores, `handle-deploy`, `handle-update` — so
they are redesigned together.

## What was wrong

The flow was a six-step wizard: one step on screen, Back and Continue at
the top and bottom of every step, a progress strip above. Principle 2 of
the standard argues against exactly this — _show readiness, not steps_.
Three concrete costs:

- A beginner could not see the shape of the job. You learn there is a
  dependency step when you arrive at it.
- Deploy lived inside the last step and was reachable only after walking
  four screens.
- Going back to check something meant losing your place.

## First attempt: all sections visible — reverted

The first rebuild put every section on screen at once as `StepCard`s with a
sticky `ReviewPanel`, following the flow anatomy literally. It was wrong
here and was reverted the same day.

The load-balancer flow has three short sections. This one has five, and two
of them — the server-and-dependency picker and the build configuration —
are long on their own. Stacked, the page became a very long scroll, and on
a phone, where the review panel drops below all five sections, the primary
action ended up further from the user than it had been in the wizard. The
standard's own responsive rule (checked at 1440, 1024 **and 375**) is what
caught it.

The lesson is worth recording: _show readiness, not steps_ is about making
what is missing visible, not about putting every field on one page. A
stepper that marks finished sections and a Continue button that says why it
is disabled satisfy the principle at a fraction of the height.

## What it is now

Hero, a stepper, one section at a time, and a single sticky action row.

| Before                                   | After                                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `PageHeader`                             | `FlowHero`, accent `sky`, with the GitHub control and a duration line.                       |
| `AsideProgress` strip                    | Gone. The review panel is the progress.                                                      |
| One step visible, `MainWizard` switching | All five `StepCard`s, numbered, each turning to a check when satisfied.                      |
| Ten `CtaBar`s (two per step)             | One primary action, in the review panel, disabled until the sections it depends on are done. |
| Deploy inside step 6                     | `-usecase/submit-flow.ts`, owned by the review panel.                                        |
| `canClickNext()` gating Continue         | `-model/flow-readiness`, the same rules, now reporting rather than gating.                   |
| `Sectioned withinCard` inside each step  | Unwrapped — a card inside a `StepCard` is a nested card, which the standard forbids.         |

A section whose prerequisites are not met still appears, with its body held
back and a line naming the section to finish first. The job is visible from
the start; only the parts that genuinely depend on earlier answers wait.

## The rule that nearly got lost

Step 3 computed `isNextDisabled || portState.isPortUsed`. The port check
lived in the view, in a hook that also fetches the server's used ports and
auto-picks a free one — so it could not simply be called again from the
readiness model without running that fetch and that side effect twice.

`useCommandPortState` now publishes the conflict into the form store
(`portConflict`), and `evaluateFlowReadiness` reads it. One writer, many
readers, one fetch. Without this the review panel would have offered a
deploy that fails at install time. It has a test of its own.

## Tests

`-model/flow-readiness/index.test.ts`, 9 cases: that a branch _and_ a head
are both required, that a bundle source needs no git config at all, that
the port conflict blocks the details section, and that the update flow
drops the source section.

## Honest gaps

- `step-2-details` is 1,360 lines and `handle-deploy/config.ts` is 817.
  Neither was touched; they are re-hosted, not rewritten.
- The branch list is whatever `/v1/git-branch/find` returns, which is
  GitHub's first page — 30 branches on the dnocs repositories. A repository
  with more will not show them all. The combobox has search, but it filters
  what was fetched. Paging that endpoint is a backend change.

## Next

The module's four routes are done. What remains is cross-cutting: four
modules have now shipped the same `.unwrap()` crash, and a shared mapper
helper or a lint rule would be cheaper than finding the fifth.

---

# The detail page, on tabs

The one-page detail view was wrong for the same reason the one-page create
flow was: five sections stacked make a wall. The page now works like the
server detail page, and like Vercel's project view — a hero that stays, and
four tabs, each a shareable URL (`?tab=deployments`).

| Tab             | What is in it                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Overview**    | The current deployment, four stat tiles, Details, and the last five builds.                           |
| **Deployments** | The builds / on-servers section, full width.                                                          |
| **Logs**        | Runtime logs, plus load-balancer requests when one is attached.                                       |
| **Settings**    | Repository, Build (language, steps, env), Runtime (service, port, command, env), and the danger zone. |

## Overview, designed around the first question

The first thing anyone opening an application wants to know is _what is
live_. The old page made you read a list of build cards to work it out.

`CurrentDeployment` answers it in one block: the commit title, its branch
and short sha, who pushed it, which server it is on, how long ago, and a
status pill — then the actions that follow from it (view logs, redeploy).
When nothing has been released it becomes an empty state that explains the
first build rather than showing an empty card.

Under it: the four tiles, a Details list (repository, branch, server,
service, working directory, owner, created) and the last five builds with a
link into the Deployments tab.

## Load-balancer logs

`/v2/load-balancer/{id}/logs` existed in the API client and had no caller.
The Logs tab uses it, in the same `LogViewer` the runtime logs use, with
the same time-range control — but the source toggle only appears when a
load balancer is actually attached to the application. There are none in
this workspace today, so for now the tab shows runtime logs alone, which is
what it should do.

## Environment values are no longer rendered

The old configuration panel printed env values and fell back to `••••••`
only when a value was absent. An environment variable is as likely to hold
a token as a feature flag, so values are masked unconditionally now.

## Honest gaps

- **No domain on the detail response.** `ApplicationCard` carries
  `additionalInfo.domain`; `ApplicationDetail` does not, so the current
  deployment card has no "Visit" button. Adding `domain` to the detail
  response would give the overview its most obviously missing link.
- The hero's status pill is still derived from release history rather than
  a live service state, as noted above.
