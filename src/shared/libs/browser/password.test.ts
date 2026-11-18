import { describe, expect, it } from 'vitest';

import {
  GENERATED_PASSWORD_ALPHABET,
  GENERATED_PASSWORD_LENGTH,
  generatePassword,
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
