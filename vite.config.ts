import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BUILD_DIR: string = env.BUILD_DIR || '.output';
  const BASE_PATH: string = env.BASE_PATH || '/';
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
      nitro({
        baseURL: BASE_PATH,
        output: {
          dir: BUILD_DIR,
        },
      }),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        router: {
          routesDirectory: './app',
        },
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
