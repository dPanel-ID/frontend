# Try-first documentation introduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/docs/intro` a compact, plain-language invitation to learn dPanel and begin a trial.

**Architecture:** Replace the current command-center composition with three small public-facing components in `DocsIntroContent`: a compact hero, an ordered Learn → Try → Compare strip, and a closing invitation. Simplify the route shell so it renders only that content and the Docs header, removing reference-oriented data and components from the route file.

**Tech Stack:** React 19, TypeScript, TanStack Start, Tailwind CSS v4, Lucide React, Vitest, Testing Library.

## Global Constraints

- Work on `feat-docs-command-center`; do not modify or push the default branch.
- Preserve the public route `/docs/intro`, the dPanel Docs identity, the `Open app` header action, and the YouTube destination `https://www.youtube.com/@dpanel_id` with `target="_blank"` and `rel="noopener noreferrer"`.
- The primary product action is `Try dPanel` with `href="/"`.
- Use only existing Button, Badge, Lucide, and Tailwind primitives; add no dependency, asset, video embed, pricing API, or provider integration.
- The page must use plain-language product outcomes only. Do not include technical/reference material, provider claims, live pricing, savings claims, or automatic-migration claims.
- Use a compact dark visual system based on existing `bg-background`, `bg-card`, `text-primary`, `text-muted-foreground`, and `text-accent` tokens.
- Preserve visible keyboard focus, semantic heading order, responsive stacking, and reduced-motion-safe behavior.
- Prefix every shell command with `rtk`.
- Deliver by updating PR #2 to `dev`; use squash merge only.

---

### Task 1: Lock the try-first public-content contract

**Files:**
- Modify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**
- Consumes: `DocsIntroContent` exported by `./DocsIntroContent`.
- Produces: regression coverage for the short product proposition, safe external video link, in-app trial action, outcome strip, and removal of the decision-board framing.

- [ ] **Step 1: Replace the command-center expectations with a minimal product-intro contract**

  Replace the main heading expectation with:

  ```tsx
  screen.getByRole('heading', {
    name: 'Try your application before you commit your infrastructure.',
  });
  ```

  Retain the current YouTube URL, `target`, and `rel` assertions. Add the
  internal product action assertion:

  ```tsx
  expect(
    screen.getByRole('link', { name: 'Try dPanel' }).getAttribute('href'),
  ).toBe('/');
  ```

  Require visible labels `Learn in minutes`, `Test with confidence`, and
  `Choose what fits`. Assert that `Operational decision board` and
  `Application record` are not rendered.

- [ ] **Step 2: Run the focused test and confirm the existing command-center UI fails**

  Run:

  ```bash
  rtk pnpm test -- src/app/docs/intro/-view/DocsIntroContent.test.tsx
  ```

  Expected: FAIL because the current component renders `Operate the path from
  code to cloud.` and includes decision-board terminology instead of the
  try-first heading and short outcome labels.

- [ ] **Step 3: Keep the failing contract uncommitted until Task 2 makes it pass**

  Do not create a commit with a deliberately failing test.

### Task 2: Replace the command-center content with the compact try-first story

**Files:**
- Modify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Modify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**
- Consumes: existing `Badge`, `Button`, and Lucide icon components.
- Produces: the existing no-props `DocsIntroContent` export, now with one hero, one three-item ordered strip, and one closing invitation.

- [ ] **Step 1: Define the three short outcomes as typed content data**

  Define a `TryFirstStep` type with `title`, `description`, and `Icon` fields.
  Populate it with exactly these titles and concise supporting text:

  ```ts
  const tryFirstSteps = [
    {
      title: 'Learn in minutes',
      description: 'Start with a short product walkthrough before you change anything.',
    },
    {
      title: 'Test with confidence',
      description: 'Try your application in an environment that fits the experiment.',
    },
    {
      title: 'Choose what fits',
      description: 'Use what the test showed to make the next choice clearer.',
    },
  ] as const;
  ```

  Use one Lucide icon for each item. Do not add technical nouns, metrics, or
  unverified product claims.

- [ ] **Step 2: Implement a compact `TryFirstHero`**

  Replace the command-center hero and decision board with a single dark
  `bg-card` hero using a narrow content measure and compact vertical spacing.
  Use the exact heading:

  ```tsx
  Try your application before you commit your infrastructure.
  ```

  Supporting copy must explain, in one sentence, that dPanel helps people
  learn the product, try an application, and compare the result before making
  the next infrastructure choice. Place `Try dPanel` first with `href="/"`.
  Keep `Watch dPanel on YouTube` as the safe external link. Do not retain a
  tall right-side decision board or any fake record/status UI.

