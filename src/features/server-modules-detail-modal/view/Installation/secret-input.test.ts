import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  generateSecretFor,
  generatedSecretLength,
  isSecretInput,
} from './secret-input';

function input(extra: Partial<DTOs.ModuleInputV1> = {}): DTOs.ModuleInputV1 {
  return {
    name: 'postgresql_admin_password',
    label: 'Admin password',
    type: 'string',
    required: true,
    sensitive: true,
    ...extra,
  };
}

describe('isSecretInput', () => {
  it('is a sensitive input that is not a checkbox', () => {
    expect(isSecretInput(input())).toBe(true);
    expect(isSecretInput(input({ sensitive: false }))).toBe(false);
    expect(isSecretInput(input({ type: 'boolean' }))).toBe(false);
  });
});

describe('generatedSecretLength', () => {
  it('uses 24 characters, within the input bounds', () => {
    expect(generatedSecretLength(input())).toBe(24);
    // mongodb admin_password needs 8, redis_requirepass 16: 24 covers both.
    expect(generatedSecretLength(input({ min: 8 }))).toBe(24);
    expect(generatedSecretLength(input({ min: 16 }))).toBe(24);
    expect(generatedSecretLength(input({ min: 32 }))).toBe(32);
    expect(generatedSecretLength(input({ max: 20 }))).toBe(20);
    expect(generatedSecretLength(input({ min: 30, max: 20 }))).toBe(30);
  });
});

describe('generateSecretFor', () => {
  it('generates a value the input accepts', () => {
    const value = generateSecretFor(input({ pattern: '[A-Za-z0-9_-]{16,}' }));
    expect(value).toHaveLength(24);
    expect(value).toMatch(/^[A-Za-z0-9_-]{16,}$/);
  });

  it('gives up when the pattern rejects everything', () => {
    expect(generateSecretFor(input({ pattern: '[!]+' }))).toBeUndefined();
  });
});
