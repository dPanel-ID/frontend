# Command-center dPanel documentation introduction

## Purpose

Redesign `/docs/intro` so it feels like the entry point to dPanel's real
operations workspace, not a generic documentation landing page. The page's
single job is to make a first-time visitor want to learn the product, then
understand that dPanel connects an application, its infrastructure, and the
evidence needed to choose an operating path.

## Product grounding

dPanel is an operational control plane. The authenticated product groups
Applications, Servers, Cloud Projects, Load Balancers, Domains and DNS,
Secrets, deployment state, and workspace IaC in one workspace. An application
record connects repository, runtime, server, service, deployment state, and
ownership; cloud projects and server health give that delivery record context.

The public page must communicate that practical operating model. It must not
present dPanel as a generic cloud marketplace, a live pricing calculator, or
an automatic cloud-migration tool.

## Audience and outcome

- **Business teams** see an understandable operational picture before making
  an infrastructure commitment.
- **Developers** see how source, runtime, deployment, and server context stay
  connected.
- **Non-technical collaborators** can begin with the video and follow a
  visible decision trail instead of provider dashboards.

The desired outcome is that a visitor watches the walkthrough, recognizes the
kind of operational workspace dPanel provides, and follows the documentation
to explore the relevant workflow.

## Design direction

Use **Product command center**, translated from the existing product—not a
neon sci-fi treatment and not a generic cloud-vendor page.

### Compact visual system

- **Operations navy** `#111827`: the deep control-room surface used for the
  command board and high-attention moments.
- **Panel slate** `#1F2937`: structured board and metadata panels.
- **Canvas mist** `#F7F9FC`: breathable documentation background in light
  mode.
- **Signal blue** `#3B82F6`: focus, connections, and primary actions.
- **Ready green** `#10B981`: healthy or available state only.
- **Attention coral** `#F97066`: failed or needs-attention state only.

Implementation must preferentially map these roles to existing theme tokens
so light and dark modes remain coherent. The page should use the product's
compact operational typography, status pills, tabular metadata, and thin
rules; it must not introduce a new brand font or an image-dependent layout.

### Signature element: the operational decision board

The first fold contains a composed, non-interactive dashboard artifact rather
than a generic illustration or another stack of feature cards. It shows the
real relationship that makes dPanel distinctive:

```text
  repository ──> application ──> deployment ──> server / provider
                        │                │                │
                   runtime & repo     health / logs    decision evidence
```

Each node is labeled with a truthful product concept. Small semantic status
markers make the board feel like an operating surface, but no invented live
metrics, pricing, or customer data appear. The board is the one intentional
visual risk: it gives the documentation page the product's control-room
character without pretending it is a live dashboard.

## Information architecture

1. **Command-center hero** — concise product thesis, YouTube CTA, documentation
   CTA, and the decision board. The message is about running the same
   application with a connected operational record, then choosing based on
   evidence.
2. **The operating loop** — `Learn → Connect → Run → Decide`, expressed as a
   connected rail rather than four unrelated cards. It evolves the existing
   useful testing story into dPanel's actual application-to-infrastructure
   model.
3. **One platform, different operating views** — three compact, role-aware
   panels that use shared objects (application, server, deployment) instead of
   generic persona benefits.
4. **Decision evidence and portability** — explain the boundary: users compare
   recorded resource, operational, and cloud-cost evidence during a test;
   dPanel does not provide live provider prices or automatic migration.
5. **Documentation map and safety sections** — retain the existing detailed
   reference, release labels (`Now`, `V2`, `Plan`), IaC content, and safety
   model below the orientation content.

## Layout and responsive behavior

```text
desktop
┌─────────────────────── hero copy ──────────────────────┬─ decision board ─┐
│ product thesis · video CTA · docs CTA                   │ app → deploy →  │
│ concise operational promise                              │ server → evidence│
└─────────────────────────────────────────────────────────┴─────────────────┘
┌── Learn ───────── Connect ───────── Run ───────── Decide ─────────────────┐
└────────────────────────────────────────────────────────────────────────────┘
┌──────── shared operating context ────────┬── role-aware operational views ┐
└──────────────────────────────────────────┴────────────────────────────────┘
```

On mobile, copy appears first, the board becomes a vertically ordered record,
and the operating rail becomes a labeled vertical sequence. The board must be
comprehensible without hover, fixed positioning, or horizontal overflow.

## Content and interactions

- Keep `Watch dPanel on YouTube` as the primary external CTA, including an
  accurate accessible label and safe new-tab attributes.
- Use an internal CTA such as `Explore the operating loop`, which scrolls to
  the connected process section.
- Use product words people can recognize: **Application**, **Deployments**,
  **Servers**, **Cloud Projects**, **Domains**, and **IaC**.
- Preserve truthful boundaries: supported providers only; recorded test
  evidence rather than live price comparison; a future move is easier to plan,
  not automatic.
- Keep keyboard focus visible, preserve the skip link, and respect reduced
  motion. Any connector-line animation is decorative and disabled for reduced
  motion.

## Technical design

- Keep the route contract and existing documentation-map, IaC, and safety
  components intact in `src/app/docs/intro/index.tsx`.
- Reshape the focused `DocsIntroContent` component into semantic subcomponents
  within its view folder: `CommandCenterHero`, `OperatingLoop`, and
  `OperatingViews` as needed. Pure data remains colocated with the component.
- Reuse existing `Button`, `Badge`, Lucide icons, and Tailwind theme tokens.
- Add focused tests for the new hero thesis, both CTAs, the operating-loop
  labels, decision-board concepts, and the safety boundaries.
- No new backend endpoint, provider integration, screenshot fixture, external
  font, image asset, pricing API, or migration workflow is introduced.

## Verification

- Render the content test and verify the YouTube URL, internal anchor, command
  board labels, operating loop, and safety wording.
- Run focused docs lint, formatter check, and production build.
- Review desktop, 375px, and 320px visual layouts in both available color
  themes; verify no node or status text is clipped.
- Verify the internal CTA reaches the operating loop and the existing
  documentation map remains reachable.

## Non-goals

- Redesigning the authenticated dashboard, provider integrations, or API
  contracts.
- Fabricating customer metrics, current price data, provider coverage, or
  automatic migration capability.
- Removing product availability labels or the detailed reference material.
