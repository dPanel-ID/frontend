import { describe, expect, it } from 'vitest';

import { isValidApplicationName } from './application-name';

describe('isValidApplicationName', () => {
  it.each([
    ['My App', true],
    ['site', true],
    ['App 2', true],
    ['  Padded name  ', true],
    ['my-app', false],
    ['my_app', false],
    ['my.app', false],
    ['café', false],
    ['', false],
    ['   ', false],
  ])('%j is valid: %s', (name, expected) => {
    expect(isValidApplicationName(name)).toBe(expected);
  });
});
