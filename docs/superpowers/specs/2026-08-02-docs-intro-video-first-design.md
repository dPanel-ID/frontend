# Video-first dPanel documentation introduction

## Purpose

Redesign `/docs/intro` from a long product inventory into a concise, video-first
orientation page. Its job is to help a first-time visitor understand dPanel,
watch the product in action, and feel confident trying an application on their
own infrastructure before choosing where it should run.

## Audience and user outcome

The page serves business owners, developers, non-technical collaborators, and
operators. It must make the same operational story understandable at different
depths:

- Business owners see the cost and operational consequences of an application
  test before committing to a provider.
- Developers learn a repeatable path to deploy, observe, and compare an
  application on real infrastructure.
- Non-technical collaborators can begin with guided video and plain-language
  status rather than cloud consoles.
- Operators retain a portable, auditable route when the team later changes
  provider.

The desired outcome is that a visitor watches the dPanel product tour, starts
to explore a test deployment, and understands that dPanel helps them compare
the cloud resources used during that test before deciding what fits.

## Product statement

The opening message is:

> Learn, test, and choose the cloud that fits your application.

Supporting copy should explain that users can learn through dPanel video
walkthroughs, test an application on infrastructure they control or a supported
provider, compare the cost and operational fit of that test, and keep a
repeatable deployment path if they later move.

Use `supported providers` rather than claiming universal provider support.
Do not imply an instant or automatic migration; promise less rework through
repeatable, portable deployment instead.

## Information architecture

Retain the public route and the existing documentation map, but reorder the
page around this journey:

1. **Video-first hero** — product statement, one clear primary action to visit
   [dPanel on YouTube](https://www.youtube.com/@dpanel_id), and a secondary
   in-page action to understand the testing journey.
2. **Deployment passport** — a horizontal, four-stage explanation:
   `Learn → Test → Compare → Keep or move`. This is the page's signature
   visual, because it represents the actual decision path rather than a generic
   SaaS feature grid.
3. **Audience outcomes** — compact business-owner, developer, and
   non-technical explanations, each rooted in the same test result.
4. **What a test helps you decide** — compare the cloud resources used,
   operational fit, and future portability before selecting a provider.
5. **Documentation library** — preserve the existing detailed map, safety
   model, and product-status language as reference material below the
   orientation content.

The existing broad "why", "problems", and "benefits" material should be
consolidated rather than repeated. The page should answer the visitor's first
question before offering the complete product reference.

## Experience and visual direction

This is a modern operational SaaS introduction, not a marketing landing page.
It should continue using the current dPanel system: `bg-card` and
`bg-background` surfaces, standard borders, `rounded-lg` or smaller radii,
the existing blue accent, and compact, legible data-oriented typography. No new
custom shell, gradients, decorative orbs, oversized rounded cards, or external
font load is required.

The hero splits into two purposeful columns on large screens:

```text
┌──────────────────────────┬──────────────────────────┐
│ Learn, test, and choose  │  Watch dPanel in action  │
│ the cloud that fits      │  [video learning panel]  │
│                          │  Opens YouTube channel   │
│ [Watch product tour]     │                          │
│ [See testing journey]    │                          │
└──────────────────────────┴──────────────────────────┘
┌──── Learn ──── Test ──── Compare ──── Keep or move ─┐
└─────────────────────────────────────────────────────┘
```

The video panel links to the dPanel YouTube channel instead of embedding a
specific video. This keeps the page fast, avoids an unverified video ID, and
lets the channel remain the source of current learning material. Its call to
action must make the external destination clear.

On narrow viewports, the hero becomes a single column; the video action follows
the copy, and the deployment passport becomes an accessible vertical sequence.
All text must retain a stable line length and never depend on image text.

## Content and interaction details

- Primary CTA: `Watch dPanel on YouTube`, external link with an appropriate
  external-destination affordance and accessible label.
- Secondary CTA: `See the testing journey`, scrolls to the deployment passport
  or testing-decision section.
- The passport uses concise verbs and descriptions, not product jargon:
  - **Learn:** watch a real workflow before opening a console.
  - **Test:** deploy an application on a chosen infrastructure path.
  - **Compare:** review the cloud resources and cost used during the test,
    alongside operational fit.
  - **Keep or move:** choose the best fit now, while retaining a repeatable
    path when requirements change.
- Audience cards must name the practical outcome rather than a role label
  alone: understand the spend decision, ship with evidence, or follow the
  result without technical tooling.
- Existing availability labels such as `Now`, `V2`, and `Plan` stay visible in
  the reference content so no roadmap feature is represented as already
  available.

## Technical scope

The implementation stays within the existing docs route:

- `src/app/docs/intro/index.tsx`
- existing shared `Button`, `Badge`, icons, and design tokens

No provider-pricing API, test-comparison calculator, new analytics pipeline,
or cloud-migration backend flow is introduced by this page redesign. The copy
describes the approved product value; live price values must only be rendered
when a typed, current product contract exists.

## Accessibility and resilience

- Use semantic heading order and landmark-safe section IDs.
- Keep all primary actions keyboard reachable with visible focus.
- Give the external video link an accurate accessible name and `rel` safety
  attributes when it opens a new tab.
- Do not rely on autoplay, embedded third-party video, or motion to explain the
  product. Hover treatment must not be required and reduced-motion preferences
  must be respected.
- If the YouTube destination is unavailable, the page still communicates the
  product and exposes the stable channel URL as a normal link.

## Verification

After implementation, verify the docs route at desktop and mobile widths:

- the hero communicates the four-stage journey without scrolling;
- the YouTube CTA has the correct URL, keyboard focus, and external-link
  semantics;
- in-page navigation reaches the testing journey and documentation map;
- the documentation map and status labels remain readable and unchanged in
  meaning;
- dark mode and narrow layouts preserve contrast, order, and text wrapping;
- focused lint/type checks and a production build pass.

## Non-goals

- Promising compatibility with every cloud provider before its path is
  supported.
- Claiming automatic migration or publishing provider price figures without
  live product data.
- Reworking the application dashboard, authentication flow, or provider
  contracts.
