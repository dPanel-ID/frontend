# Provider comparison and IaC portability implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Explain the available cloud-provider trial path and IaC continuity on the compact `/docs/intro` page.

**Architecture:** Extend the existing static `DocsIntroContent` component with one semantic two-card section between the outcome strip and final invitation. Keep the provider labels and card content as typed local constants, reuse the page’s existing card/icon primitives, and expand the existing component contract test rather than introducing routing, data fetching, or dependencies.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, Testing Library, Lucide React.

## Global Constraints

- Preserve the public `/docs/intro` route, existing hero, actions, header, and final invitation.
- Add only the available provider labels: `IDCloudHost`, `AWS`, `GCP`, `Vultr`, and `Manual SSH Access`.
- State that users can run an application with a provider they want to evaluate and compare the result against their requirements; do not promise interchangeable providers, prices, regions, automatic migration, or savings.
- State that every change is tracked with `OpenTofu` and `Ansible`, and that users can keep using the same IaC in their own platform later; do not make legal ownership or provider-independent-execution claims.
- Use existing components and dependencies only, retain the compact dark design, and make the new grid one column below `md`.
- Preserve safe YouTube links, accessible semantics, and keyboard-accessible existing actions.

---

### Task 1: Add the provider comparison and IaC portability section

**Files:**

- Modify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Modify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**

- Consumes: the existing no-props `DocsIntroContent` export, `Badge`, `Button`, and Lucide icon components.
- Produces: the same no-props `DocsIntroContent` export with a semantic `TryFirstReasons` section between `TryFirstOutcomeStrip` and `TryFirstInvitation`.

- [ ] **Step 1: Extend the failing content contract**

  Add expectations to `DocsIntroContent.test.tsx` for these headings and labels:

  ```tsx
  expect(
    screen.getByRole('heading', { name: 'Try providers. Compare the fit.' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('heading', { name: 'Keep your IaC in your hands.' }),
  ).toBeTruthy();

  for (const provider of [
    'IDCloudHost',
    'AWS',
    'GCP',
    'Vultr',
    'Manual SSH Access',
  ]) {
    expect(screen.getByText(provider)).toBeTruthy();
  }

  expect(
    screen.getByText(/Every change is tracked with OpenTofu and Ansible/),
  ).toBeTruthy();
  ```

- [ ] **Step 2: Run the focused test to prove the contract is red**

  Run:

  ```bash
  rtk pnpm test src/app/docs/intro/-view/DocsIntroContent.test.tsx
  ```

  Expected: FAIL because the provider and IaC headings do not yet render.

- [ ] **Step 3: Implement the compact two-card section**

  In `DocsIntroContent.tsx`:
  1. Import `CloudIcon` and `GitBranchIcon` from `lucide-react`.
  2. Declare `const availableProviders = ['IDCloudHost', 'AWS', 'GCP', 'Vultr', 'Manual SSH Access'] as const;` near `tryFirstSteps`.
  3. Add a local `TryFirstReasons` component that renders:
     - section eyebrow `Why try it with dPanel` and heading `Compare providers. Keep your IaC.`;
     - a `grid gap-3 md:grid-cols-2` of two `rounded-xl border bg-card p-5` cards;
     - provider card eyebrow `Compare your options`, heading `Try providers. Compare the fit.`, exact approved body copy, and a semantic labelled list containing every `availableProviders` value;
     - IaC card eyebrow `Your infrastructure, documented`, heading `Keep your IaC in your hands.`, and exact approved body copy with `OpenTofu` and `Ansible`;
     - the established bordered icon square treatment, with `CloudIcon` and `GitBranchIcon` respectively.
  4. Render `<TryFirstReasons />` immediately after `<TryFirstOutcomeStrip />` and before `<TryFirstInvitation />`.

- [ ] **Step 4: Run focused format, test, and lint checks**

  Run:

  ```bash
  rtk pnpm prettier --write src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm lint src/app/docs/intro
  rtk git diff --check
  ```

  Expected: all commands exit 0; retain the expected local Node-engine warning if shown.

- [ ] **Step 5: Commit the completed UI and contract change**

  Run:

  ```bash
  rtk git add src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk git commit -m "feat(docs): explain provider trials and iac portability"
  ```

### Task 2: Verify the complete introduction in the running local preview

**Files:**

- Verify: `src/app/docs/intro/-view/DocsIntroContent.tsx`
- Verify: `src/app/docs/intro/-view/DocsIntroContent.test.tsx`

**Interfaces:**

- Consumes: the completed static intro component and the running Vite preview.
- Produces: evidence that the added content is readable, compact, and free of unsupported claims.

- [ ] **Step 1: Run full page verification**

  Run:

  ```bash
  rtk pnpm prettier --check src/app/docs/intro/-view/DocsIntroContent.tsx src/app/docs/intro/-view/DocsIntroContent.test.tsx
  rtk pnpm test
  rtk pnpm build
  rtk git diff --check origin/dev...HEAD
  ```

  Expected: all commands exit 0. Record any existing Node-engine, Vitest close-timeout, or build chunk-size warnings transparently if they occur after success.

- [ ] **Step 2: Inspect the running page**

  Open `http://localhost:3001/docs/intro` and confirm:
  1. Both new cards appear after the three-step strip and before the final call to action.
  2. All five provider labels are readable and wrap without increasing the page with empty space.
  3. The IaC card names OpenTofu and Ansible without a technical reference block.
  4. The original `Try dPanel` and YouTube actions remain visible.

- [ ] **Step 3: Push the feature branch to update PR #2**

  Verify the branch is `feat-docs-command-center`, then run:

  ```bash
  rtk git push
  ```

  Expected: only the feature branch updates; PR #2 remains open against `dev` and continues to require squash merge.
