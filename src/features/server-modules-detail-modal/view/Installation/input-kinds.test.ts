import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { isHiddenInput, isRequiredInput } from './input-kinds';

const input = (fields: Partial<DTOs.ModuleInputV1>) =>
  ({ name: 'x', type: 'string', ...fields }) as DTOs.ModuleInputV1;

describe('isRequiredInput', () => {
  // "Set As Default" was a checkbox marked required.
  it('never requires a checkbox, even when the manifest says required', () => {
    expect(isRequiredInput(input({ type: 'boolean', required: true }))).toBe(
      false,
    );
  });

  it('requires a required text field', () => {
    expect(isRequiredInput(input({ required: true }))).toBe(true);
  });

  it('does not require an optional field', () => {
    expect(isRequiredInput(input({ required: false }))).toBe(false);
  });
});

describe('isHiddenInput', () => {
  it('hides a field dPanel sets itself', () => {
    expect(isHiddenInput(input({ type: 'hidden' }))).toBe(true);
    expect(isHiddenInput(input({ type: 'string' }))).toBe(false);
  });
});
