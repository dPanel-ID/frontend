/**
 * Characters a generated password uses: without the look-alikes l, I, O, 0
 * and 1, and with nothing a shell or a SQL console treats specially, so it
 * can be pasted anywhere by hand. The same 59 characters as the dnocs CLI
 * generator.
 */
export const GENERATED_PASSWORD_ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_';

/** Length of a generated password, the same as the dnocs CLI. */
export const GENERATED_PASSWORD_LENGTH = 24;

/** Fills bytes with random values; crypto.getRandomValues by default. */
export type RandomBytes = (bytes: Uint8Array) => void;

const cryptoRandomBytes: RandomBytes = (bytes) => {
  crypto.getRandomValues(bytes);
};

/**
 * A random password from GENERATED_PASSWORD_ALPHABET. Bytes at or above the
 * largest multiple of the alphabet size are thrown away (rejection
 * sampling), so every character is equally likely: a plain byte % size would
 * favour the first characters.
 */
export function generatePassword(
  length = GENERATED_PASSWORD_LENGTH,
  randomBytes: RandomBytes = cryptoRandomBytes,
): string {
  const alphabet = GENERATED_PASSWORD_ALPHABET;
  const size = alphabet.length;
  const limit = 256 - (256 % size);
  const buffer = new Uint8Array(Math.max(length, 16));
  let password = '';

  while (password.length < length) {
    randomBytes(buffer);
    for (const byte of buffer) {
      if (byte >= limit) continue;
      password += alphabet.charAt(byte % size);
      if (password.length === length) break;
    }
  }

  return password;
}
