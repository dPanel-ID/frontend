# Command-center documentation introduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe `/docs/intro` as a distinctive dPanel command-center introduction that makes its application-to-infrastructure operating model visible and compelling.

**Architecture:** Keep the existing public route and documentation reference sections intact. Replace only the focused orientation content with a semantic composition: a command-center hero and decision board, a connected operating loop, role-aware operating views, and honest decision-boundary content. Keep visual data static and clearly illustrative; do not add product APIs, video embeds, assets, or dependencies.

**Tech Stack:** React 19, TypeScript, TanStack Start route, Tailwind CSS v4 theme tokens, Lucide React, Vitest, Testing Library.

## Global Constraints

- Work on `feat-docs-command-center`; do not modify the default branch.
- Use the existing `Button`, `Badge`, Lucide icons, and Tailwind theme tokens; add no dependency, font, image asset, pricing API, or provider integration.
- Preserve `DocsIntroPage`, `DocumentationMap`, `IacStacksSection`, `SafetySection`, the skip link, and release labels (`Now`, `V2`, `Plan`).
- The public copy must say `supported providers`, not universal cloud support; it must not promise live pricing, savings, or automatic migration.
- Preserve the YouTube destination `https://www.youtube.com/@dpanel_id` with `target="_blank"` and `rel="noopener noreferrer"`.
- Keep the decision board illustrative: no invented live customer data, current provider price, health value, or telemetry metric.
- Maintain visible keyboard focus, semantic heading order, mobile readability at 320px, and reduced-motion-safe presentation.
- Prefix every shell command with `rtk`.
- Deliver through a PR to `dev`; use squash merge only.

---

### Task 1: Lock the command-center contract with a focused failing test

**Files:**
- Modify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**
- Consumes: `DocsIntroContent` exported by `./DocsIntroContent`.
- Produces: a regression contract for the command-center hero, operating loop, video link, internal anchor, decision-board vocabulary, and truthful decision boundaries.

- [ ] **Step 1: Replace the existing orientation assertion with the command-center contract**

  Update the test’s expectation to require this heading:

  ```tsx
  screen.getByRole('heading', {
    name: 'Operate the path from code to cloud.',
  });
  ```

  Retain the existing assertions for the YouTube URL, `target`, and `rel`.
  Replace the old internal CTA assertion with:

  ```tsx
  expect(
    screen
      .getByRole('link', { name: 'Explore the operating loop' })
      .getAttribute('href'),
  ).toBe('#operating-loop');
  ```

  Require the board labels `Application record`, `Deployment evidence`,
  `Server and provider`, and `Decision context`; require loop headings
  `Learn`, `Connect`, `Run`, and `Decide`; retain the assertions that live
  provider pricing and automatic migration are not promised.

- [ ] **Step 2: Run the focused test and confirm the current implementation fails**

  Run:

  ```bash
  rtk pnpm test -- src/app/docs/intro/-view/DocsIntroContent.test.tsx
  ```

  Expected: FAIL because the current content still renders the previous
  `Learn, test, and choose...` heading and testing-journey CTA.

- [ ] **Step 3: Commit the test contract only if it is independently useful**

  Do not commit a deliberately failing test by itself. Keep it staged with the
  implementation in Task 2 so every commit remains buildable.

### Task 2: Build the command-center orientation content

**Files:**
- Modify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Modify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**
- Consumes: shared `Badge` and `Button` components; Lucide icon components;
  the fixed test contract from Task 1.
- Produces: `DocsIntroContent`, preserving its no-props public interface for
  `DocsIntroPage`.

- [ ] **Step 1: Define concise, typed content data**

  Replace the previous journey and persona data with two typed collections:

  ```ts
  type OperatingStage = {
    title: 'Learn' | 'Connect' | 'Run' | 'Decide';
    description: string;
    Icon: ComponentType<{ className?: string }>;
  };

  type OperatingView = {
    label: string;
    title: string;
    description: string;
    signal: string;
    Icon: ComponentType<{ className?: string }>;
  };
  ```

  Use product-grounded labels and copy only: Application, Repository,
  Deployment, Server, Cloud Project, execution history, and documented
  evidence.

- [ ] **Step 2: Implement `CommandCenterHero` and `OperationalDecisionBoard` inside the view file**

  Add internal components beneath the data definitions. The hero must use the
  exact thesis `Operate the path from code to cloud.` and place the external
  video link beside an internal `Explore the operating loop` link.

  The board must be a dark, high-contrast operational artifact using existing
  Tailwind utilities and no image. Build four semantic records in a connected
  vertical or grid layout:

  ```text
  Application record → Deployment evidence → Server and provider → Decision context
  ```

  Use short labels such as `Repository connected`, `Execution recorded`,
  `Infrastructure selected`, and `Compare what the test shows`. Include only
  semantic state badges such as `Connected`, `Recorded`, and `Ready to review`;
  never invent a number, dollar amount, provider price, or live health value.

