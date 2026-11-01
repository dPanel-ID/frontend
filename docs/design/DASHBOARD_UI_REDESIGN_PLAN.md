# Dashboard: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: phase 1, the execution-backed
activity feed and the needs-attention panel; phase 3, the module cleanup and
the per-file split; phase 2, the information architecture; and the platform
activity chart — all on the house style in `UI_UX_STANDARD.md`. Phase 4, the
executive overview, is specified below and not yet built.
The dashboard was explicitly out of scope for `SERVERS_UI_REDESIGN_PLAN.md`;
this plan reuses the blocks that plan introduced.

## Who this page is for

`/dashboard` is the first screen after sign-in, and it is the one page in the
product with two readers at once.

The first is a non-technical owner: an agency account manager, a founder, the
person paying the invoice. They do not know what `installer_status` is and
will never open a playbook. They open the dashboard to answer one question —
**is my stuff still working?** — and they need an answer in a sentence, not a
table.

The second is the developer or DevOps engineer who actually operates the
estate. They want to know what changed, who changed it, what broke, and
whether it is worth opening the server page. Counts tell them nothing; they
already know how many servers they have.

Both must be served by **one** page, not a mode switch. The product has no
way to know which of the two is looking, a single account is often both
people on different days, and two modes would mean two surfaces to keep
correct. The row pattern in "Dual-audience rows" below is how we do that.

## Design principles

1. **Answer the question before showing the data.** The page opens with a
   verdict in plain language, not with configuration or counts. A reader who
   stops after one sentence should still have learned whether anything is
   wrong.
2. **Status before inventory.** "11 of 12 servers ready" is status. "12
   servers" is inventory. Inventory is real but it is not news, so it sits
   below the fold of attention, not at the top.
3. **Quiet when healthy.** The attention panel renders nothing but a green
   line when there is nothing to do. A non-empty attention panel must always
   mean real work, or readers learn to ignore it.
4. **Worst case, never the average.** A fleet mean hides the one server at
   98%. Report "3 of 12 servers above 85% memory" and name them.
5. **Every problem carries a next step.** A failure row says what broke,
   where, when, who triggered it, and offers one action. A status with no
   recovery path is a dead end.
6. **Never show raw backend strings.** `progress`, `installer_status`,
   `dead`, `exited` are internal vocabulary. Translate them, and collapse
   legacy and empty values to "Unknown" rather than leaking them.
7. **Say nothing rather than something untrue.** No placeholder rows, no
   hardcoded fallbacks standing in for configuration we did not actually
   read. An honest unknown state beats a confident wrong one.
8. **Same vocabulary as the rest of the product.** "Server" (never
   "machine"), "workspace", "module", matching `UI_UX_STANDARD.md` §7.

## The data contract

This is the part most likely to be got wrong again, so it is explicit.

**Read platform state from the platform v2 endpoints.** They are durable,
workspace-scoped, structured and already joined for display:

