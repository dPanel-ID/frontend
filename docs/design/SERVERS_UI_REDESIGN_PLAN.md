# Servers module: UI/UX redesign plan

Status: in progress, 2026-10-17. Done so far: the create-server landing and
manual connect flow (dPanel-ID/frontend#8), the Launch cloud VM page (#9,
#10) and the server list with its panels (shared blocks `StatTile`,
`StatusPill`, `ServerIdentity`, `ServerStatusPill`). Next: server detail.

## Design principles

These came out of the create-server redesign and apply to every page below.

1. **One clear next action per screen.** Each page has one primary button,
   placed where the eye lands last (a sticky review or action panel on the
   right on desktop, bottom on mobile).
2. **Show readiness, not steps.** Replace numbered wizards with a live
   checklist that enables the action when everything is ready.
3. **Real identity.** Provider logos, OS logos and status colors instead of
   generic icons and gray badges. Logos sit on white tiles so they read in
   both themes.
4. **Say what happens next.** Every destructive or long-running action tells
   the user what dPanel will do and how long it takes.
5. **Progressive disclosure.** Rarely used fields go behind "Advanced".
   Under-development tools are hidden, not shown as dead buttons.
6. **Same vocabulary everywhere.** "Server" (never "machine" in the UI),
   "Launch" for cloud, "Connect" for manual, "Setup" for the dPanel install.
7. **Responsive by default.** Every page is checked at 1440, 1024 and 375.

Shared building blocks already available: `PageHeader`, `CloudProviderLogo`,
`ResourceCard`, `ActionPopover`, `Sectioned`, `EmptyState`, status metadata
per entity. New shared blocks this plan adds: `ReviewPanel` (sticky checklist
+ primary action), `StepCard` (numbered section with done state),
`StatTile`, `StatusPill`.

## Page inventory

### Routes

| # | Page | Route | Today | Redesign |
|---|------|-------|-------|----------|
| 1 | Server list | `/servers` | Card grid with filter bar, status dialog, edit side panel, bulk bottom actions. | Table/grid toggle, provider logo + OS + status pill per row, inline health (CPU/RAM/disk) from the agent, quick actions, empty state that routes to Create. |
| 2 | Create: choose path | `/servers/create` | **Done** (#8). | Keep. |
| 3 | Create: connect own server | `/servers/create?mode=manual` | **Done** (#8). | Keep. |
| 4 | Create: launch cloud VM | `/servers/create/vm-instant` | Long single form; four sections, right-hand review panel; provider logos and `?provider=` added in #8. | Rebuild as the same pattern as manual connect: numbered `StepCard`s (Provider & project → Location → Size & image → Review), per-provider fields only, Ubuntu-only image picker, cost/size summary, `ReviewPanel` with Launch enabled when ready. |
| 5 | Create: manual VM (legacy) | `/servers/create/vm-manual` | Unreachable from the UI; superseded by #3. | Remove the route. |
| 6 | Server detail | `/servers/$id` | Header + Overview (stats, modules, services) + "Management tools" grid with dead Firewall button. | Hero header (name, provider logo, OS, status, IP, uptime, workspace), stat tiles with live agent data, tabbed sections (Overview, Modules, Services, Users, Network, Files, Logs, Settings). Dead tools hidden until they exist. |
| 7 | Server groups list | `/servers/groups` | Table with members count, create modal. | Cards with member avatars (server chips), last operation status, empty state explaining why groups exist. |
| 8 | Server group detail | `/servers/groups/$id` | Members, bulk actions, operations list in one long page. | Header with group health, Members tab (add/remove with `select-machine-modal`), Operations tab (timeline with per-server status), Bulk actions as a primary action menu. |
| 9 | Group operation: execution | `/servers/groups/$groupId/operations/executions/$operationId/$machineId` | Raw execution log page. | Shared "execution detail" layout: summary strip (status, started, duration, target), live log with task markers, retry/cancel actions. |
| 10 | Group operation: agent command | `/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId` | Raw command result page. | Same execution-detail layout as #9. |
| 11 | Group operation: deployment | `/servers/groups/$groupId/operations/deployments/$id` | Deployment result page. | Same execution-detail layout, plus the application and artifact it deployed. |

### Panels and modals opened from these pages

| # | Panel | Feature | Opened from | Redesign |
|---|-------|---------|-------------|----------|
| A | Edit server | `server-edit-sidepanel` | List, detail | Same form, grouped fields, save disabled until dirty and valid. |
| B | Server status info | `-usecase/server-status-info-dialog` | List | Fold into the status pill tooltip on list and detail. |
| C | Delete server | `-usecase/machine-delete` | List, detail | Typed-confirm dialog that says what is deleted at the provider and what stays. |
| D | Reinstall / re-run setup | `-usecase/machine-reinstall` | List, detail | Dialog with "what happens next"; progress shown on the detail page. |
| E | Migrate ownership | `migrate-ownership-modal` | List | Done in ownership work; restyle to the new modal look only. |
| F | Services | `server-services-sidepanel` | Detail tools | Becomes the Services tab (#6); keep the side panel for row detail. |
| G | File manager + preview | `file-manager-sidepanel`, `file-preview-sidepanel` | Detail tools | Becomes the Files tab; keep panels for browsing and preview. |
| H | Linux users + create | `server-users-sidepanel`, `server-user-create-sidepanel` | Detail tools | Becomes the Users tab. |
| I | Networks | `server-networks-sidepanel` | Detail tools | Becomes the Network tab (interfaces + ports in use). |
| J | Modules: discover, detail | `server-modules-discover-sidepanel`, `server-modules-detail-modal` | Detail overview | Modules tab: installed modules as cards with status and version; "Add module" opens the discover panel, redesigned as a catalog with logos and one-click install. |
| K | Log viewer | `server-log-viewer-sidepanel` | Detail | Becomes the Logs tab, also reused by #9–#11. |
| L | SSH terminal | websocket SSH (detail header) | Detail | Keep; add a "Connect over SSH" button with the `user@host` hint. |
| M | Create SSH key | `ssh-create-modal` | Create flows, detail | Restyle only. |
| N | Select server | `select-machine-modal` | Group members, app deploy | Restyle with provider logo and status; search. |
| O | Server groups create/edit | `server-groups` | Groups list, detail | Restyle only. |
| P | Under development notice | detail tools (Firewall) | Detail | Remove; hide the tool. |

## Delivery order

Each step is one PR, merged and deployed before the next, so the module gets
better page by page and nothing is half-done.

1. **Shared blocks.** `ReviewPanel`, `StepCard`, `StatTile`, `StatusPill`,
   plus the `ServerIdentity` row (logo, name, OS, status) used by every list
   and header. Includes removing `/servers/create/vm-manual`. Done.
2. **Launch cloud VM** (#4). The biggest usability gap left in creation. Done.
3. **Server list** (#1) with panels A–E. Done: hero, fleet tiles that filter
   by state, list/grid/table views, typed-confirm delete, reinstall with
   "what happens next", grouped edit sidepanel. Panel E (migrate ownership)
   is shared across resources and keeps its current look for now.
4. **Server detail** (#6) with tabs F–L and P.
5. **Server groups** (#7, #8) with N, O.
6. **Operation detail pages** (#9–#11) on the shared execution layout.

Each PR is checked in a local preview against a mock API at 1440, 1024 and
375, light and dark, before merge; production is verified after deploy.

## Out of scope for this plan

Applications, load balancers, domains, cloud projects and SSH keys pages.
They will follow the same principles in a later plan, reusing the blocks
built here.
