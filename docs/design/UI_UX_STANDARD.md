# dNocs UI/UX standard

Status: adopted 2026-10-21. This is the house style for every product surface
in this repository. It was extracted from the `/servers` module, which is the
reference implementation, and every other module has since been rebuilt on it.

Read this before you design or build a page, a panel, a modal or a table.
When something here and a local habit disagree, this document wins. When this
document and the live `/servers` code disagree, the code wins and this
document is wrong — fix it in the same pull request.

## 1. Who we are building for

Our users are not only DevOps engineers. A large part of the audience is a
PHP or WordPress developer who has never opened a terminal on a server, who
arrived because they want a VM, and who now has to get past a concept they did
not ask to learn (an SSH key, a VPC, a load-balancer upstream).

Three rules follow from that, and they outrank visual preference:

1. **Name the goal, not the object.** The page exists to get someone to the
   next thing they actually want. An SSH key page is a step on the way to a
   server, and it says so, with a link to the create-server page.
2. **Explain the concept once, where it blocks.** A short, plain-language
   block at the top of the page — not a tooltip, not a docs link alone.
   Three steps at most, and no jargon that the block itself does not define.
3. **Never make a beginner guess the next action.** One primary action per
   screen, in the same place on every page, worded as a verb phrase
   ("Create SSH key", "Launch a server"), never "Submit" or "OK".

## 2. Design principles

These came out of the servers redesign and apply to every page.

1. **One clear next action per screen.** One primary button, in the hero's
   right corner on list pages, in a sticky review panel on flow pages.
2. **Show readiness, not steps.** Prefer a live checklist that enables the
   action over a numbered wizard that hides what is missing.
3. **Real identity.** Provider logos, OS logos, status colors — not generic
   gray badges. Logos sit on white tiles so they read in both themes. A
   resource with no logo gets an accent icon tile instead.
4. **Say what happens next.** Every destructive or long-running action states
   what dNocs will do, what it will not do, and roughly how long it takes.
5. **Progressive disclosure.** Rare fields go behind "Advanced".
   Under-development tools are hidden, not shown as dead buttons.
6. **Same vocabulary everywhere.** "Server" (never "machine" in the UI),
   "Launch" for cloud, "Connect" for manual, "Setup" for the dNocs install,
   "SSH key" (never "secret" or "credential" in a user-facing string).
7. **Responsive by default.** Every page is checked at 1440, 1024 and 375, in
   light and dark.
8. **Honest controls.** A control that cannot do what it looks like it does
   must not exist. A tile that cannot filter the list is not a button; a
   count taken from a sample says so.

## 3. Page anatomy

A list page is built from these blocks, in this order, inside
`<div className="flex flex-col gap-4">`:

| Order | Block          | Component                                    | Rule                                                                            |
| ----- | -------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| 1     | Hero           | `FlowHero`                                   | Breadcrumb headnote, icon tile, title, one-sentence description, actions.       |
| 2     | Concept guide  | page-local `Guide`                           | Only where the page's concept blocks a beginner. Three steps, one CTA.          |
| 3     | Overview tiles | `StatTile`                                   | Workspace-wide counts. Clickable only when they really filter the list.         |
| 4     | Filter bar     | `SearchCollapsible` + segmented view control | Search left, refresh and view mode right, inside one `rounded-xl` strip.        |
| 5     | Active filters | `SearchKeywordBadge` and friends             | Every active narrowing is visible and individually clearable.                   |
| 6     | List           | row / card / table views                     | One data model, three renderings; `auto` picks list on desktop, grid on phones. |
| 7     | Pagination     | `buildPaginationV2`                          | Bottom right; hidden while the response is not a success.                       |
| 8     | Aside          | `AsideHelpSupport`                           | `xl` and up only, never carrying anything the main column needs.                |

A detail page keeps blocks 1 and 8 and replaces the middle with: stat tiles,
a "what you can do next" strip, the resource's own sections, and a danger
zone last.

## 4. Shared blocks

Use these before writing anything new. New page shells, card systems, title
bars, toolbars or table treatments are forbidden unless the user explicitly
asks for a new direction; if one is unavoidable, say why in the pull request.

| Block                              | Import                                       | Use for                                               |
| ---------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `FlowHero`                         | `shared/presentation/organisms/FlowHero`     | Page opening, list and detail alike.                  |
| `FLOW_ACCENTS`, `flowCtaClassName` | same module                                  | Accent glow, icon tiles, badges, primary CTA.         |
| `StatTile`                         | `shared/presentation/molecules/StatTile`     | One number with a name; `md` on pages, `sm` in cards. |
| `StatusPill`                       | `shared/presentation/molecules/StatusPill`   | State of a resource; `pulse` while it is in flux.     |
| `StepCard`                         | `shared/presentation/organisms/StepCard`     | A numbered section of a creation flow.                |
| `ReviewPanel`                      | `shared/presentation/organisms/ReviewPanel`  | Sticky checklist plus the flow's primary action.      |
| `DataPanel`                        | `shared/presentation/organisms/DataPanel`    | A tab's header, tiles, toolbar, table and footer.     |
| `Breadcrumb`                       | `shared/presentation/molecules/Breadcrumb`   | Hero headnote.                                        |
| `SshKeyPicker`                     | `shared/presentation/organisms/SshKeyPicker` | Choosing or creating a key inside another flow.       |
| `Table` atoms                      | `shared/presentation/atoms/Table`            | Dense views; wrap in `rounded-2xl border bg-card`.    |
| `DropdownMenu`                     | `shared/presentation/atoms/DropdownMenu`     | The "more" menu of a row or card.                     |
| `Button` (ButtonV2)                | `shared/presentation/atoms/ButtonV2`         | Secondary and icon actions; `danger` for destructive. |

