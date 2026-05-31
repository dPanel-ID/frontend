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
  const BUILD_DIR: string =
    env.BUILD_DIR ||
    process.env.BUILD_DIR ||
    (isStaticPrerender ? '.output-static' : '.output');
  const BASE_PATH: string = env.BASE_PATH || process.env.BASE_PATH || '/';
  const isProduction: boolean = process.env.NODE_ENV === 'production';
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
      ...(isStaticPrerender
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
        ...(isStaticPrerender
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
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
  };
});

export default config;
