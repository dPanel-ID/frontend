import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  allowsCustomValue,
  isAcceptedValue,
  isCustomValue,
} from './version-choice';

const goInput: DTOs.ModuleInputV1 = {
  name: 'golang_version',
  label: 'Go Version',
  type: 'string',
  required: true,
  options: ['1.27.3', '1.27.2'],
  allow_custom: true,
  pattern: '[0-9]+\\.[0-9]+(\\.[0-9]+)?',
};

const scopeInput: DTOs.ModuleInputV1 = {
  name: 'ruby_scope',
  label: 'Scope',
  type: 'string',
  required: true,
  options: ['system', 'user'],
};

describe('version choice', () => {
  it('offers a custom value only with allow_custom and a pattern', () => {
    expect(allowsCustomValue(goInput)).toBe(true);
    expect(allowsCustomValue(scopeInput)).toBe(false);
    expect(allowsCustomValue({ ...goInput, pattern: undefined })).toBe(false);
  });

  it('tells listed values from custom ones', () => {
    expect(isCustomValue(goInput, '1.27.3')).toBe(false);
    expect(isCustomValue(goInput, '1.25.9')).toBe(true);
    expect(isCustomValue(goInput, '')).toBe(false);
  });

  it.each([
    ['1.27.3', true],
    ['1.25.9', true],
    ['1.25', true],
    ['1.25.x', false],
    ["{{ lookup('pipe','id') }}", false],
    ['1.27.1; rm -rf /', false],
  ])('accepts %s for Go: %s', (value, accepted) => {
    expect(isAcceptedValue(goInput, value)).toBe(accepted);
  });

  it('keeps a fixed list fixed', () => {
    expect(isAcceptedValue(scopeInput, 'user')).toBe(true);
    expect(isAcceptedValue(scopeInput, 'global')).toBe(false);
  });
});
