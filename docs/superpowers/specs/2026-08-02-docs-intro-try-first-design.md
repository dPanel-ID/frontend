# Try-first documentation introduction — Design

## Purpose

Turn `/docs/intro` from a dense documentation reference into a compact,
conversion-oriented introduction to dPanel. Its one job is to make a visitor
want to learn how the product works and begin a trial.

## Audience and message

The page serves business users, developers, and non-technical collaborators
who need to try an application on available infrastructure before committing
to a direction. It should explain the value in ordinary language:

- Learn the product from the dPanel video.
- Try an application in an environment that fits the test.
- Compare the evidence from that test before deciding what to use next.

It must not promise live pricing, universal provider parity, savings, or an
automatic move between clouds.

## Content and interaction

The public route contains only these moments:

1. **Compact hero** — headline, a short supporting sentence, a primary
   `Try dPanel` action to the app, and a secondary YouTube action.
2. **Try-first strip** — three concise outcomes: learn the product, run a
   real test, and compare before committing. It uses plain language and no
   technical object names.
3. **Final invitation** — a short reminder that trial results make the next
   choice clearer, with the same two actions.

The header retains the dPanel Docs identity and a single `Open app` action.
It does not include in-page navigation for removed sections.

Remove the documentation guide, documentation map, IaC cards, decision board,
operating loop, role cards, and decision-boundary content from this route.
They are technical/reference-oriented material and do not serve the new page
goal.

## Visual direction

The route remains in the existing dark product surface system:

- Base surfaces: existing `bg-background` and `bg-card` tokens.
- Accent: existing dPanel blue `text-accent` and a restrained teal edge in
  the hero.
- Text: existing `text-primary` and `text-muted-foreground` tokens.
- Structure: a single compact hero card, one three-column outcome strip, and
  a small closing card. No oversized empty column or stacked fake status
  records.

The signature element is the `Learn → Try → Compare` strip. Its order reflects
the real decision path and is useful without asking the visitor to understand
product internals.

## Responsive and accessibility requirements

- Stack all sections cleanly on narrow screens.
- Keep buttons large enough to activate and retain visible focus states.
- Preserve the external video URL with safe external-link attributes.
- Use a real ordered list for the three-step strip; connecting decoration, if
  used, is optional and aria-hidden.

## Verification

- Update the focused docs-intro test to assert the try-first heading, both
  actions, the three outcome labels, and the absence of the retired
  technical/reference sections.
- Run focused tests, formatting, route lint, production build, and a visual
  desktop/mobile review of the compact layout.
