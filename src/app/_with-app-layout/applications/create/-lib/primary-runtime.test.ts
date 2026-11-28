import { describe, expect, it } from 'vitest';

import { orderRuntimesByPrimary, runtimeKey } from './primary-runtime';

describe('runtimeKey', () => {
  it.each([
    ['php', 'php'],
    ['PHP', 'php'],
    ['php:mise', 'php'],
    ['dpanel.php', 'php'],
    [' nodejs ', 'nodejs'],
    ['', ''],
    [undefined, ''],
  ])('reads %j as %j', (name, key) => {
    expect(runtimeKey(name)).toBe(key);
  });
});

describe('orderRuntimesByPrimary', () => {
  const node = { name: 'nodejs', version: '22.23.5' };
  const php = { name: 'php', version: '8.4' };
  const python = { name: 'python', version: '3.13' };

  // A Laravel app listed Node.js first and was saved with Node.js as its
  // language (2026-11-28).
  it('puts the preferred language first', () => {
    expect(orderRuntimesByPrimary([node, php], 'php')).toEqual([php, node]);
  });

  it('matches a namespaced or suffixed module name', () => {
    expect(orderRuntimesByPrimary([node, { name: 'php:mise' }], 'php')).toEqual(
      [{ name: 'php:mise' }, node],
    );
  });

  it('keeps the order of the others', () => {
    expect(orderRuntimesByPrimary([node, python, php], 'php')).toEqual([
      php,
      node,
      python,
    ]);
  });

  it('leaves the list alone when the preferred one is first or missing', () => {
    const runtimes = [php, node];
    expect(orderRuntimesByPrimary(runtimes, 'php')).toBe(runtimes);
    expect(orderRuntimesByPrimary(runtimes, 'ruby')).toBe(runtimes);
    expect(orderRuntimesByPrimary(runtimes, '')).toBe(runtimes);
    expect(orderRuntimesByPrimary(runtimes, undefined)).toBe(runtimes);
  });
});