## 5. Visual language

- **Surfaces.** `rounded-2xl border bg-card` for a page-level block,
  `rounded-xl` for a nested one, `rounded-lg` for a control. No decorative
  shadows, no nested cards, no gradient orbs, no marketing composition.
- **Accent.** `sky` is the product accent and the cloud path; `violet` is the
  "your own server" path. Pick one per page and keep it. Accent classes come
  from `FLOW_ACCENTS`, never from hand-written color literals.
- **Tone colors.** `emerald` ready, `sky` in progress, `amber` needs care,
  `red` failed or destructive, `neutral` nothing to report. These map to
  `StatTile` tones and `StatusPill` tones and mean the same thing everywhere.
- **Text.** `text-primary` for content, `text-muted-foreground` for labels and
  hints. Titles `font-bold`; a page title is `text-2xl sm:text-3xl`, a block
  title `text-base`, a card title `text-sm`.
- **Hover.** Cards and rows lift: `hover:-translate-y-0.5
hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5`.
- **Dark mode is not an afterthought.** Every color pair is declared with its
  `dark:` counterpart in the shared block, which is why you use the block.

## 6. States

Every page and panel defines all of these before it is considered done:

| State           | Treatment                                                                             |
| --------------- | ------------------------------------------------------------------------------------- |
| Loading         | Shimmers shaped like the view that is loading, so nothing jumps on arrival.           |
| Refetching      | `SpinnerOverlay` over the previous data; never blank the screen.                      |
| Empty           | The accented block with the icon, one sentence of why, and the one action.            |
| Empty, filtered | A dashed block with "no matches" and a button that clears the filters.                |
| Failed          | `FailedState.WallCentered` over dimmed placeholders; recoverable 4xx gets a way back. |
| Stale/degraded  | Show what is known, label what is missing; never imply fresh data.                    |
| Unauthorized    | Fail closed: hide the action, do not render a button that will 403.                   |
| Config-disabled | Hide the surface; no dead navigation, no misleading success.                          |

## 7. Copy

- Sentence case everywhere, including buttons and table headers.
- Button labels are verb phrases. Dialog confirmations repeat the verb
  ("Delete key"), never "Yes".
- Describe consequences in the user's terms: what is deleted at the provider,
  what stays, what breaks next time.
- Define the concept the first time it appears on the page, in one sentence,
  with no second piece of jargon inside it.
- Every user-visible string lives in `services/i18n/config/dict-en.json` and
  `dict-id.json`. Both files are updated in the same change; a string shipped
  in one language only is an incomplete change.

## 8. Accessibility and input

- Icon-only controls carry both `aria-label` and `title`.
- A tile that acts as a filter is a `<button>` with `aria-pressed`.
- Focus is always visible: `focus-visible:ring-2` with the accent ring.
- Rows, tabs, popovers and tree items keep keyboard access, and every action
  reachable by hover is reachable on touch.
- Text truncates inside stable grid tracks; labels, names and status text
  never reflow the layout as data changes.
- Render-phase state updates are forbidden. Responsive state, deferred search
  and popover sync go through handlers, effects or refs.

## 9. Security in the UI

- Never render, copy, log, screenshot or mock a secret value: passwords,
  tokens, private keys, machine secrets, provider or DNS credentials,
  database passwords. The public half of an SSH key is the one safe
  exception, and it is labelled as safe to share.
- A secret the backend does not return is described, not faked. The private
  key panel explains where the key lives and why it is not shown.
- Error messages from upstream are shown only after they are known to be
  safe; never echo a rejected secret back into a validation message.

## 10. Architecture rules this standard assumes

The visual rules sit on top of `RULES.md`, which is unchanged:

- FSD layers and dependency direction; route slices own their `-model`,
  `-rules`, `-usecase`, `-lib`, `-view` and `-view/-presentation` folders.
- Every user action in a route slice is an event, handled by a usecase hook
  wired in that slice's `EventController`. Views emit; they do not call APIs.
- Zod schemas in `-rules` are the single source of truth for query strings
  and payload shapes.
- Data comes from `shared/libs/api-client` recipes only. Do not invent API
  contracts or client-side business rules to fill a gap — report the gap.
- A DTO is mapped to a view model in `-lib` before a view sees it, so that
  production-shaped data (empty strings, null JSON, missing IDs, legacy
  numeric IDs) is handled in one place and never crashes a card.

## 11. Definition of done

Before a UI change is called finished:

- [ ] The page is built from the shared blocks in section 4, in the order of
      section 3, with no new shell or card system.
- [ ] The eight states in section 6 are implemented, not just the happy path.
- [ ] Both dictionaries carry every new string; no hardcoded English.
- [ ] Icon-only controls have `aria-label` and `title`; focus rings visible.
- [ ] Checked at 1440, 1024 and 375, in light and dark.
- [ ] No secret value can reach the screen, the clipboard or a log.
- [ ] `pnpm run type-check` and `npx eslint <changed paths>` are clean for the
      changed files, and the result is compared side by side with `/servers`.
- [ ] Anything that could not be verified is stated plainly in the pull
      request, with the reason.
