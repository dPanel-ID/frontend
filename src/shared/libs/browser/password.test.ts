import { describe, expect, it } from 'vitest';

import {
  GENERATED_PASSWORD_ALPHABET,
  GENERATED_PASSWORD_LENGTH,
  VM_PASSWORD_ALPHABET,
  generatePassword,
  generateVMPassword,
} from './password';

describe('generatePassword', () => {
  it('is 24 characters from the CLI alphabet by default', () => {
    for (let run = 0; run < 50; run += 1) {
      const password = generatePassword();
      expect(password).toHaveLength(GENERATED_PASSWORD_LENGTH);
      expect(password).toMatch(/^[a-km-zA-HJ-NP-Z2-9_-]+$/);
      for (const char of password) {
        expect(GENERATED_PASSWORD_ALPHABET).toContain(char);
      }
    }
  });

  it('matches the CLI alphabet exactly', () => {
    expect(GENERATED_PASSWORD_ALPHABET).toBe(
      'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_',
    );
    expect(GENERATED_PASSWORD_ALPHABET).toHaveLength(59);
  });

  it('honours a requested length', () => {
    expect(generatePassword(32)).toHaveLength(32);
    expect(generatePassword(8)).toHaveLength(8);
  });

  it('throws away bytes that would bias the result', () => {
    // 236 is the largest multiple of 59 up to 256: 236..255 must be
    // skipped, not folded onto the first characters with a modulo.
    const bytes = [255, 236, 0, 235, 59, 58];
    let cursor = 0;
    const password = generatePassword(4, (buffer) => {
      for (let index = 0; index < buffer.length; index += 1) {
        buffer[index] = bytes[cursor % bytes.length] ?? 0;
        cursor += 1;
      }
    });
    const alphabet = GENERATED_PASSWORD_ALPHABET;
    expect(password).toBe(
      alphabet.charAt(0) +
        alphabet.charAt(235 % 59) +
        alphabet.charAt(0) +
        alphabet.charAt(58),
    );
  });

  it('gives every character the same chance', () => {
    // Feed every byte value in turn: with rejection sampling each of the 59
    // characters comes out exactly four times per 256 bytes (236 / 59).
    let next = 0;
    const counts = new Map<string, number>();
    const password = generatePassword(236 * 3, (buffer) => {
      for (let index = 0; index < buffer.length; index += 1) {
        buffer[index] = next % 256;
        next += 1;
      }
    });
    for (const char of password) {
      counts.set(char, (counts.get(char) ?? 0) + 1);
    }
    expect(counts.size).toBe(59);
    expect(new Set(counts.values())).toEqual(new Set([12]));
  });
});

describe('generateVMPassword', () => {
  it('is 24 letters and digits with each character class', () => {
    for (let run = 0; run < 200; run += 1) {
      const password = generateVMPassword();
      expect(password).toHaveLength(GENERATED_PASSWORD_LENGTH);
      expect(password).toMatch(/^[a-km-zA-HJ-NP-Z2-9]+$/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
    }
  });

  it('meets the launch form password rule', () => {
    const rule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    expect(generateVMPassword()).toMatch(rule);
  });

  it('draws again when a password misses a character class', () => {
    // The first 24 usable bytes map to "a" only; the next draw mixes all
    // three classes.
    let call = 0;
    const password = generateVMPassword((buffer) => {
      for (let index = 0; index < buffer.length; index += 1) {
        buffer[index] = call === 0 ? 0 : ([0, 25, 49][index % 3] ?? 0);
      }
      call += 1;
    });
    expect(call).toBe(2);
    expect(password).toBe(
      (
        VM_PASSWORD_ALPHABET.charAt(0) +
        VM_PASSWORD_ALPHABET.charAt(25) +
        VM_PASSWORD_ALPHABET.charAt(49)
      ).repeat(8),
    );
  });

  it('gives up rather than loop forever on a broken random source', () => {
    expect(generateVMPassword((buffer) => buffer.fill(0))).toBeUndefined();
  });
});
