// Builds the contract the mock API serves.
//
// Input:  mock/swagger.json      a snapshot of the backend's public Swagger
//                                contract (refresh with `pnpm mock:spec`)
//         mock/examples/*.json   hand-written example responses
// Output: .mock/openapi.json     what Prism serves (gitignored)
//
// Prism answers each request with the response example from the contract.
// The backend's contract has few examples, so Prism would otherwise invent
// values like "string" for every field. The files under mock/examples fill in
// realistic data for the pages a contributor opens first.
//
// Each example file is an object keyed by "METHOD /api/v1/path", matching the
// path exactly as the contract writes it (with {id} placeholders):
//
//   { "GET /api/v1/user/profile": { "code": 200, "data": { ... } } }
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const specPath = path.join(root, 'mock/swagger.json');
const examplesDir = path.join(root, 'mock/examples');
const outPath = path.join(root, '.mock/openapi.json');

/**
 * The frontend sends the workspace header only once a workspace is chosen,
 * and machine-to-machine headers never. Prism rejects a request that misses a
 * required header, so the mock treats them all as optional.
 */
const OPTIONAL_HEADERS = new Set([
  'x-auth-organization-id',
  'x-dpanel-service-token',
  'x-dpanel-executor-token',
]);

async function readExamples() {
  const files = (await readdir(examplesDir))
    .filter((name) => name.endsWith('.json'))
    .sort();
  const examples = new Map();
  for (const file of files) {
    const entries = JSON.parse(
      await readFile(path.join(examplesDir, file), 'utf8'),
    );
    for (const [key, body] of Object.entries(entries)) {
      if (examples.has(key)) {
        throw new Error(`${file}: "${key}" is already defined in another file`);
      }
      examples.set(key, { file, body });
    }
  }
  return examples;
}

function relaxHeaders(operation) {
  for (const parameter of operation.parameters ?? []) {
    if (
      parameter.in === 'header' &&
      OPTIONAL_HEADERS.has(String(parameter.name).toLowerCase())
    ) {
      parameter.required = false;
    }
  }
}

function successStatus(operation) {
  return (
    Object.keys(operation.responses ?? {}).find((code) =>
      code.startsWith('2'),
    ) ?? '200'
  );
}

async function main() {
  const spec = JSON.parse(await readFile(specPath, 'utf8'));
  const examples = await readExamples();
  const unused = new Set(examples.keys());

  spec.host = undefined;
  spec.schemes = ['http'];

  // Every endpoint answers with the same envelope. Without these, Prism
  // generates `code: 0`, which the app reads as a failed request.
  const envelope =
    spec.definitions?.[
      'github_com_devetek_d-panel_internal_response.JSONResponse'
    ];
  if (!envelope?.properties) {
    throw new Error('mock/swagger.json has no JSONResponse envelope');
  }
  envelope.properties.code = { type: 'integer', example: 200 };
  envelope.properties.status = { type: 'string', example: 'success' };

  for (const [route, item] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      if (typeof operation !== 'object' || !operation.responses) continue;
      relaxHeaders(operation);

      const key = `${method.toUpperCase()} ${route}`;
      const example = examples.get(key);
      if (!example) continue;
      unused.delete(key);

      const status = successStatus(operation);
      operation.responses[status] ??= { description: 'OK' };
      operation.responses[status].examples = {
        'application/json': example.body,
      };
    }
  }

  if (unused.size > 0) {
    const list = [...unused]
      .map((key) => `  ${key} (${examples.get(key).file})`)
      .join('\n');
    throw new Error(
      `These examples match no operation in mock/swagger.json:\n${list}\n` +
        'Fix the key, or refresh the contract with `pnpm mock:spec`.',
    );
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(spec));
  console.log(
    `mock: wrote ${path.relative(root, outPath)} with ${examples.size} example responses`,
  );
}

main().catch((error) => {
  console.error(`mock: ${error.message}`);
  process.exit(1);
});