- [ ] **Step 3: Implement `OperatingLoop` and `OperatingViews`**

  Render a connected `ol` with `id="operating-loop"` and the four ordered
  stages. On wide layouts, use an explicit connecting rule behind the stage
  nodes; on narrow layouts, use a visible vertical rule. The connection must be
  decorative (`aria-hidden="true"`), and the ordered-list text must carry the
  whole meaning.

  Follow the loop with a compact section titled `One operational record, useful
  to every decision-maker.` Each view must explain the same objects from a
  different angle:

  - Business: understand the operational commitment.
  - Developers: trace code through a deployment.
  - Teams: follow the decision without provider dashboards.

- [ ] **Step 4: Retain and reshape the honest decision-boundary section**

  Keep the safety sentence that dPanel is `not a live provider-pricing
  calculator` and that `A move is not automatic.` Update its presentation to
  pair `Choose with evidence` and `Keep future options open` with the command
  board vocabulary. Do not change the factual meaning.

- [ ] **Step 5: Run the focused test and formatter**

  Run:

  ```bash
  rtk pnpm prettier --write src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test -- src/app/docs/intro/-view/DocsIntroContent.test.tsx
  ```

  Expected: PASS with the new hero, CTA, board, loop, and boundary assertions.

- [ ] **Step 6: Commit the self-contained orientation redesign**

  ```bash
  rtk git add src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk git commit -m "feat(docs): add command-center introduction"
  ```

### Task 3: Align docs navigation and metadata with the operating model

**Files:**
- Modify: `src/app/docs/intro/index.tsx`

**Interfaces:**
- Consumes: the `#operating-loop` section introduced by `DocsIntroContent`.
- Produces: accurate page metadata and internal navigation without changing
  the existing documentation-map, IaC, or safety section IDs.

- [ ] **Step 1: Update the top navigation and page-guide collection**

  Change the first top-nav anchor and the first `navigation` entry from the
  testing journey to the operating loop:

  ```tsx
  <a href="#operating-loop">Operating loop</a>
  ```

  Keep the `#decision-evidence`, `#documentation-map`, `#iac-stacks`, and
  `#safety-model` entries so reference navigation remains complete.

- [ ] **Step 2: Update the meta description without overstating capability**

  Replace the current testing-led description with one that names the real
  control-plane concepts: application delivery, connected infrastructure,
  recorded operational and cloud-cost evidence during testing, and a future
  path that is easier to plan rather than automatic.

- [ ] **Step 3: Run focused lint and structural checks**

  Run:

  ```bash
  rtk pnpm lint src/app/docs/intro
  rtk git diff --check
  ```

  Expected: both commands complete without diagnostics for the modified docs
  route.

- [ ] **Step 4: Commit the navigation alignment**

  ```bash
  rtk git add src/app/docs/intro/index.tsx
  rtk git commit -m "docs(docs): align intro navigation with operating loop"
  ```

### Task 4: Perform production and visual verification

**Files:**
- Verify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Verify: `src/app/docs/intro/index.tsx`

**Interfaces:**
- Consumes: the completed docs route and focused test contract.
- Produces: evidence that the static route is responsive, accessible, and
  production-buildable.

- [ ] **Step 1: Run the complete local verification set**

  Run:

  ```bash
  rtk pnpm prettier --check src/app/docs/intro/index.tsx src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test
  rtk pnpm lint src/app/docs/intro
  rtk pnpm build
  rtk git diff --check
  ```

  Expected: formatter, tests, focused lint, production build, and diff check
  pass. Record repository-wide lint or type-check failures only when they are
  outside the changed docs paths.

- [ ] **Step 2: Start the local server and inspect the route at desktop and mobile widths**

  Run:

  ```bash
  rtk pnpm dev
  ```

  Review `http://127.0.0.1:3000/docs/intro` at 1440px, 375px, and 320px.
  Verify the dark decision board has readable contrast, the four operating
  stages remain ordered and unclipped, the header does not truncate, and no
  layout depends on hover.

- [ ] **Step 3: Verify interactions and document status**

  Click `Explore the operating loop` and verify the location hash is
  `#operating-loop`. Keyboard-focus the external video CTA and verify it has
  the intended destination and new-tab safety attributes. Confirm the
  documentation map and status labels remain present below the orientation
  content.

- [ ] **Step 4: Commit verification-only corrections if visual review requires them**

  If visual review changes source files, repeat the focused test and lint
  commands above, then commit with a precise conventional message such as:

  ```bash
  rtk git add src/app/docs/intro
  rtk git commit -m "fix(docs): refine command-center mobile layout"
  ```

## Self-review

- **Spec coverage:** Task 2 implements the command-center hero, illustration
  board, operating loop, role-aware views, video CTA, decision boundaries, and
  responsive structure. Task 3 preserves and aligns navigation and metadata.
  Task 4 covers formatter, tests, focused lint, production build, responsive
  review, keyboard access, and existing reference content.
- **Placeholder scan:** No deferred markers or unspecified test step remains.
- **Type consistency:** `DocsIntroContent` remains the sole exported component
  with no props. `OperatingStage` and `OperatingView` are file-local data types
  consumed only by the planned internal components.
