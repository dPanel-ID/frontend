// `pnpm dev:mock`: runs the frontend against a simulated backend.
//
// 1. Builds .mock/openapi.json from the Swagger snapshot and the examples.
// 2. Starts Prism on 127.0.0.1:4010 serving that contract.
// 3. Starts the Vite dev server in `mock` mode, which reads .env.mock and
//    points the app's API base URL at Prism.
//
// Ctrl+C stops both.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
// .env.mock points VITE_BACKEND at this port.
const port = '4010';
const children = [];

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
  children.push(child);
  return child;
}

function stopAll(code = 0) {
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

const prepare = run(process.execPath, ['scripts/mock/prepare-spec.mjs']);
prepare.on('exit', (code) => {
  if (code !== 0) stopAll(code ?? 1);

  const prism = run('pnpm', [
    'exec',
    'prism',
    'mock',
    '.mock/openapi.json',
    '--host',
    '127.0.0.1',
    '--port',
    port,
    '--verboseLevel',
    'warn',
  ]);
  const vite = run('pnpm', [
    'exec',
    'vite',
    'dev',
    '--mode',
    'mock',
    '--port',
    '3000',
  ]);

  for (const child of [prism, vite]) {
    child.on('exit', (exitCode) => stopAll(exitCode ?? 0));
  }
});
