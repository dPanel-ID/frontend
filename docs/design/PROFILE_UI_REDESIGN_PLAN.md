# Profile: UI/UX redesign plan

Status: in progress, 2026-10-22. Done so far: the profile page at `/profile`
and the edit-profile surface, rebuilt on the house style in
`UI_UX_STANDARD.md` and the blocks the servers module introduced
(`SERVERS_UI_REDESIGN_PLAN.md`). Next: the three product gaps below.

## Who this module is for

Everyone, once. A profile page is not a workflow — nobody comes here daily
and nobody is blocked by a concept. What people arrive to do is check one
fact: which email is on the account, which workspace am I currently in, is
my GitHub connected, what can I actually see. So this page is judged on how
fast it answers a question, not on how well it guides a task.

That is why it follows the **detail** anatomy from the standard rather than
the list or flow anatomy: hero, stat tiles, the resource's own sections, and
an aside. There is no guide strip, because no concept here blocks a
beginner, and no primary flow to walk.

## What changed

| Before                                                                                                            | After                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PageHeader` with an outline "Edit profile" button.                                                               | `FlowHero` in the sky accent, with the edit action as the page's one primary call to action.                                                                                                     |
| An "Access summary" card holding two numbers as rows.                                                             | Three `StatTile`s above the fold: total workspaces, team workspaces, and when the account was created. Counts read instantly instead of being buried in a card in the second column.             |
| Three card surfaces with `CardHeader`/`CardTitle`.                                                                | One local `Section` component on the house surface: `rounded-2xl border bg-card`, a bordered header carrying icon, title, description and an optional aside.                                     |
| Badges for state, including a hand-written emerald class set for "Connected".                                     | `StatusPill` with the product's tones, so "Active" and "Connected" look like every other state in dNocs and the dark variants come from the shared block rather than from literals in this file. |
| The connection cards stacked in a half-width column.                                                              | They sit side by side on `lg`, now that the counts they shared a row with moved into tiles.                                                                                                      |
| `Personal.tsx` at 637 lines holding helpers, five presentational components, the page body and the sidebar.       | Split into `-lib/profile.ts`, `-view/-presentation/fields.tsx`, `-view/AsideProfile.tsx`, `-view/Overview` and a 214-line `Personal.tsx`.                                                        |
| Two `Layout` components, one at `profile/-presentation` and one at `-view/-presentation`, only the second in use. | The dead one is gone; the surviving one matches the aside layout the other backend pages use.                                                                                                    |

## Honest gaps

- **The aside is "My applications".** It is a list of the user's apps on a
  page about the account. It is not wrong, but it is not what the page is
  for, and it is the only part that pulls its own data. Worth asking whether
  recent activity or active sessions would serve better.
- **Password says "Use Edit profile to update your password"** and nothing
  else — no last-changed date, no strength signal, no second factor. For an
  "Account security" section that is thin, and it is the kind of thin that
  reads as "we have not built this yet".
- The page has no destructive action at all: no sign out of other sessions,
  no delete account. The detail anatomy expects a danger zone last, and this
  one has nothing to put in it. That is a product gap, not a layout one.

## Next

1. **Verify on a signed-in environment** at 1440, 1024 and 375 in both
   themes. The tiles in particular want checking against an account with
   several team workspaces.
2. **The edit-profile modal** (`features/user-form-modal`), which is the one
   action this page offers and has not been looked at.
3. Decide what the aside is for.

## Editing a profile: modal to side panel

`features/user-form-modal` was the only edit surface on this page, and the
only one of its kind left: every other edit flow in dNocs opens a right side
panel (`server-edit-sidepanel`, `organization-edit-sidepanel`, the server
management tools). A modal for a form this long is also the wrong shape — it
takes the whole screen for a task you are doing _about_ the page behind it,
and the page behind it is exactly the context you want while editing.

It is now `features/user-edit-sidepanel`:

- `registerSidepanel` in place of `registerModal`, so it joins the same
  stack, keyboard handling and close behaviour as every other panel.
- `Layout.Title` / `Layout.Content` / `Layout.Cta` from
  `services/sidepanel/ui/presentation/Layout/General`, the shared shell.
  The title carries the display name as its subtitle, which the modal had
  nowhere to put.
- The old `SubmitButton`, which lived in the form body, becomes `Actions` in
  the `Cta` slot: Save and Cancel, pinned at the bottom where the other
  panels put them, rather than a lone button at the end of a scroll.
- It holds the panel open while the request is in flight
  (`%%sidepanel/allow-trivial-close`), so a stray click outside cannot drop
  half-saved changes. The modal did the same with its own event; the
  behaviour is preserved, not reinvented.
- The strings moved from `page.profile.modal.*` to `sidepanel.userEdit.*`,
  joining `sidepanel.serverEdit`, `sidepanel.editTeam` and the rest. The old
  namespace is gone; this feature was its only consumer.

The form fields, the zod schema and the update request are unchanged.
