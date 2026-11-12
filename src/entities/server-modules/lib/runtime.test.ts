import { describe, expect, it } from 'vitest';

import { runtimeInstaller } from './runtime';

describe('runtimeInstaller', () => {
  it.each([
    [{ module_name: 'nodejs', installation_key: 'nodejs@24.22.3:mise' }, 'new'],
    [{ module_name: 'php', installation_key: 'php@8.4:mise' }, 'new'],
    [
      { module_name: 'nodejs', installation_key: 'nodejs@26.13.0:system' },
      'previous',
    ],
    [
      { module_name: 'python', installation_key: 'python@3.12.4:application' },
      'previous',
    ],
    [{ module_name: 'redis', installation_key: 'redis' }, null],
    [{ module_name: 'mariadb', installation_key: 'mariadb@11.4:system' }, null],
  ])('reads %j', (installation, want) => {
    expect(runtimeInstaller(installation)).toBe(want);
  });
});
