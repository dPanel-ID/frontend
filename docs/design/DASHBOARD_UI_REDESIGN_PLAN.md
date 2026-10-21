# Dashboard: UI/UX redesign plan

Status: in progress, 2026-10-21. Done so far: phase 1, the execution-backed
activity feed and the needs-attention panel, on the house style in
`UI_UX_STANDARD.md`. Phases 2 and 3 are specified below and not yet merged.
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

| #   | Panel                 | Today                                                                                                            | Redesign                                                                                                                                                |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Health verdict        | Does not exist.                                                                                                  | One plain sentence at the very top, from the execution summary plus server status and agent heartbeats. **Phase 2.**                                    |
| 2   | Needs your attention  | Does not exist; the only risk number was the aggregate `riskyResources` mislabelled under the Applications tile. | Failed executions, failed servers and unreachable agents, each with one action. Green and quiet when empty. **Done, phase 1.**                          |
| 3   | Recent activity       | `AgentEventsPanel`: one syslog tail per server, parsed client-side, three events shown.                          | Timeline from `/api/v2/executions`, newest first, dual-audience rows. **Done, phase 1.**                                                                |
| 4   | Capacity              | `TelemetryPanel`: 3 polling probes × 8 servers every 15s, history only in component state, plots the fleet mean. | Worst-case reporting that names the servers over threshold. History must survive navigation, or the panel must not claim to show a trend. **Phase 2.**  |
| 5   | Your estate           | `SummaryGrid`: six bare count tiles; a failed _server_ turns the _Applications_ tile amber.                      | Demoted below status, status-aware subtext per tile ("12 servers · 11 ready, 1 failed"), each tile's tone driven by its own resource type. **Phase 2.** |
| 6   | Workspace / IaC repo  | Opens the page. Includes a hardcoded "Worker used: not reported" row and a hardcoded repo fallback.              | Moves below the estate — it is configuration, not status. Placeholder row removed; unknown rendered as unknown. **Phase 2.**                            |
| 7   | Cloud projects        | Second on the page.                                                                                              | Moves below the estate with #6. **Phase 2.**                                                                                                            |
| 8   | Server health         | Status metrics plus a provider mix meter.                                                                        | Folds into #1 and #4; keep the provider mix.                                                                                                            |
| 9   | Resource mix          | Meters comparing domains against databases.                                                                      | Remove. The comparison is not meaningful and answers no question anyone asks.                                                                           |
| 10  | Members               | Team member list.                                                                                                | Keep, restyle only.                                                                                                                                     |
| 11  | Recent resource lists | Three compact lists (servers, applications, load balancers).                                                     | Keep, restyle only; status pills via the vocabulary above.                                                                                              |

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
   verdict → attention → activity → capacity → estate. Branch
   `feat-dashboard-information-architecture`.
3. **Module cleanup.** Delete about 700 lines of components left over from a
   previous design (`SectionApp`, `SectionMachine`, `QuickStats`, `AddCard`,
   `AppCard`, `MachineCard`, `SectionWrapper`, `mapAppCardStatus`), and split
   the 1700-line `DashboardView.tsx` per the slice anatomy in `RULES.md` §5.
   No behaviour change. Branch `feat-dashboard-cleanup`.

Phase 1 was verified with typecheck, lint, unit tests and a production build,
but **not** in a browser: the route needs authentication and a live backend.
Phases 2 and 3 must be checked in a local preview at 1440, 1024 and 375, light
and dark, against real or mocked execution data — including the empty, failed
and "genuinely broken server" states — before merge.

## Out of scope for this plan

The execution detail pages (`SERVERS_UI_REDESIGN_PLAN.md` #9–#11), Uptrace-
backed per-execution event streams, and any notification or alerting surface.
The dashboard links to those; it does not replace them.