| Endpoint                         | Serves                                 | Notes                                                                                                                                                                                          |
| -------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v2/executions`         | The activity feed and the failure rows | Carries `machine_hostname`/`machine_address` joined in, so a row can name its server with no second request. Supports `since` (RFC3339 or `24h`, capped 30 days) and comma-separated `status`. |
| `GET /api/v2/executions/summary` | The health verdict                     | Status counts in a window. Use it instead of counting rows client-side.                                                                                                                        |
| `GET /api/v2/agents`             | Agent reachability                     | `last_seen_at` is the heartbeat. Treat quiet for more than `AGENT_STALE_AFTER_MS` (15 min) as out of contact, and an agent that never reported as out of contact too.                          |

**There is no host-metric history, and the code that looks like it reads one
does not.** This was checked against production rather than assumed, and the
finding is the single most important fact for phase 4.

`internal/observability/uptrace_metrics.go` queries Uptrace for
`system.cpu.utilization`, `system.memory.usage/total/free` and
`system.filesystem.usage/total/free`. Those constants exist, the query code
works, and the Uptrace deployment does expose both
`/internal/v1/metrics/{project}/gauge` and
`/internal/v1/metrics/{project}/timeseries` (both verified returning 200).

But **no host metrics are being delivered to Uptrace at all.** The only
metrics in the instance are Uptrace's own internal telemetry
(`uptrace_tracing_spans`, `uptrace_billing_*`); no project carries a single
`system.*` series. Every gauge query therefore fails in production and falls
through to `collectSystemFromUptraceHeartbeatLog`, which queries the Uptrace
_log_ stream for `/var/log/dpanel-agent/all.log`, scans the last 80 lines
inside a 15-minute window, and parses a JSON heartbeat envelope out of a
matching line.

So today's per-server CPU, memory and disk readings come from **parsing log
lines**, not from a metrics pipeline. They work, and they are a point reading
only: there is no series behind them to chart.

Frontend recipes live at `src/shared/api/execution.find.ts`,

Frontend recipes live at `src/shared/api/execution.find.ts`,
`execution.summary.ts` and `agent.find.ts`; the projection helpers are in
`src/app/_with-app-layout/dashboard/-lib/activity.ts`, unit-tested.

**Do not rebuild a feed from server logs.** The page previously tailed 200
lines of `/var/log/syslog` from every server and parsed them in the browser:
one request per server on load and on every refresh, 440 lines of regex and
JSON parsing, three events rendered. It was also the wrong source — syslog
describes what a daemon logged, not what the platform did, and it cannot say
who triggered anything. That code is deleted. Do not reintroduce it.

**Agent chatter is excluded by default.** `agent_rpc` and `agent_command` are
machine-to-machine traffic, not user-facing activity; see
`DEFAULT_EXCLUDED_EXECUTION_TYPES`.

**Watch the empty-list contract.** The response envelope marks `data` as
`omitempty` and the api-client treats a missing `data` field as a _failed_
request, so a handler returning a nil slice makes an empty list render as an
error. List endpoints must return `[]`. This was a live bug in
`GET /api/v2/agents`, fixed; check it when adding any new list endpoint.

## Status vocabulary

One mapping, in `-lib/activity.ts`, used by every panel. Unrecognised and
empty values must fall through to "Unknown" and the neutral tone — never be
coloured as healthy.

| Stored status               | Shown as         |
| --------------------------- | ---------------- |
| `pending`                   | Waiting to start |
| `queued`                    | Queued           |
| `running`                   | In progress      |
| `succeeded`                 | Done             |
| `failed`                    | Failed           |
| `cancelled`                 | Cancelled        |
| anything else, `""`, absent | Unknown          |

Execution `type` maps the same way (`machine_setup` → "Server setup", and so
on). An unrecognised type degrades to a humanised label — "Iac custom
playbook" — rather than a blank cell or a missing-translation key, so a newly
added backend type never breaks the page.

## Dual-audience rows

Every activity and failure row has the same anatomy:

- **Headline**, plain language, naming the resource: "Server setup failed on
  web-01".
- **Status pill**, translated, toned by lifecycle.
- **Meta line**: who triggered it, how long ago, how long it took.
- **Failure summary**, when failed, redacted (see below).
- **`Technical details`** disclosure, collapsed: raw type, raw status,
  module, machine ID, trace ID, execution ID.

The first four lines serve the non-technical reader; the disclosure serves
the operator. Neither reader is shown a different page.

## Security in the UI

Failure text reaches the screen from backend error messages, which can echo
whatever a playbook printed. Run every failure summary through the redaction
in `-lib/activity.ts` before rendering, so a secret echoed into an error
message does not land in the UI, a screenshot or a support ticket. See
`UI_UX_STANDARD.md` §9.

## Panel inventory

| #   | Panel                 | Today                                                                                                            | Redesign                                                                                                                                                      |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Health verdict        | Does not exist.                                                                                                  | One plain sentence at the very top, from the execution summary plus server status and agent heartbeats. **Done, phase 2.**                                    |
| 2   | Needs your attention  | Does not exist; the only risk number was the aggregate `riskyResources` mislabelled under the Applications tile. | Failed executions, failed servers and unreachable agents, each with one action. Green and quiet when empty. **Done, phase 1.**                                |
| 3   | Recent activity       | `AgentEventsPanel`: one syslog tail per server, parsed client-side, three events shown.                          | Timeline from `/api/v2/executions`, newest first, dual-audience rows. **Done, phase 1.**                                                                      |
| 4   | Capacity              | `TelemetryPanel`: 3 polling probes × 8 servers every 15s, history only in component state, plots the fleet mean. | Worst-case reporting that names the servers over threshold. History must survive navigation, or the panel must not claim to show a trend. **Done, phase 2.**  |
| 5   | Your estate           | `SummaryGrid`: six bare count tiles; a failed _server_ turns the _Applications_ tile amber.                      | Demoted below status, status-aware subtext per tile ("12 servers · 11 ready, 1 failed"), each tile's tone driven by its own resource type. **Done, phase 2.** |
| 6   | Workspace / IaC repo  | Opens the page. Includes a hardcoded "Worker used: not reported" row and a hardcoded repo fallback.              | Moves below the estate — it is configuration, not status. Placeholder row removed; unknown rendered as unknown. **Done, phase 2.**                            |
| 7   | Cloud projects        | Second on the page.                                                                                              | Moves below the estate with #6. **Done, phase 2.**                                                                                                            |
| 8   | Server health         | Status metrics plus a provider mix meter.                                                                        | Folds into #1 and #4; keep the provider mix.                                                                                                                  |
| 9   | Resource mix          | Meters comparing domains against databases.                                                                      | Remove. The comparison is not meaningful and answers no question anyone asks.                                                                                 |
| 10  | Members               | Team member list.                                                                                                | Keep, restyle only.                                                                                                                                           |
| 11  | Recent resource lists | Three compact lists (servers, applications, load balancers).                                                     | Keep, restyle only; status pills via the vocabulary above.                                                                                                    |

## Delivery order

Each phase is one PR. Phase 1 is the base; phases 2 and 3 were both cut from
it and are **parallel siblings, not a chain**. Both rewrite
`DashboardView.tsx` — phase 2 reorders and rewrites its panels, phase 3
splits it into separate files — so whichever merges second will conflict
across most of that file. Land phase 3 first, since it only moves code, then
rebase phase 2 onto it and reapply its panel changes in the new per-panel
files. Do not merge both and resolve by hand; the result silently loses one
side's edits.

1. **Execution-backed feed.** Panels #2 and #3; the platform v2 recipes, the
   `-lib/activity.ts` projection with 31 unit tests, `-lib/tone.ts` and
   `-presentation/DashboardSection/`; deletes the syslog parser. Backend:
   joined display fields, `since` and multi-`status` filters, the summary
   endpoint, and the empty-agent-list fix. **Done**, branch
   `feat-dashboard-execution-feed`.
2. **Information architecture.** Panels #1, #4, #5, #6, #7; reorder to
   verdict → attention → activity → capacity → estate. **Done**, branch
   `feat-dashboard-information-architecture`, rebased onto phase 3 as planned
   below. Panels #8 and #9 were left alone: they are not in this phase's panel
   list, and folding or removing them is its own change.
3. **Module cleanup.** Delete about 700 lines of components left over from a
   previous design (`SectionApp`, `SectionMachine`, `QuickStats`, `AddCard`,
   `AppCard`, `MachineCard`, `SectionWrapper`, `mapAppCardStatus`), and split
   the 1700-line `DashboardView.tsx` per the slice anatomy in `RULES.md` §5.
   No behaviour change. Branch `feat-dashboard-cleanup`.
4. **Executive overview.** Replace the fourteen stacked panels with four tabs
   and add the fleet utilisation charts. The charts shipped on stored heartbeat
   rollups (dPanel-ID/backend#64, #65) after the Uptrace route turned out to be
   a dead end; the tabs and the personal/team split followed. Specified under
   "Phase 4" below.

Since those three phases, the platform activity chart shipped on
`GET /api/v2/executions/timeseries`, verified live in production and rendered
in both themes. Phase 1 was verified with typecheck, lint, unit tests and a production build,
but **not** in a browser: the route needs authentication and a live backend.
Phase 2 was verified the same way, also without a browser. It must still be
checked in a local preview at 1440, 1024 and 375, light and dark, against real
or mocked execution data — including the empty, failed and "genuinely broken
server" states — before merge. The three platform v2
endpoints it reads were confirmed live in production, and
`/api/v2/executions/summary` returns `window_start`, `window_end`, `total`,
`pending`, `queued`, `running`, `succeeded`, `failed`, `cancelled` and
`other`.

## Phase 4: the executive overview

The page answers the right questions but does not look like an overview. It is
fourteen stacked panels — ActivityChart, ActivityPanel, ApplicationsList,
AttentionPanel, CapacityPanel, CloudProjectsPanel, EstatePanel, HealthVerdict,
LoadBalancersList, MembersPanel, ResourceMixPanel, ServerHealthPanel,
ServersList, WorkspaceOverview — which reads as a long scroll of medium-interest
cards. An executive dashboard is dense and short. **Phase 4 consolidates before
it adds.** Seven bands replace fourteen panels.

References supplied for this phase were a license-manager dashboard and a
vendor-management dashboard. The second is the model: flat bordered cards, KPI
tiles, one hero timeseries, legend pills, a data table. From the first, take the
dense KPI strip and the delta-against-previous-period idea, and **reject its
visual language** — neon radial dials, gradient fills and decorative glow are
precisely what §"Visual language" of `UI_UX_STANDARD.md` forbids in operational
tools.

### Layout

Seven stacked bands were the first answer, and they were wrong: compacting a
long page into a shorter long page still leaves every question somewhere down
a scroll. The page is **four tabs**, each answering one question, so the first
screen stays short no matter how much the product grows.

Tabs are links carrying a zod-validated `?tab=` search param, matching the
server detail page, so a section is a shareable URL and a stale bookmark falls
back to the overview rather than breaking the page.

| Tab           | Content                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Overview**  | Health verdict; the estate as one block of headline numbers beside the activity trend; needs attention; resource usage |
| **Activity**  | The operations chart and the full event feed                                                                           |
| **Resources** | Fleet utilisation, server health, and the server, application and load-balancer lists                                  |
| **Workspace** | IaC repository, members, cloud projects — **team workspaces only**                                                     |

The Overview's grammar comes from the operations dashboards supplied as
references: flat bordered cards, a block of headline numbers, one hero chart,
everything on a single screen. What is deliberately _not_ taken from them is
the decoration — 3D objects, gradient fills and glassmorphism are what
`UI_UX_STANDARD.md` forbids in operational tools, however good they look in a
portfolio shot.

Removed: `EstatePanel` and `ResourceMixPanel`, replaced by the headline-number
block; `CapacityPanel`, replaced by fleet utilisation. `ServerHealthPanel` and
the telemetry probes behind it are still on the Resources tab and still due to
retire.

### Personal and team are different products

A personal workspace has no members and no shared configuration. Treating it
as a team workspace with empty panels produced visible nonsense: the live page
reported "+1 more members" beneath a panel explaining that personal
workspaces have no member list, because the member total defaulted to one.

So the Workspace tab **does not exist** in a personal workspace, and
`MembersPanel` has no personal mode at all. A personal workspace that reaches
that tab anyway — a bookmark, a shared link, or switching workspace with the
tab open — falls back to the overview. The rule to keep: when a mode does not
have a thing, omit the surface rather than render it with an apology in it.

### Decisions taken

**Count tiles carry no sparkline.** Reference 2 puts a mini chart under every
KPI, but counts have no history stored anywhere — they are pagination totals,
a number and not a series. A tile shows its count and a real status breakdown
("12 servers · 11 ready, 1 failed") instead. Drawing a trend line from data
that does not exist is the one thing this plan will not do. Revisit only if
daily resource-count rollups are ever stored.

**Utilisation is three charts, not one.** One chart per resource, each with two
series: fleet average and worst server. Two series per chart stays within the
colour-blindness separation the palette was validated for, and the average
never appears alone — a fleet mean hides the single machine at 98%, which is
the failure phase 2 removed from the old telemetry panel.

**The utilisation range caps at three days** only while the series is read
from Uptrace. Option C stores the rollups here, so that cap does not apply and
the range can match the activity chart; keep 1h / 24h / 3d as the opening
offer anyway until there is more than three days of rollup to show. The activity chart
keeps 24h/7d/30d either way, because executions are stored here; see "the two
history stores" above.

### Backend work

Band 3 needs a stored series. Checking production turned up something worth
stating plainly, because it changes which option is cheap.

**The agent already exports OpenTelemetry metrics, and Uptrace drops them.**
`cmd/active-agent/main.go` collects a system snapshot every 30 seconds and
calls `exportSystemMetrics`, which posts OTLP-JSON gauges for
`system.cpu.utilization`, `system.memory.usage/total/free/utilization`,
`system.filesystem.usage/total/free/utilization` and `system.uptime` to the
derived `/v1/metrics` endpoint with the workspace DSN. That code is complete
and running. A diagnostic datapoint posted the same way answers `200 {}` and
then **does not appear in any project**: the only metrics the instance holds
are Uptrace's own seven `uptrace_*` internal series. Metrics ingestion is
accepted and silently discarded, so this is an Uptrace-side limitation, not
missing agent work.

**And the backend already receives the same numbers directly.** `emit` in the
agent delivers every heartbeat to the backend over the WebSocket or the
callback URL, carrying `cpu.usage_percent`, `memory.used_percent` and
`disk.used_percent` in its attributes. `upsertAgentFromEventTx` persists only
`version`, `status`, `last_seen_at` and `otel_resource_id` — the
system stats are read and thrown away. The per-server usage endpoints then
recover those same figures by querying Uptrace _logs_ for the agent's log
file and parsing the heartbeat JSON back out of a text line.

So the platform receives host stats every 30 seconds, discards them, and later
scrapes them back out of a log of the same message.

That makes the choice straightforward:

**C. Persist what already arrives (recommended).** Write a rollup row per
machine per bucket from the heartbeat the backend already handles, and serve
the chart from Postgres. No agent change, no Uptrace dependency, no OTLP
round trip, and **no three-day cap**, because the data is ours. It also lets
the per-server endpoints stop log-scraping, which removes the last piece of
log parsing from this product's read path.

**A. Make Uptrace store metrics.** Still worth doing for the observability
product as a whole, but it is an Uptrace configuration or licensing question
on an instance whose container config is not readable without the VM's sudo
password, and it would keep the retention cap. Not a prerequisite for band 3.

**B. Derive the series by parsing heartbeat logs.** Rejected. It is the log
scraping phase 1 removed, and it is now plainly unnecessary given C.

Endpoint shape, unchanged by the choice:
`GET /api/v2/metrics/fleet-utilisation?since=&bucket=`, workspace-scoped,
per-bucket average and maximum for CPU, memory and disk plus the peak machine
per metric, aggregated in one query rather than one per machine.

### Risks

- **One server.** The data-bearing workspace holds a single machine, so the
  fleet charts will plot one flat line. The design pays off at ten servers; it
  will look thin until then, and no styling changes that.
- **The empty-workspace default.** The dashboard opens on the personal
  workspace, which has no resources, so a first impression is zeroes
  regardless of what this phase builds. Worth fixing alongside it.
- Three days of retention means no month-over-month comparison; a delta can
  compare at most the previous 24 hours.

## What phase 2 built

- **Health verdict** — `-lib/verdict.ts`, `-view/HealthVerdict/`, with
  `-usecase/use-dashboard-health.ts` reading the summary, the failed
  executions and the agents once and feeding both the verdict and the
  attention panel, so the two cannot disagree and no endpoint is polled twice.
  `resourceLifecycle` maps the machine and installer status vocabulary onto
  the shared lifecycle in the status table above, so "needs attention" is
  decided in one place for every resource type.
- **Capacity** — `-lib/capacity.ts`, `-view/CapacityPanel/`, replacing
  `TelemetryPanel` and `TrendChart`. Reports "3 of 12 servers above 85%
  memory" and names the servers with links. Polling went from 15s to 60s
  (96 requests a minute to 24) and the per-visit history is gone.
- **Your estate** — `-view/EstatePanel/`, replacing `SummaryGrid`. Each tile
  reports its own type's statuses and takes its tone from them; a count drawn
  from a fetched page rather than the whole estate says so.
- **Honest configuration** — the placeholder worker row and the hardcoded
  `dPanel-ID/dpanel-iac-ansible-shared` fallback are gone, along with the
  `iacRepositoryMode.unknown` → "Configured" label, which claimed a mode the
  payload never gave.
- **States** — `-lib/response-state.ts` tells a failed health source from a
  refused one (401/403), so a retry is offered only when retrying can work.
  When one source is unreadable the verdict reports what the others show and
  adds "some checks could not run" rather than claiming unverified health.

## Out of scope for this plan

The execution detail pages (`SERVERS_UI_REDESIGN_PLAN.md` #9–#11), Uptrace-
backed per-execution event streams, and any notification or alerting surface.
The dashboard links to those; it does not replace them.
