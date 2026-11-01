import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const isEnabled = (value: string | undefined) =>
  value === 'true' || value === '1';

/** The signed-in app's empty shell, written to `app-shell.html`. */
const APP_SHELL_PATH = '/app-shell';

/** Where the static build starts crawling for public pages. */
const PUBLIC_ENTRY_PAGES = ['/', '/docs/intro'];

/**
 * The pages the static build writes out: the home page and every docs page.
 * Bare `/docs` and `/docs/<section>` only redirect, so `_redirects` handles
 * them; the signed-in app is never prerendered.
 */
function isPublicPrerenderPath(path: string) {
  // `/page#heading` is the same page; fetching it again only rewrites it.
  if (/[?#]/.test(path)) return false;
  const clean = path;
  return (
    clean === '/' ||
    clean === APP_SHELL_PATH ||
    /^\/docs\/(intro|[a-z0-9-]+\/[a-z0-9-]+)$/.test(clean)
  );
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isStaticPrerender: boolean =
    isEnabled(env.STATIC_PRERENDER || process.env.STATIC_PRERENDER) ||
    isEnabled(env.VITE_STATIC_PRERENDER || process.env.VITE_STATIC_PRERENDER);
  const isStaticSpa: boolean =
    isEnabled(env.STATIC_SPA || process.env.STATIC_SPA) ||
    isEnabled(env.VITE_STATIC_SPA || process.env.VITE_STATIC_SPA);
  const isStaticBuild: boolean = isStaticPrerender || isStaticSpa;
  const BUILD_DIR: string =
    env.BUILD_DIR ||
    process.env.BUILD_DIR ||
    (isStaticBuild ? '.output-static' : '.output');
  const BASE_PATH: string = env.BASE_PATH || process.env.BASE_PATH || '/';
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const isVitest = mode === 'test' || process.env.VITEST === 'true';
  const ALLOWED_HOSTS: string[] | true = env.ALLOWED_HOSTS
    ? JSON.parse(env.ALLOWED_HOSTS || '["*"]')
    : true;

  return {
    build: {
      outDir: BUILD_DIR,
    },
    base: BASE_PATH,
    server: {
      allowedHosts: ALLOWED_HOSTS,
    },
    plugins: [
      devtools({
        removeDevtoolsOnBuild: isProduction,
      }),
      ...(isStaticBuild
        ? []
        : [
            nitro({
              baseURL: BASE_PATH,
              output: {
                dir: BUILD_DIR,
              },
            }),
          ]),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        router: {
          routesDirectory: './app',
        },
        ...(isStaticSpa
          ? {
              // The public pages (home and docs) are written out as real HTML
              // for search engines and AI crawlers. The signed-in app is
              // served from one empty shell, `app-shell.html`, through the
              // `_redirects` that `scripts/seo/postbuild.mjs` writes.
              spa: {
                enabled: true,
                // Not `/`: prerendering dedupes by path, and `/` is the home
                // page. The shell renders no route, so its own path will do.
                maskPath: APP_SHELL_PATH,
                prerender: {
                  outputPath: APP_SHELL_PATH,
                  crawlLinks: false,
                  retryCount: 0,
                },
              },
              pages: PUBLIC_ENTRY_PAGES.map((path) => ({ path })),
              prerender: {
                enabled: true,
                autoStaticPathsDiscovery: false,
                // `/docs/intro.html`, served at `/docs/intro` with no slash.
                autoSubfolderIndex: false,
                // Follow links from the entry pages to find every docs page,
                // but only ever write out public ones.
                crawlLinks: true,
                filter: ({ path }) => isPublicPrerenderPath(path),
                failOnError: true,
              },
            }
          : isStaticPrerender
            ? {
                prerender: {
                  enabled: true,
                  autoSubfolderIndex: true,
                  autoStaticPathsDiscovery: true,
                  crawlLinks: true,
                  failOnError: true,
                },
              }
            : {}),
      }),
      viteReact(
        isVitest
          ? {}
          : {
              babel: {
                plugins: ['babel-plugin-react-compiler'],
              },
            },
      ),
    ],
  };
});

export default config;
