import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const isEnabled = (value: string | undefined) =>
  value === 'true' || value === '1';

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
              spa: {
                enabled: true,
                maskPath: '/',
                prerender: {
                  outputPath: '/index',
                  crawlLinks: false,
                  retryCount: 0,
                },
              },
              prerender: {
                enabled: true,
                autoStaticPathsDiscovery: false,
                crawlLinks: false,
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
