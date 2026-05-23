## Getting Started

This project uses HTTPS on local. First make sure you've added these hosts to your `/etc/hosts` file (and clear your DNS cache afterwards):

```
127.0.0.1       cloud-dev.terpusat.com
127.0.0.1       pawon-dev.terpusat.com
127.0.0.1       secureshell-dev.terpusat.com
```

Then, make sure you've installed `node` version `24` and `pnpm` at least version `10`.

```sh
nvm install 24
nvm use 24
npm install -g pnpm@10
pnpm --version
```

Make sure you have caddy installed:

```sh
brew install caddy
```

Run the installation on the project directory:

```sh
pnpm i
```

Make sure the dPanel manager API is running on `localhost:9100` with `the manager's development config`. If you test browser SSH, also run Secure Shell on `localhost:9101`. The local frontend uses `.env.development`, which points API calls to `https://pawon-dev.terpusat.com/api`; Caddy proxies that domain to the manager.

Run `caddy` by executing `caddy run`. Finally, run the development server:

```bash
export BASE_PATH="/"
pnpm dev
```

Open [https://cloud-dev.terpusat.com/](https://cloud-dev.terpusat.com/) with your browser to see the result.

Use the HTTPS `cloud-dev.terpusat.com` URL for browser testing instead of `localhost:3000`. The dPanel development session cookie is secure and scoped to `terpusat.com`, so local auth works through the Caddy domains.

## Troubleshoot

### Your connection is not private (HSTS)

For Google Chrome, you can type `thisisunsafe` anywhere on the warning page and it will load it without warning.
