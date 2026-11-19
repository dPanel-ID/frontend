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
 * A random password from alphabet (GENERATED_PASSWORD_ALPHABET by default,
 * at most 256 characters). Bytes at or above the
 * largest multiple of the alphabet size are thrown away (rejection
 * sampling), so every character is equally likely: a plain byte % size would
 * favour the first characters.
 */
export function generatePassword(
  length = GENERATED_PASSWORD_LENGTH,
  randomBytes: RandomBytes = cryptoRandomBytes,
  alphabet = GENERATED_PASSWORD_ALPHABET,
): string {
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

/**
 * Characters of a generated cloud VM password: letters and digits only,
 * without look-alikes. Biznet Gio rejects symbols in console passwords, and
 * the same set suits every other provider, as the API's own generator does.
 */
export const VM_PASSWORD_ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Tries before giving up on a draw without each character class. */
const VM_PASSWORD_ATTEMPTS = 64;

/**
 * A first password for a new cloud VM: 24 letters and digits with at least
 * one lowercase letter, one uppercase letter and one digit, as IDCloudHost
 * and Biznet Gio require. Returns undefined only when every draw misses a
 * class, which a working random source practically never does.
 */
export function generateVMPassword(
  randomBytes: RandomBytes = cryptoRandomBytes,
): string | undefined {
  for (let attempt = 0; attempt < VM_PASSWORD_ATTEMPTS; attempt += 1) {
    const password = generatePassword(
      GENERATED_PASSWORD_LENGTH,
      randomBytes,
      VM_PASSWORD_ALPHABET,
    );
    if (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    ) {
      return password;
    }
  }
  return undefined;
}
