# dPanel frontend

The web app behind [dnocs.devetek.app](https://dnocs.devetek.app): the dPanel
dashboard (servers, applications, databases, load balancers, domains, teams)
and the public documentation at [/docs](https://dnocs.devetek.app/docs/intro).

It is a React 19 app built with TanStack Start and Router, Vite, Tailwind CSS
and Zod. It talks to the dPanel API, whose public contract is at
[pawon.devetek.app/swagger](https://pawon.devetek.app/swagger/index.html).

## Quick start

You need Node.js 24 and pnpm 11 (`corepack enable` or `npm install -g pnpm@11`).

```bash
pnpm install
pnpm dev:mock
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard). You
are signed in as **Demo User** against a simulated API, so no backend, account
or credentials are needed. See [Mock API](CONTRIBUTING.md#mock-api) for what it
can and cannot do.

## Commands

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev:mock`     | App on port 3000 plus a mock API on port 4010. Start here.  |
| `pnpm dev`          | App on port 3000 against the API in `.env.development`.     |
| `pnpm test`         | Unit, component and docs tests (Vitest).                    |
| `pnpm lint`         | ESLint.                                                     |
| `pnpm type-check`   | TypeScript, no output.                                      |
| `pnpm build:static` | The static site that is deployed (`.output-static/client`). |
| `pnpm mock:spec`    | Refresh the API contract snapshot in `mock/swagger.json`.   |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the project layout, conventions,
the mock API and how to open a pull request. To explore the real API with
your own data, see [Explore the real API](CONTRIBUTING.md#explore-the-real-api). Documentation pages live in
[src/documentations](src/documentations/README.md).

## Security

Please do not open a public issue for a security problem. Report it privately
through the repository's **Security** tab, **Report a vulnerability**.

## License

MIT, see [LICENSE](LICENSE).
