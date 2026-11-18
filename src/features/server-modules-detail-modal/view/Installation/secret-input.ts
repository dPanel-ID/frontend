import type { DTOs } from '@/shared/api';
import {
  GENERATED_PASSWORD_LENGTH,
  generatePassword,
} from '@/shared/libs/browser/password';
import type { RandomBytes } from '@/shared/libs/browser/password';

import { isAcceptedValue } from './version-choice';

/** Tries before giving up on an input whose pattern rejects every draw. */
const MAX_ATTEMPTS = 32;

/** A secret the operator types, such as a database administrator password. */
export function isSecretInput(input: DTOs.ModuleInputV1) {
  return Boolean(input.sensitive) && input.type !== 'boolean';
}

/**
 * The length a generated value for input takes: the CLI's 24 characters,
 * raised to the input's minimum and lowered to its maximum where it sets
 * them (a minimum wins over a smaller maximum).
 */
export function generatedSecretLength(input: DTOs.ModuleInputV1) {
  let length = GENERATED_PASSWORD_LENGTH;
  if (typeof input.max === 'number' && input.max > 0) {
    length = Math.min(length, input.max);
  }
  if (typeof input.min === 'number' && input.min > length) {
    length = input.min;
  }
  return length;
}

/**
 * A password for a secret input, generated the way the CLI does and checked
 * against the input's own pattern. Returns undefined when no draw passes.
 */
export function generateSecretFor(
  input: DTOs.ModuleInputV1,
  randomBytes?: RandomBytes,
): string | undefined {
  const length = generatedSecretLength(input);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const value = generatePassword(length, randomBytes);
    if (isAcceptedValue(input, value)) return value;
  }
  return undefined;
}
