# Contributing

Thanks for helping with dPanel. This guide gets you from a fresh clone to a
pull request.

## Prerequisites

- Node.js 24 (`node --version` should print `v24.x`).
- pnpm 11. With Corepack: `corepack enable`. Otherwise `npm install -g pnpm@11`.
- Git.

No backend, database or cloud account is needed: the mock API stands in for
them.

## Set up and run

```bash
git clone https://github.com/dPanel-ID/frontend.git
cd frontend
pnpm install
pnpm dev:mock
```

Then open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
`Ctrl+C` stops both the app and the mock API.

## Mock API

`pnpm dev:mock` runs the app against a simulated dPanel API, so you can work on
the UI without the real backend.

How it works:

1. `mock/swagger.json` is a snapshot of the API contract published at
   [pawon.devetek.app/swagger](https://pawon.devetek.app/swagger/index.html).
2. `mock/examples/*.json` hold realistic responses for the endpoints the main
   pages call first (session, servers, applications, workspace).
3. `scripts/mock/prepare-spec.mjs` merges the two into `.mock/openapi.json`.
4. [Prism](https://github.com/stoplightio/prism) serves that contract on
   `http://127.0.0.1:4010`. The app's API base URL comes from `.env.mock`.

### Signing in

There is nothing to sign in to. The mock answers `GET /api/v1/user/profile`
with a signed-in **Demo User** (`demo@example.com`) who owns one workspace,
**Demo Team**, so every page opens as if you had logged in.

- The email and password form accepts anything and reports success.
- **Sign out** shows success, but you stay signed in, because the profile
  response never changes.
- **Continue with Google** and **GitHub** go to `/api/v1/auth/...` and end on a
  mock response: OAuth needs the real backend.

### What works and what does not

- Pages whose endpoints have an example in `mock/examples` show realistic
  data: the dashboard, servers list, server detail, applications list and the
  docs.
- Every other endpoint returns data generated from its schema: `"string"` for
  text and `0` for numbers. Pages built on them may show placeholders or an
  "An error has occurred" panel when a value fails validation (for example an
  unknown status).
- Nothing is saved. Creating, editing or deleting returns success, but a
  reload shows the same data.
- The browser terminal, file manager downloads, database manager, live logs
  and anything that reaches a real server do not work.
- An endpoint the backend has but the contract does not describe returns 404.

### Add or change an example

Open a page, look for the failing request in the browser's network tab, and
add its response to a file in `mock/examples/`. Keys are the method and the
path exactly as the contract writes them, with `{id}` placeholders:

```json
{
  "GET /api/v1/domain/find": {
    "code": 200,
    "status": "success",
    "error": null,
    "data": {
      "domains": [],
      "pagination": { "page": 1, "size": 0, "total_item": 0, "total_page": 0 }
    }
  }
}
```

Restart `pnpm dev:mock` to pick it up. The script stops with an error if a key
matches no endpoint. Use example data only: names like `demo`, addresses from
`203.0.113.0/24` or `192.168.0.0/16`, and domains under `example.com`. Never
put real hostnames, IPs, emails or secrets in a mock.

When the API changes, refresh the contract with `pnpm mock:spec` and commit
`mock/swagger.json` with the change that needs it.

### Against a real backend

`pnpm dev` uses `.env.development`. To point the app at another API, create
`.env.local` (it is gitignored) and set `VITE_BACKEND`, for example
`VITE_BACKEND="https://your-api.example.com/api"`. Sign-in uses a cookie set by
the backend, so the app and the API must share a parent domain over HTTPS; the
`Caddyfile` shows one way to serve both locally.

## Explore the real API

The mock is for building UI. To see how dPanel behaves with your own data, use
the live API reference at
[pawon.devetek.app/swagger](https://pawon.devetek.app/swagger/index.html). It
lists every endpoint the dashboard uses, with its parameters and response
shapes, and **Try it out** sends a real request.

1. Sign in at [dnocs.devetek.app](https://dnocs.devetek.app) with your dPanel
   account.
2. Open the Swagger page in the same browser and try a read-only call first,
   such as `GET /api/v1/user/profile` or `GET /api/v1/server/find`.
3. To work in a team workspace, set the `x-auth-organization-id` header to that
   workspace's ID (shown on your profile page).

Requests run as you, on your real servers, applications and data. A `POST`,
`PUT` or `DELETE` really creates, changes or deletes things, so use a test
workspace or test resources while you experiment.

This is the same contract the mock serves, so what you learn there applies to
`pnpm dev:mock`. Use it to:

- understand the data behind a page before you change it;
- copy a real response shape, with your own values replaced by demo data, into
  `mock/examples/`;
- build your own tool or product on top of dPanel, or reshape a flow in this
  frontend so it fits the way you work.

If you build something that would help other dPanel users, a better flow, a
new page or a fix, please open a pull request. See
[Branches, commits and pull requests](#branches-commits-and-pull-requests).

## Project structure

```text
src/
├── app/             routes (TanStack Router file routes) and page-level code
├── features/        user actions and workflows: forms, modals, side panels
├── widgets/         larger business-aware UI blocks
├── entities/        business concepts: Zod schemas, API adapters, small UI
├── services/        app-wide services: auth, i18n, dialog, toaster, sidepanel
├── shared/          generic code: api client and endpoint recipes, UI atoms, utils
│   └── api/         one file per endpoint, e.g. server.detail.$id.ts
└── documentations/  the public docs, in English (en/) and Indonesian (id/)
mock/                the API contract snapshot and mock examples
scripts/             build, SEO and mock scripts
```

Layers import only from layers below them: `app` → `features` → `widgets` →
`entities` → `services` → `shared`. `RULES.md` and `AGENTS.md` describe the
conventions in detail: data fetching through `src/shared/libs/api-client`, Zod
as the source of truth for shapes, usecases as hooks, and the UI standard
(the servers module is the reference for new pages).

Some ground rules:

- Never render, log, copy into mock data or show in a screenshot any secret:
  passwords, tokens, private keys, provider credentials.
- Write user-facing text for both English and Indonesian.
- Keep components small and reuse the shared primitives before adding new ones.

## Documentation

The docs at `/docs` are Markdown files under `src/documentations/`. Read
[src/documentations/README.md](src/documentations/README.md) before editing.
In short:

- Every page exists in both `en/` and `id/`, with the same file name.
- Write for a beginner first and keep exact details for experts.
- Images go in `src/documentations/assets/` as `.webp`, with alt text.
- Screenshots must not show real people, emails, hostnames, IP addresses,
  workspace IDs or secrets. Use demo data or redact with solid boxes.
- `pnpm test` fails on a page in one language only, a broken link or image, or
  an image without alt text.

## Before you open a pull request

```bash
pnpm type-check
pnpm test
pnpm exec eslint <files you changed>
pnpm exec prettier --write <files you changed>
```

`pnpm lint` checks the whole repository, which still has older warnings and
errors; make sure it reports nothing new in the files you touched.

## Branches, commits and pull requests

- Branch from `dev`. Name the branch `feat-<short-scope>` for a feature or
  `fix-<short-scope>` for a fix, in kebab-case, for example
  `fix-server-list-empty-state`.
- Commit titles follow [Conventional Commits](https://www.conventionalcommits.org/):
  `<type>(optional-scope): summary`, with type one of `feat`, `fix`, `docs`,
  `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  Example: `fix(servers): keep the filter when the list refreshes`.
- Open the pull request against `dev`. Describe what changed and why, and add
  a screenshot for UI changes (taken against the mock API or demo data).
- Pull requests are squash-merged, so the title becomes the commit on `dev`.
  Use the same Conventional Commits format for it.

## Reporting a security problem

Do not open a public issue. Report it privately through the repository's
**Security** tab, **Report a vulnerability**.