- [ ] **Step 3: Implement the `Learn → Try → Compare` outcome strip and closing invitation**

  Render the three `tryFirstSteps` in an `ol` with responsive single-column
  and three-column layouts. Each item gets a compact icon, its title, and one
  sentence. Below it, render a small `bg-card` closing section with a short
  invitation and the same two action labels. Keep both actions keyboard
  accessible and visually consistent with the hero.

- [ ] **Step 4: Remove the retired command-center-only components and imports**

  Delete `OperationalDecisionBoard`, `OperatingLoop`, `OperatingViews`,
  `DecisionBoundaries`, their record/stage/view data, and any Lucide imports
  used only by those pieces. Keep the public `DocsIntroContent` export and no
  unused imports.

- [ ] **Step 5: Run formatter and the focused test to verify the green state**

  Run:

  ```bash
  rtk pnpm prettier --write src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test -- src/app/docs/intro/-view/DocsIntroContent.test.tsx
  ```

  Expected: the test passes with the new try-first heading, both actions,
  outcome labels, and absence of command-center copy.

- [ ] **Step 6: Commit the self-contained content replacement**

  ```bash
  rtk git add src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk git commit -m "feat(docs): add try-first introduction"
  ```

### Task 3: Remove reference material and in-page navigation from the route shell

**Files:**
- Modify: `src/app/docs/intro/index.tsx`

**Interfaces:**
- Consumes: `DocsIntroContent` as the route’s entire public content.
- Produces: a lean route shell with the skip link, Docs header, metadata, and compact intro only.

- [ ] **Step 1: Reduce `DocsIntroPage` to the header and compact introduction**

  Retain the skip link and `<main id="docs-intro-content">`. Remove
  `DocsPageGuide`, `DocumentationMap`, and `IacStacksSection` from the page
  composition. Keep `DocsHeader` and `DocsIntroContent`; reduce the wrapper
  spacing to match the compact content.

- [ ] **Step 2: Simplify the header and metadata**

  Remove all in-page navigation controls (`Operating loop`, `Sections`) since
  their targets no longer exist. Keep a single visible `Open app` action.
  Set the description to this plain-language content:

  ```ts
  'Learn dPanel, try your application, and use the result to choose the infrastructure that fits your next step.'
  ```

- [ ] **Step 3: Delete reference-only data, components, and imports**

  Delete `Status`, `DocLink`, `DocGroup`, `navigation`, `docGroups`,
  `iacStacks`, `SCREENSHOT_SERVER_DETAIL`, `DocsPageGuide`,
  `DocumentationMap`, `DocGroupCard`, `IacStacksSection`, `StatusBadge`, and
  the imports used only by them. Keep only imports required by the route,
  header, `Link`, `Button`, `BookOpenIcon`, and `DocsIntroContent`.

- [ ] **Step 4: Run route-focused lint and production checks**

  Run:

  ```bash
  rtk pnpm prettier --write src/app/docs/intro/index.tsx
  rtk pnpm lint src/app/docs/intro
  rtk pnpm build
  rtk git diff --check
  ```

  Expected: formatter, lint, production build, and diff check complete
  without errors. Existing chunk-size warnings may remain unrelated to this
  route.

- [ ] **Step 5: Commit the lean route shell**

  ```bash
  rtk git add src/app/docs/intro/index.tsx
  rtk git commit -m "refactor(docs): remove reference-heavy intro content"
  ```

### Task 4: Verify the compact layout and update the pull request

**Files:**
- Verify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Verify: `src/app/docs/intro/index.tsx`

**Interfaces:**
- Consumes: the finished static `/docs/intro` route.
- Produces: evidence that the page is concise, responsive, accessible, and ready for review.

- [ ] **Step 1: Run final source and build verification**

  Run:

  ```bash
  rtk pnpm prettier --check src/app/docs/intro/index.tsx src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test
  rtk pnpm lint src/app/docs/intro
  rtk pnpm build
  rtk git diff --check origin/dev...HEAD
  ```

  Expected: all commands exit successfully. Record the repository’s existing
  Node-engine, Vitest close-timeout, and chunk-size warnings transparently if
  they appear after successful command exits.

- [ ] **Step 2: Inspect the local page at desktop and narrow widths**

  Run:

  ```bash
  rtk pnpm dev
  ```

  Inspect `/docs/intro` at desktop and narrow widths. Verify there is no tall
  empty hero area, no decision-board column, no technical reference block,
  readable ordered steps, and both `Try dPanel` and video actions are visible.

- [ ] **Step 3: Push the completed branch to update PR #2**

  Run:

  ```bash
  rtk git push
  ```

  Confirm PR #2 targets `dev`, remains open for review, and records squash
  merge as the required integration method.
