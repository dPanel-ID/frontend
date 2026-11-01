import type { DTOs } from '@/shared/api';

/** Select value standing for "type a version yourself". */
export const CUSTOM_CHOICE = '__custom__';

/** Longest custom value the API accepts. */
export const MAX_CUSTOM_LENGTH = 64;

/** True when the input offers a list but also takes a typed value. */
export function allowsCustomValue(input: DTOs.ModuleInputV1) {
  return Boolean(input.options?.length && input.allow_custom && input.pattern);
}

/** True when value is not one of the listed options. */
export function isCustomValue(input: DTOs.ModuleInputV1, value: string) {
  return value !== '' && !(input.options ?? []).includes(value);
}

/**
 * Whether value is acceptable for input, mirroring the API's check: a listed
 * option always is; anything else must match the input's pattern in full.
 */
export function isAcceptedValue(input: DTOs.ModuleInputV1, value: string) {
  const text = value.trim();
  if (text === '' || (input.options ?? []).includes(text)) return true;
  if (input.options?.length && !input.allow_custom) return false;
  if (!input.pattern) return true;
  if (text.length > MAX_CUSTOM_LENGTH) return false;
  try {
    return new RegExp(`^(?:${input.pattern})$`).test(text);
  } catch {
    return false;
  }
}
