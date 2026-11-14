import type { DTOs } from '@/shared/api';

/**
 * A field the user must fill. A checkbox always has a value, on or off, so
 * it is never one, even when an older manifest marks it required.
 */
export function isRequiredInput(input: DTOs.ModuleInputV1) {
  return Boolean(input.required) && input.type !== 'boolean';
}

export function isHiddenInput(input: DTOs.ModuleInputV1) {
  return input.type === 'hidden';
}
